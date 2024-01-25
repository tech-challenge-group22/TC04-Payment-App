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
import ReadPaymentQueue from '../usecases/readPaymentQueue/ReadPaymentQueue';

// Adapters
import AWSSQSAdapter from '../../../../application/adapters/AWSSqsAdapter';
import { MercadoPago } from '../services/MercadoPago';

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
    const input: PaymentConfirmationInputDTO = {
      orderId: order_id,
      paymentStatus: payment_status,
    };
    const result = await paymentConfirmation.execute(input);
    return result;
  }

  static async readQueue(): Promise<any> {
    const queueService = AWSSQSAdapter.getInstance();
    const paymentGateway = new MySQLPaymentRepository();
    const paymentProvider = new MercadoPago();

    const paymentQueue = new ReadPaymentQueue(
      paymentGateway,
      queueService,
      paymentProvider,
    );

    const result = await paymentQueue.execute();

    return result;
  }
}
