import crypto from 'crypto';
import { describe, expect, it } from 'vitest';
import { buildPayfastForm, generateWebCheckoutSignature } from '../web';

describe('Payfast web checkout signature', () => {
  it('matches the fields and order submitted to Payfast', () => {
    const params = {
      merchantId: '10038977',
      merchantKey: 'test-key',
      amount: 12500,
      itemName: 'Order ORD-123',
      itemDescription: 'Recovery order',
      returnUrl: 'http://localhost:3003/checkout/success',
      cancelUrl: 'http://localhost:3003/checkout/cancel',
      notifyUrl: 'http://localhost:3003/api/checkout/payfast/itn',
      mPaymentId: 'order-id',
      emailAddress: 'buyer@example.com',
      nameFirst: 'Test',
      nameLast: 'Buyer',
    };

    const signature = generateWebCheckoutSignature(params);
    const form = buildPayfastForm(params, signature);
    const submittedFields = Object.entries(form)
      .filter(([key]) => key !== 'signature')
      .map(([key, value]) => `${key}=${encodeURIComponent(value)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A')
        .replace(/%20/g, '+')}`)
      .join('&');

    expect(signature).toBe(crypto.createHash('md5').update(submittedFields).digest('hex'));
  });

  it('uses PHP-compatible form encoding for special characters', () => {
    const params = {
      merchantId: '10038977',
      merchantKey: 'test-key',
      amount: 12500,
      itemName: "Order! *(')",
      itemDescription: 'Recovery order',
      returnUrl: 'http://localhost:3003/checkout/success',
      cancelUrl: 'http://localhost:3003/checkout/cancel',
      notifyUrl: 'http://localhost:3003/api/checkout/payfast/itn',
    };

    const signature = generateWebCheckoutSignature(params);
    const form = buildPayfastForm(params, signature);
    const submittedFields = Object.entries(form)
      .filter(([key]) => key !== 'signature')
      .map(([key, value]) => `${key}=${encodeURIComponent(value)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A')
        .replace(/%20/g, '+')}`)
      .join('&');

    expect(signature).toBe(crypto.createHash('md5').update(submittedFields).digest('hex'));
  });
});
