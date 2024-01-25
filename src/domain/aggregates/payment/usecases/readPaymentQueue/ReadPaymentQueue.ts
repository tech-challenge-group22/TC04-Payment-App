import UseCaseInterface from '../../../../sharedKernel/usecase/UseCaseInterface';
import IPaymentQueue from '../../interfaces/IPaymentQueue';
import { PaymentGatewayInterface } from '../../interfaces/gateways/PaymentGatewayInterface';
import { MercadoPago } from '../../services/MercadoPago';
import PaymentCheckout from '../../usecases/paymentCheckout/PaymentCheckout';
import { PaymentCheckoutInputDTO } from '../paymentCheckout/PaymentCheckoutDTO';

export default class ReadPaymentQueue implements UseCaseInterface {
  private readonly paymentGateway: PaymentGatewayInterface;
  private readonly paymentQueue: IPaymentQueue;
  private readonly paymentProvider: MercadoPago;

  constructor(
    private _paymentGateway: PaymentGatewayInterface,
    private _paymentQueue: IPaymentQueue,
    private _paymentProvider: MercadoPago,
  ) {
    this.paymentGateway = _paymentGateway;
    this.paymentQueue = _paymentQueue;
    this.paymentProvider = _paymentProvider;
  }
  async execute() {
    try {
      // Resgatando da Fila do SQS
      const inputMessage: any = this.paymentQueue.receiveMessage();
      const msgJson = JSON.parse(inputMessage);

      if (inputMessage) {
        const paymentCheckout = new PaymentCheckout(
          this.paymentGateway,
          this.paymentProvider,
        );

        const input: PaymentCheckoutInputDTO = {
          order_items: [],
          orderId: msgJson.order_id,
          paymentMethod: msgJson.paymentMethod,
        };
        const result: any = paymentCheckout.execute(input);

        return result;
      }
    } catch {
      return {
        hasError: true,
        message: 'Failed process payment',
      };
    }
  }
}