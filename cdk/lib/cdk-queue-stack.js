const { Stack, Duration, CfnOutput } = require('aws-cdk-lib');
const sqs = require('aws-cdk-lib/aws-sqs');
const sns = require('aws-cdk-lib/aws-sns');
const snsSubscription = require('aws-cdk-lib/aws-sns-subscriptions');
const fs = require('fs');



class CdkQueueStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {{stackName: string}} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    
    const createSqs = (queueName, stackName, noOfQueues = 1) => {
      const queues = []
      for (let i = 0; i< noOfQueues; i++) {
        const queue = new sqs.Queue(this, `CdkQueue-${stackName}-${i}`, {
          visibilityTimeout: Duration.seconds(30),
          queueName: `${queueName}-${stackName}-${i}`
        });
        queues.push(queue)
      }
      return queues
    }
    
    const createSns = (stackName, topicName) => {
      return new sns.Topic(this, `${stackName}-${topicName}`);
    }

    const subscribeQueuesToSNSTopic = (queues, topic) => {
      for (let i = 0; i< queues.length ; i ++) {
        topic.addSubscription(new snsSubscription.SqsSubscription(queues[i]))
      } 
    }
    
    const queueName = "latencyQueue"
    const snsTopicName = "latencySNS"
    const timestamp = Date.now()



    const stackName = Stack.of(this).stackName;
    const sqsQueues = createSqs(queueName, stackName, 100)
    const snsTopic = createSns(stackName, snsTopicName)
    
    
    subscribeQueuesToSNSTopic(sqsQueues, snsTopic)


    new CfnOutput(this, `snsTopicArn-${stackName}`, {
      value: snsTopic.topicArn,
      description: `snsTopicArn-${stackName}`
    })

    

    // fs.appendFile('../env.txt', `${stackName}_SNS_TOPIC_ARN=${snsTopic.topicArn}\n`, function (err) {
    //   if (err) throw err;
    //   console.log('Saved!');
    // });
  }
}

module.exports = { CdkQueueStack }
