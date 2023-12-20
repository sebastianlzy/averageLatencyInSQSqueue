const {SQSClient, GetQueueAttributesCommand, SendMessageBatchCommand} = require("@aws-sdk/client-sqs");
const {SNSClient, PublishBatchCommand} = require("@aws-sdk/client-sns");
const cdkOutput = require("./cdk-outputs.json")

const sqsClient = new SQSClient();
const snsClient = new SNSClient();


const { performance, PerformanceObserver } = require("perf_hooks")

const perfObserver = new PerformanceObserver((items) => {
    items.getEntries().forEach((entry) => {
        console.log(entry)
    })
})

perfObserver.observe({ entryTypes: ["measure"], buffer: true })

const sendMessageToQueue = async () => {


    const createEntry = (idx) => {
        
        const date = new Date();

        return { // SendMessageBatchRequestEntry
            Id: `${Date.now()}-${idx}`, // required
            MessageBody: `Created message at ${date.toISOString()}`, // required
        }
    }

    const entries = []
    for (let i = 0; i < 10; i++) {
        entries.push(createEntry(i))
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
    const createMessage = (idx) => {
        const uuid = `${Date.now()}-${idx}`
        const date = new Date();

        return { // SendMessageBatchRequestEntry
            Id: uuid, // required
            Message: uuid, // required
            Subject: `message created at ${date}}`
        }
    }

    const entries = []
    for (let i = 0; i < noOfMessage; i++) {
        entries.push(createMessage(i))
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
            // console.log(response)
            // process data.
        } catch (error) {
            console.log(error)
            // error handling.
        } finally {
            // finally.
        }
    }
}

const getApproximateNumberOfMessages = async (queueUrl) => {
    const input = { // GetQueueAttributesRequest
        QueueUrl: queueUrl, // required
        AttributeNames: ["All"]
    };
    const command = new GetQueueAttributesCommand(input);
    const result = await sqsClient.send(command);
    return result['Attributes']['ApproximateNumberOfMessages']
}

const getTopicsArn = (outputs) => {
    
    return Object.keys(outputs).map((key) => {
        const cdkStack = outputs[key]
        const topicKey = `snsTopicArn${key}`.replace(/-/g, "")
        
        return cdkStack[topicKey]
    })
    
}

const getSQSqueueUrls = (outputs) => {
    const queues = []
    Object.keys(outputs).forEach((key) => {
        const cdkStack = outputs[key]
        
        Object.keys(cdkStack).forEach((cdkStackKey) => {
            // console.log(cdkStackKey)    
            if (cdkStackKey.includes(`latencyQueue`)) {
                queues.push(cdkStack[cdkStackKey])
            }
        })
    })
    
    return queues
}

const measurePerformance = async (methodName,cb) => {

    performance.mark(`${methodName}-start`)
    await cb()
    performance.mark(`${methodName}-stop`)
    performance.measure(methodName, `${methodName}-start`, `${methodName}-stop`)
}

const send50000MessagesToQueues = async () =>{
    /**
     * We have a total of 18 topics
     * Each topic has 100 queue subscriptions (i.e. 1800 queues)
     * As a result, we will be adding 50000 messages per queue
     */
    const topicsArn = getTopicsArn(cdkOutput)
    console.log(`sending message to ${topicsArn.length} topics`)

    for (let i = 4; i < topicsArn.length; i++) {
        const topicArn = topicsArn[i]
        const noOfMessageInTens = 5000

        console.log(`sending ${noOfMessageInTens}0 messages to topic ${i}`)
        await sendMessagesToTopic(noOfMessageInTens, topicArn)
    }
}

const main = async () => {
    
    // Sending 50000 messages to 1800 queues
    // await send50000MessagesToQueues()
    
    // Performance measuring in queue
    const methodName = "getApproximateNumberOfMessages"
    const queueUrls = getSQSqueueUrls(cdkOutput)

    await measurePerformance("PerformanceToQuery 1800 queues", async () => {
        
        for (const queueUrl of queueUrls) {
            // measurePerformance(queueUrl, async () => {
                const approximateNumberOfMessage = await getApproximateNumberOfMessages(queueUrl)
                // console.log(`${approximateNumberOfMessage} messages in ${queueUrl}`)
            // })
        }
    })
    
    
    
 
    
    // console.log(await getApproximateNumberOfMessages())
    
}

exports.main = main