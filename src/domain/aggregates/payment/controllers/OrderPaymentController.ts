// DTOs
import {
  GetPaymentStatusInputDTO,
  GetPaymentStatusOutputDTO,
} from '../usecases/getPaymentStatus/GetPaymentStatusDTO';
import {
  PaymentConfirmationInputDTO,
  PaymentConfirmationOutputDTO,
} from '../usecases/paymentConfirmation/PaymentConfirmationDTO';

// UseCases
import { GetPaymentStatusUseCase } from '../usecases/getPaymentStatus/GetPaymentStatus';
import { MySQLPaymentRepository } from '../gateways/PaymentRepository';
import { PaymentConfirmation } from '../usecases/paymentConfirmation/PaymentConfirmation';

// Adapters
import AWSSQSAdapter from '../../../../application/adapters/AWSSqsAdapter';
import { MercadoPago } from '../services/MercadoPago';
import PaymentCheckout from '../usecases/paymentCheckout/PaymentCheckout';
import { PaymentCheckoutInputDTO } from '../usecases/paymentCheckout/PaymentCheckoutDTO';

export class OrderPaymentController {
  static async getPaymentOrder(
    searchId?: number,
  ): Promise<GetPaymentStatusOutputDTO> {
    const paymentGateway = new MySQLPaymentRepository();

    const input: GetPaymentStatusInputDTO = {
      id: searchId,
    };

    return await GetPaymentStatusUseCase.execute(input, paymentGateway);
  }

  static async confirmMockPaymentOrder(
    order_id: number,
    payment_status: number,
  ): Promise<any> {
    const paymentGateway = new MySQLPaymentRepository();
    const paymentConfirmation = new PaymentConfirmation(paymentGateway);

    const queuePaymentService = AWSSQSAdapter.getInstance();

    const input: PaymentConfirmationInputDTO = {
      orderId: order_id,
      paymentStatus: payment_status,
    };
    const result = await paymentConfirmation.execute(
      input,
      queuePaymentService,
    );
    return result;
  }

  static async paymentCheckout(input: PaymentCheckoutInputDTO): Promise<any> {
    const paymentGateway = new MySQLPaymentRepository();
    const paymentProvider = new MercadoPago();

    //const queuePaymentService = AWSSQSAdapter.getInstance();

    const paymentQueue = new PaymentCheckout(paymentGateway, paymentProvider);

    const result = await paymentQueue.execute(input);

    return result;
  }
}
