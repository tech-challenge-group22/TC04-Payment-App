import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import http from 'http';
import ExpressAdapter from '../../../src/application/adapters/ExpressAdapter';

let adapter: ExpressAdapter;
let mockHttpServer: http.Server;
let closeError: Error | null = null;

Given('the ExpressAdapter server is running', function () {
  adapter = new ExpressAdapter();
  mockHttpServer = http.createServer();

  // Assign the mock server to the adapter
  adapter['httpServer'] = mockHttpServer;
});

When(
  'I close the ExpressAdapter server and an error occurs',
  async function () {
    // Override the close method to simulate an error
    mockHttpServer.close = (callback?: (err?: Error) => void) => {
      const error = new Error('Mock close error');
      if (callback) {
        callback(error);
      }
      return mockHttpServer;
    };

    try {
      await adapter.close();
    } catch (error) {
      closeError = error as Error;
    }
  },
);

Then('an error should be thrown', function () {
  assert.strictEqual(closeError?.message, 'Mock close error');
});
