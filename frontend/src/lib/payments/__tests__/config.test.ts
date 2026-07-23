import { describe, it, expect } from 'vitest';
import { payfastConfig, getPayfastBaseUrl, isPayfastConfigured } from '../config';

describe('payfastConfig', () => {
  it('reads merchant ID from env', () => {
    expect(payfastConfig.merchantId).toBe(process.env.PAYFAST_MERCHANT_ID || '');
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
  it('returns true when both merchantId and passphrase are set', () => {
    const result = isPayfastConfigured();
    const configured = result;
    if (process.env.PAYFAST_MERCHANT_ID && process.env.PAYFAST_PASSPHRASE) {
      expect(configured).toBe(true);
    } else {
      expect(configured).toBe(false);
    }
  });
});
