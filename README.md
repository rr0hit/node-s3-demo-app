# Node S3 Demo Application

A simple Node application that lists the files in an S3 Bucket, and allows new
files to be uploaded. This application services primarily as a demonstration of
how to configure an application that can communicate with S3 services using
credentials and configuration specified by environment variables.

## Prerequisites

- Node version 8 or later
- An existing S3 Bucket
- An AWS IAM User that has the `ListObjects` and `PutObject` permissions on that
  bucket.

## Installation & Usage

1. Clone this application using Git:
```bash
git clone git@github.com:FountainheadTechnologies/node-s3-demo-app.git
```

2. Install the application dependencies using NPM:
```bash
npm install
```

3. Start the application, specifying the name of the S3 bucket to use as an
   environment variable:
```bash
env S3_BUCKET_NAME=INSERT_YOUR_BUCKET_NAME_HERE npm start
```

## Explicitly specifying AWS Credentials

The application does not explicitly provide any credentials to the underlying S3
library that is used to list and upload objects in a Bucket. Instead, the
library uses the standard method of resolving credentials:

1. Use the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables if they have been set.
2. Use AWS CLI configuration from `~/.aws/credentials` if it is present.
3. Attempt to use the EC2 Instance Profile if it has been configured.

Therefore, in order to use an explicit set of credentials, use environment variables like so:

```bash
env S3_BUCKET_NAME=INSERT_YOUR_BUCKET_NAME_HERE AWS_ACCESS_KEY_ID=INSERT_YOUR_ACCESS_KEY_ID_HERE AWS_SECRET_ACCESS_KEY=INSERT_YOUR_SECRET_ACCESS_KEY_HERE npm start
```

This approach is useful for debugging or experimenting, but highly discouraged
for production scenarios, as your credentials will be stored in your shell
history.

Even if you were to automate the insertion of the variables, they still
need to reside on the machine *somewhere*.

Therefore, the best approach, at least when running on an EC2 Instance, is to
use EC2 Instance Profiles.
