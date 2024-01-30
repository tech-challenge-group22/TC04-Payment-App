import { GetPaymentStatusUseCase } from '../../../../../../../src/domain/aggregates/payment/usecases/getPaymentStatus/GetPaymentStatus';
//import { GetPaymentStatusDTO } from '../../../../../../../src/domain/aggregates/payment/usecases/getPaymentStatus/GetPaymentStatusDTO'
import { PaymentGatewayInterface } from '../../../../../../../src/domain/aggregates/payment/interfaces/gateways/PaymentGatewayInterface';
import { PaymentStatusCode } from '../../../../../../../src/domain/sharedKernel/enums/PaymentStatus';

const paymentGatewayMock: PaymentGatewayInterface = {
  getPaymentStatus: async (orderId?: number) => mockPaymentStatus,
  getPaymentPending: jest.fn(),
  createPayment: jest.fn(),
  confirmPayment: jest.fn(),
};
const validInput = { id: 1 };
const mockPaymentStatus = 'Paid';

describe('GetPaymentStatusUseCase', () => {
  it('should successfully retrieve payment status', async () => {
    const result = await GetPaymentStatusUseCase.execute(
      validInput,
      paymentGatewayMock,
    );

    expect(result.hasError).toBe(false);
    expect(result.result).toBe(mockPaymentStatus);
  });

  it('should handle errors when retrieving payment status', async () => {
    // Override the mock to throw an error
    paymentGatewayMock.getPaymentStatus = async () => {
      throw new Error('Error retrieving payment status');
    };

    const result = await GetPaymentStatusUseCase.execute(
      validInput,
      paymentGatewayMock,
    );

    expect(result.hasError).toBe(true);
    expect(result.message).toStrictEqual(
      Error('Error retrieving payment status'),
    );
  });

  // Reset the mock after the tests
  afterAll(() => {
    paymentGatewayMock.getPaymentStatus = async (orderId?: number) =>
      mockPaymentStatus;
  });
});
