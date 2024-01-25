import ExpressAdapter from './application/adapters/ExpressAdapter';
import * as dotenv from 'dotenv';

import { PaymentRoute } from './infrastructure/api/payment.route';
import { WebhookRoute } from './infrastructure/api/webhook.route';
import AWSSQSAdapter from './application/adapters/AWSSqsAdapter';

dotenv.config();
const server = new ExpressAdapter();
const paymentRoute = new PaymentRoute(server);
const webhookRoute = new WebhookRoute(server);

server.router(PaymentRoute);
server.router(WebhookRoute);

const paymentQueueService = AWSSQSAdapter.getInstance();
server.listen(3000);
