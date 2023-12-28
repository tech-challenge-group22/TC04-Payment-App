import ExpressAdapter from './application/adapters/ExpressAdapter';
import * as dotenv from 'dotenv';

import { PaymentRoute } from './infrastructure/api/payment.route';
import { WebhookRoute } from './infrastructure/api/webhook.route';

dotenv.config();
const server = new ExpressAdapter();

const paymentRoute = new PaymentRoute(server);
const webhookRoute = new WebhookRoute(server);

server.router(PaymentRoute);
server.router(WebhookRoute);

server.listen(3000);
