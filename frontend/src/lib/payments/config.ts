/**
 * Payfast configuration
 *
 * Set these via environment variables in production.
 * PAYFAST_MERCHANT_ID, PAYFAST_MERCHANT_KEY, PAYFAST_PASSPHRASE, PAYFAST_VERSION, PAYFAST_ENV
 */
import type { PayfastConfig, PayfastEnvironment } from './types';

const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || '';
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || '';
const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE || '';
const PAYFAST_VERSION = process.env.PAYFAST_VERSION || 'v1';
const PAYFAST_ENV = (process.env.PAYFAST_ENV || 'sandbox') as PayfastEnvironment;

export const payfastConfig: PayfastConfig = {
  merchantId: PAYFAST_MERCHANT_ID,
  merchantKey: PAYFAST_MERCHANT_KEY,
  passphrase: PAYFAST_PASSPHRASE,
  version: PAYFAST_VERSION,
  baseUrl: 'https://api.payfast.co.za',
  environment: PAYFAST_ENV,
};

export function getPayfastBaseUrl(): string {
  return payfastConfig.baseUrl;
}

export function isPayfastConfigured(): boolean {
  return Boolean(payfastConfig.merchantId && payfastConfig.merchantKey && payfastConfig.passphrase);
}
