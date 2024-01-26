// import { response } from 'express';
// import { PaymentMethod } from '../../../../sharedKernel/enums/PaymentMethod';
import UseCaseInterface from '../../../../sharedKernel/usecase/UseCaseInterface';
import PaymentProviderInterface from '../../interfaces/PaymentProviderInterface';
import {
  PaymentCheckoutInputDTO,
  PaymentCheckoutOutputDTO,
} from './PaymentCheckoutDTO';
import { PaymentGatewayInterface } from '../../interfaces/gateways/PaymentGatewayInterface';
import { OrderPaymentEntity } from '../../core/entities/OrderPaymentEntity';
import ICheckout from '../../interfaces/ICheckout';
import IPaymentQueue from '../../interfaces/IPaymentQueue';

export default class PaymentCheckout implements UseCaseInterface, ICheckout {
  private readonly repository: PaymentGatewayInterface;
  private readonly paymentProvider: PaymentProviderInterface;

  constructor(
    paymentGateway: PaymentGatewayInterface,
    paymentProvider: PaymentProviderInterface,
  ) {
    this.repository = paymentGateway;
    this.paymentProvider = paymentProvider;
  }

  async execute(
    input: PaymentCheckoutInputDTO,
  ): Promise<PaymentCheckoutOutputDTO> {
    let response: boolean;
    try {
      response = await this.paymentProvider.makePayment(
        input.orderId,
        input.paymentMethod,
      );

      console.log(
        'Running MakePayment',
        'OrderId:',
        input.orderId,
        'PaymentMethod:',
        input.paymentMethod,
      );

      // /// PARA FINS DE TESTES

      // const msg: any = {
      //   order_id: input.orderId,
      //   payment_status: 3,
      // };

      // queuePaymentService.sendMessage(msg);

      //response = true
    } catch (error) {
      throw new Error('Failed to comunicate with payment service');
    }
    if (response) {
      try {
        let payment: OrderPaymentEntity = await this.repository.createPayment(
          input.orderId,
          input.paymentMethod,
        );
        console.log('Running Create Payment');
        return {
          hasError: false,
          paymentId: payment.payment_id,
          status: payment.status,
        };
      } catch (error) {
        return {
          hasError: true,
          message: 'Failed to save transaction details',
        };
      }
    } else {
      return {
        hasError: true,
        message: 'Failed process payment',
      };
    }
  }
}
