import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import { Request, Response } from 'express';
import ExpressAdapter from '../../../src/application/adapters/ExpressAdapter';

let adapter: ExpressAdapter;
let error: Error | null = null;

Given('I have an instance of ExpressAdapter', function () {
  adapter = new ExpressAdapter();
});

When(
  'I try to register a route with an invalid HTTP method {string} to {string}',
  async function (method: string, path: string) {
    try {
      console.log('This is method:' + method, 'this is path: ' + path);
      await adapter.register(
        method,
        path,
        async (req: Request, res: Response) => {},
      );
    } catch (e) {
      error = e as Error;
    }
  },
);

Then('I should receive an error {string}', function (expectedError: string) {
  assert.strictEqual(error?.message, expectedError);
});
