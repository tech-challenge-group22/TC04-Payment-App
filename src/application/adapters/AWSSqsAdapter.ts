import IPaymentQueue from '../../domain/aggregates/payment/interfaces/IPaymentQueue';
import * as dotenv from 'dotenv';
import { SQS } from 'aws-sdk';
import cron from 'node-cron';

export default class AWSSQSAdapter implements IPaymentQueue {
  private sqs = new SQS();
  private AWS = require('aws-sdk');
  private static _instance: AWSSQSAdapter;

  private constructor() {
    dotenv.config();

    this.AWS.config.update({ region: process.env.AWS_REGION });

    const polling_interval = Number(process.env.MSG_POLLING_INTERVAL);

    //exemple:
    // cron.schedule('*/5 * * * * *', .....)
    cron.schedule('*/' + polling_interval.toString() + ' * * * * *', () => {
      this.receiveMessage();
    });
  }

  static getInstance(): AWSSQSAdapter {
    if (!this._instance) {
      this._instance = new AWSSQSAdapter();
    }
    return this._instance;
  }

  async sendMessage(message: string) {
    message = 'Id: ' + this.messageID().toString() + ', ' + message;

    const params: SQS.Types.SendMessageRequest = {
      QueueUrl: `${process.env.AWS_OUTPUT_QUEUE_URL}`,
      MessageBody: JSON.stringify(message),
      MessageGroupId: `${process.env.AWS_MESSAGE_GROUP}`,
    };

    try {
      const data = await this.sqs.sendMessage(params).promise();
      console.log('Message sent:', data.MessageId);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  async receiveMessage() {
    try {
      const receiveParams: SQS.Types.ReceiveMessageRequest = {
        QueueUrl: `${process.env.AWS_INPUT_QUEUE_URL}`,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20, // Adjust as needed
      };

      const data = await this.sqs.receiveMessage(receiveParams).promise();

      if (data.Messages && data.Messages.length > 0) {
        const message = data.Messages[0];
        console.log('Received message:', message.Body);

        // Process the message as needed
        const msgBody = JSON.parse(String(message.Body));

        // Delete the message from the queue
        await this.sqs
          .deleteMessage({
            QueueUrl: `${process.env.AWS_INPUT_QUEUE_URL}`,
            ReceiptHandle: message.ReceiptHandle!,
          })
          .promise();
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

  // Implement timestamp logical here
  messageID(): number {
    return Date.now();
  }
}
