/**
 * Payfast web checkout integration
 *
 * Provides utilities for generating Payfast hosted payment page form parameters.
 */
import crypto from 'crypto';

function phpUrlEncode(value: string): string {
  return encodeURIComponent(value)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/%20/g, '+');
}

export interface PayfastWebCheckoutParams {
  merchantId: string;
  merchantKey: string;
  amount: number;
  itemName: string;
  itemDescription?: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
  mPaymentId?: string;
  emailAddress?: string;
  nameFirst?: string;
  nameLast?: string;
}

function buildOrderedFields(params: PayfastWebCheckoutParams): Record<string, string> {
  const entries: Record<string, string | number | undefined> = {
    merchant_id: params.merchantId,
    merchant_key: params.merchantKey,
    return_url: params.returnUrl,
    cancel_url: params.cancelUrl,
    notify_url: params.notifyUrl,
    name_first: params.nameFirst,
    name_last: params.nameLast,
    email_address: params.emailAddress,
    m_payment_id: params.mPaymentId,
    amount: (params.amount / 100).toFixed(2),
    item_name: params.itemName,
    item_description: params.itemDescription,
  };

  return Object.fromEntries(
    Object.entries(entries)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => [key, String(value).trim()])
  );
}

export function generateWebCheckoutSignature(params: PayfastWebCheckoutParams, passphrase = ''): string {
  const pairs = Object.entries(buildOrderedFields(params))
    .map(([key, value]) => `${key}=${phpUrlEncode(value)}`);

  const paramString = `${pairs.join('&')}${passphrase ? `&passphrase=${phpUrlEncode(passphrase.trim())}` : ''}`;

  return crypto.createHash('md5').update(paramString).digest('hex');
}

export function buildPayfastForm(params: PayfastWebCheckoutParams, signature: string) {
  return {
    ...buildOrderedFields(params),
    signature,
  };
}
