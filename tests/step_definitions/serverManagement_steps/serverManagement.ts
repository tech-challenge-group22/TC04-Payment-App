// filename: tests/step_definitions/server_management_steps.ts
import { Given, When, Then, After } from '@cucumber/cucumber';
import assert from 'assert';
import ExpressAdapter from '../../../src/application/adapters/ExpressAdapter';
import PaymentRoute from '../../../src/infrastructure/api/payment.route';

let server: ExpressAdapter;
let paymentRoute: any;

Given('the server is not running', function () {
  server = new ExpressAdapter();
  assert(!server.isRunning(), 'Server should not be running');
});

When('I start the server on port {int}', async function (port: number) {
  await server.listen(port);
});

Then('the server should be running on port {int}', function (port: number) {
  assert(
    server.isRunningOnPort(port),
    'Server is not running on the expected port',
  );
});

When('the order queue route started', async () => {
  paymentRoute = new PaymentRoute(server);
  await server.router(PaymentRoute);
});

Then('the route should execute correctly', () => {
  assert.notEqual(paymentRoute, undefined);
});

Given('the server is running', async function () {
  server = new ExpressAdapter();
  await server.listen(3000);
  assert(server.isRunning(), 'Server should be running');
});

When('I stop the server', async function () {
  await server.close();
});

Then('the server should not be running', function () {
  assert(!server.isRunning(), 'Server should not be running');
});

After(async () => {
  if (server) {
    await server.close();
  }
});
