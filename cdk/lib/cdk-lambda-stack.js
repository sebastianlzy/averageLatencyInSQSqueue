const { Stack, Duration, CfnOutput } = require('aws-cdk-lib');
const sqs = require('aws-cdk-lib/aws-sqs');
const sns = require('aws-cdk-lib/aws-sns');
const snsSubscription = require('aws-cdk-lib/aws-sns-subscriptions');
const lambda = require('aws-cdk-lib/aws-lambda');
const fs = require('fs');
const path = require('path')


class CdkLambdaStack extends Stack {
    /**
     *
     * @param {Construct} scope
     * @param {string} id
     * @param {{stackName: string}} props
     */
    constructor(scope, id, props) {
        super(scope, id, props);

        const lambdaFunction = new lambda.Function(this, 'latencySQSLambda', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.main',
            code: lambda.Code.fromAsset(path.join(__dirname, '../../src')),
            timeout: Duration.seconds(900),
            memorySize: 512
        });

    }
}

module.exports = { CdkLambdaStack }
