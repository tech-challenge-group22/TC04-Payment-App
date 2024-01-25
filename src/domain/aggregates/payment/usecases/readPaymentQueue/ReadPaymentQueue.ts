import UseCaseInterface from '../../../../sharedKernel/usecase/UseCaseInterface';
import IPaymentQueue from '../../interfaces/IPaymentQueue';
import PaymentProviderInterface from '../../interfaces/PaymentProviderInterface';
import { PaymentGatewayInterface } from '../../interfaces/gateways/PaymentGatewayInterface';
import { PaymentCheckout } from '../../usecases/paymentCheckout/PaymentCheckout';

export default class ReadPaymentQueue implements UseCaseInterface {
  private readonly paymentGateway: PaymentGatewayInterface;
  private readonly paymentQueue: IPaymentQueue;
  private readonly paymentCheckout: PaymentCheckout;
  private readonly paymentProvider: PaymentProviderInterface;

  constructor(
    private _paymentGateway: PaymentGatewayInterface,
    private _paymentQueue: IPaymentQueue,
  ) {
    this.paymentGateway = _paymentGateway;
    this.paymentQueue = _paymentQueue;
  }
  async execute() {
    try {
      const inputMessage: any = this.paymentQueue.receiveMessage();

      if (inputMessage) {
        this.paymentCheckout.execute(this.paymentGateway, this.paymentProvider);
      }
    } catch {}
  }
}
