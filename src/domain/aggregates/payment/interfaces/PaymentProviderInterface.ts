export default interface PaymentProviderInterface {
  //makePayment(orderId: number, orderValue: number): boolean;
  makePayment(orderId: number, paymentMethod: number): Promise<boolean>;
}
