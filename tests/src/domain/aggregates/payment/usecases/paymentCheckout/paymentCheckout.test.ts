import PaymentCheckout from '../../../../../../../src/domain/aggregates/payment/usecases/paymentCheckout/PaymentCheckout';
import { PaymentGatewayInterface } from '../../../../../../../src/domain/aggregates/payment/interfaces/gateways/PaymentGatewayInterface';
import PaymentProviderInterface from '../../../../../../../src/domain/aggregates/payment/interfaces/PaymentProviderInterface';

// Mock implementations
const paymentGatewayMock: PaymentGatewayInterface = {
  getPaymentStatus: jest.fn(),
  getPaymentPending: jest.fn(),
  createPayment: async (orderId: number, paymentMethod: number) => {
    return {
      order_id: orderId,
      last_update: new Date(),
      payment_method: paymentMethod,
      payment_id: 123,
      status: 1,
    };
  },
  confirmPayment: jest.fn(),
};

const paymentProviderMock: PaymentProviderInterface = {
  makePayment: async (orderId: number, paymentMethod: number) => true,
};

// Test data
const mockInput = {
  orderId: 1,
  order_items: [{ order_id: 1, item_id: 1, order_item_qtd: 2 }],
  paymentMethod: 1,
};

const mockOrderPaymentEntity = {
  payment_id: 123,
  status: 1,
};

describe('PaymentCheckout Use Case', () => {
  it('should successfully process payment checkout', async () => {
    const paymentCheckout = new PaymentCheckout(
      paymentGatewayMock,
      paymentProviderMock,
    );
    const result = await paymentCheckout.execute(mockInput);

    expect(result.hasError).toBe(false);
    expect(result.paymentId).toBe(123); // Expect the mocked payment ID
    expect(result.status).toBe(1); // Expect the mocked status
  });

  it('should handle errors when retrieving payment status', async () => {
    // Override the mock to throw an error
    paymentProviderMock.makePayment = async () => {
      throw new Error('Error retrieving payment status');
    };

    const paymentCheckout = new PaymentCheckout(
      paymentGatewayMock,
      paymentProviderMock,
    );
    let errorCaught: Error | null = null;

    try {
      await paymentCheckout.execute(mockInput);
    } catch (e) {
      errorCaught = e as Error; // Type assertion
    }

    expect(errorCaught).not.toBeNull();
    expect(errorCaught?.message).toBe(
      'Failed to comunicate with payment service',
    );
  });

  it('should handle errors when saving transaction details', async () => {
    // Override the mock to simulate an error
    paymentGatewayMock.createPayment = async () => {
      throw new Error('Repository error');
    };

    const paymentCheckout = new PaymentCheckout(
      paymentGatewayMock,
      paymentProviderMock,
    );
    const result = await paymentCheckout.execute(mockInput);

    expect(result.hasError).toBe(true);
    expect(result.message).toBe('Failed to comunicate with payment service');
  });

  afterAll(() => {
    paymentGatewayMock.createPayment = async (
      orderId: number,
      paymentMethod: number,
    ) => {
      return {
        order_id: orderId,
        last_update: new Date(),
        payment_method: paymentMethod,
        payment_id: 123,
        status: 1,
      };
    };
  });
});
