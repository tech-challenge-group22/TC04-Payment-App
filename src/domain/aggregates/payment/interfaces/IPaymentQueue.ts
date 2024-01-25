export default interface IPaymentQueue {
  sendMessage(message: string): any;
  receiveMessage(): any;
  messageID(): number;
}
