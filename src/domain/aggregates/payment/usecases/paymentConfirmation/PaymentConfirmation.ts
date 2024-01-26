import UseCaseInterface from '../../../../sharedKernel/usecase/UseCaseInterface';
import IPaymentQueue from '../../interfaces/IPaymentQueue';
import { PaymentGatewayInterface } from '../../interfaces/gateways/PaymentGatewayInterface';
import {
  PaymentConfirmationInputDTO,
  PaymentConfirmationOutputDTO,
} from './PaymentConfirmationDTO';

export class PaymentConfirmation {
  private readonly paymentGateway: PaymentGatewayInterface;
  constructor(private _paymentGateway: PaymentGatewayInterface) {
    this.paymentGateway = _paymentGateway;
  }

  async execute(
    input: PaymentConfirmationInputDTO,
    queuePaymentService: IPaymentQueue,
  ): Promise<PaymentConfirmationOutputDTO> {
    try {
      const validateBody = this.validateBodyRequest(input);
      if (validateBody) {
        return validateBody;
      }

      let pendingList: any = [];
      pendingList = await this.paymentGateway.getPaymentPending();
      //console.log("Lista",pendingList)

      if (pendingList.length > 0) {
        for (let i = 0; i < pendingList.length; i++) {
          const result = await this.paymentGateway.confirmPayment(
            pendingList[i].order_id,
            pendingList[i].paymentStatus,
          );

          // enviar para fila do SQS

          const msg: any = {
            order_id: pendingList[i].order_id,
            payment_status: 3,
          };
          queuePaymentService.sendMessage(msg);
        }
      } else {
        const output: PaymentConfirmationOutputDTO = {
          hasError: false,
          message: 'Payment successfully updated',
        };
      }

      const output: PaymentConfirmationOutputDTO = {
        hasError: false,
        message: 'Payment successfully updated',
      };
      console.log(output);

      return output;
    } catch (error: any) {
      const output = {
        hasError: true,
        message: error.hasOwnProperty('sqlMessage')
          ? [error.sqlMessage]
          : error,
      };
      return output;
    }
  }
  private validateBodyRequest(
    input: PaymentConfirmationInputDTO,
  ): PaymentConfirmationOutputDTO | undefined {
    if (Object.keys(input).length === 1 && input['orderId']) {
      return {
        hasError: true,
        message: 'Missing body',
      };
    }
  }
}
