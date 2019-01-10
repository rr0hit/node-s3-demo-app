import { S3 } from 'aws-sdk';
import Koa from 'koa';
import koaBody from 'koa-body';
import KoaRouter from 'koa-router';
import koaViews from 'koa-views';
import { createReadStream } from 'fs';
import { join } from 'path';
import uuid from 'uuid/v4';

const app = new Koa();
const router = new KoaRouter();
const s3 = new S3();

const config = {
  httpPort: process.env.HTTP_PORT || 8080,
  s3BucketName: process.env.S3_BUCKET_NAME
};

if (!config.s3BucketName) {
  throw Error('An S3 bucket name must be given using the `S3_BUCKET_NAME` environment variable.');
}

if (!process.env.AWS_ACCESS_KEY_ID) {
  console.info('AWS Credentials were not specified using the `AWS_*` environment variables; credentials will be sourced from AWS CLI configuration or EC2 Instance Profile.');
} else {
  console.info('Using AWS Credentials specified in the `AWS_` environment variables.');
}

router.get('/', async ctx => {
  try {
    const objectList = await s3.listObjectsV2({
      Bucket: config.s3BucketName!,
      MaxKeys: 100
    }).promise();

    const images = (objectList.Contents || [])
      .map(({ Key, LastModified }) => ({
        filename: Key,
        url: s3.getSignedUrl('getObject', {
          Bucket: config.s3BucketName!,
          Key
        })
      }));

    return ctx.render('index', { images });
  } catch (error) {
    return ctx.render('error', { operation: `Listing Objects in S3 bucket '${config.s3BucketName}'`, error });
  }
});

router.post('/upload', async ctx => {
  const key = uuid();

  try {
    const result = await s3.upload({
      Bucket: config.s3BucketName!,
      Key: key,
      Body: createReadStream(ctx.request.files!.file.path),
      ACL: 'public-read'
    }).promise();

    const image = {
      filename: result.Key,
      url: s3.getSignedUrl('getObject', {
        Bucket: config.s3BucketName!,
        Key: result.Key
      })
    };

    return ctx.render('upload', { image });
  } catch (error) {
    return ctx.render('error', { operator: `Uploading object with ID '${key}' to S3 bucket '${config.s3BucketName}'`, error });
  }
});

app.use(koaBody({ multipart: true }));

app.use(koaViews(join(__dirname, 'views'), {
  map: {
    html: 'twig'
  }
}));

app.use(router.routes());

app.listen(config.httpPort);
console.log(`HTTP Server listening on 'http://localhost:${config.httpPort}'`);
