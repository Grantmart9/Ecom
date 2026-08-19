import { describe, it, expect } from 'vitest';
import { payfastConfig, getPayfastBaseUrl, isPayfastConfigured } from '../config';

describe('payfastConfig', () => {
  it('reads merchant credentials from env', () => {
    expect(payfastConfig.merchantId).toBe(process.env.PAYFAST_MERCHANT_ID || '');
    expect(payfastConfig.merchantKey).toBe(process.env.PAYFAST_MERCHANT_KEY || '');
  });

  it('defaults version to v1 when not set', () => {
    expect(payfastConfig.version).toBe('v1');
  });

  it('defaults environment to sandbox when not set', () => {
    expect(payfastConfig.environment).toBe('sandbox');
  });
});

describe('getPayfastBaseUrl', () => {
  it('returns the Payfast API base URL', () => {
    expect(getPayfastBaseUrl()).toBe('https://api.payfast.co.za');
  });
});

describe('isPayfastConfigured', () => {
  it('requires merchant ID and key', () => {
    expect(isPayfastConfigured()).toBe(Boolean(process.env.PAYFAST_MERCHANT_ID && process.env.PAYFAST_MERCHANT_KEY));
  });
});
