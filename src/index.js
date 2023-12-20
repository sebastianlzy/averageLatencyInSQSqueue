const {SQSClient, GetQueueAttributesCommand, SendMessageBatchCommand} = require("@aws-sdk/client-sqs");
const {SNSClient, PublishBatchCommand} = require("@aws-sdk/client-sns");
const {v4: uuidv4} = require('uuid');

const sqsClient = new SQSClient();
const snsClient = new SNSClient();


const sendMessageToQueue = async () => {


    const createEntry = () => {
        const uuid = uuidv4()
        const date = new Date();

        return { // SendMessageBatchRequestEntry
            Id: uuid, // required
            MessageBody: `Created message at ${date.toISOString()}`, // required
        }
    }

    const entries = []
    for (let i = 0; i < 10; i++) {
        entries.push(createEntry())
    }

    const input = { // SendMessageBatchRequest
        QueueUrl: process.env.SQS_QUEUE_URL, // required
        Entries: entries
    };
    const command = new SendMessageBatchCommand(input);
    return await sqsClient.send(command);

}

const sendMessagesToQueue = async (noOfMessageInTens = 1) => {
    for (let i = 0; i < noOfMessageInTens; i++) {
        try {

            const response = await sendMessageToQueue()
            console.log(response)
            // process data.
        } catch (error) {
            console.log(error)
            // error handling.
        } finally {
            // finally.
        }
    }
}

const sendMessageToSNSTopic = async (noOfMessage = 10, topicArn) => {
    const createMessage = () => {
        const uuid = uuidv4()
        const date = new Date();

        return { // SendMessageBatchRequestEntry
            Id: uuid, // required
            Message: uuid, // required
            Subject: `message created at ${date}}`
        }
    }

    const entries = []
    for (let i = 0; i < noOfMessage; i++) {
        entries.push(createMessage())
    }

    const input = {
        TopicArn: topicArn,
        PublishBatchRequestEntries: entries
    };
    const command = new PublishBatchCommand(input);
    return await snsClient.send(command);
}

const sendMessagesToTopic = async (noOfMessageInTens = 1, topicArn) => {
    for (let i = 0; i < noOfMessageInTens; i++) {
        try {

            const response = await sendMessageToSNSTopic(10, topicArn)
            console.log(response)
            // process data.
        } catch (error) {
            console.log(error)
            // error handling.
        } finally {
            // finally.
        }
    }
}

const getApproximateNumberOfMessages = async () => {
    const input = { // GetQueueAttributesRequest
        QueueUrl: process.env.SQS_QUEUE_URL, // required
        AttributeNames: ["All"]
    };
    const command = new GetQueueAttributesCommand(input);
    return await sqsClient.send(command);
}

const main = async () => {
    // await sendMessagesToQueue(5000)
    const topicArn = process.env.snsTopicArnCdkQueueStack0
    for (let i = 0; i < 5; i++) {
        const topicArn = process.env[`snsTopicArnCdkQueueStack${i}`]
        await sendMessagesToTopic(1, topicArn)
    }

    // console.log(await getApproximateNumberOfMessages())
}

main()