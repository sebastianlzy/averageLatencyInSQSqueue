#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { CdkQueueStack } = require('../lib/cdk-queue-stack');
const { CdkLambdaStack } = require('../lib/cdk-lambda-stack');

const app = new cdk.App();

for (let i = 0; i< 18; i++) {
    new CdkQueueStack(app, `CdkQueueStack-${i}`, {
        stackName: `CdkQueueStack-${i}`
    });    
}

new CdkLambdaStack(app, `CdkLambdaStack`, {stackName: `CdkLambdaStack`});
