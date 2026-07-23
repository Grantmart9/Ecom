/**
 * Payfast web checkout integration
 *
 * Provides utilities for generating Payfast hosted payment page form parameters.
 */
import crypto from 'crypto';

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

export function generateWebCheckoutSignature(params: PayfastWebCheckoutParams, merchantKey: string): string {
  const data: Record<string, string> = {};

  const entries: Record<string, string | number | undefined> = {
    merchant_id: params.merchantId,
    merchant_key: merchantKey,
    amount: (params.amount / 100).toFixed(2),
    item_name: params.itemName,
    item_description: params.itemDescription,
    return_url: params.returnUrl,
    cancel_url: params.cancelUrl,
    notify_url: params.notifyUrl,
    m_payment_id: params.mPaymentId,
    email_address: params.emailAddress,
    name_first: params.nameFirst,
    name_last: params.nameLast,
  };

  for (const [key, value] of Object.entries(entries)) {
    if (value !== undefined && value !== null && value !== '') {
      data[key] = String(value);
    }
  }

  const sortedKeys = Object.keys(data).sort((a, b) => a.localeCompare(b));

  const pairs = sortedKeys
    .filter((key) => data[key] !== '')
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`);

  const paramString = pairs.join('&');

  return crypto.createHash('md5').update(paramString).digest('hex');
}

export function buildPayfastForm(params: PayfastWebCheckoutParams, signature: string) {
  const formParams: Record<string, string> = {
    merchant_id: params.merchantId,
    merchant_key: params.merchantKey,
    amount: (params.amount / 100).toFixed(2),
    item_name: params.itemName,
    return_url: params.returnUrl,
    cancel_url: params.cancelUrl,
    notify_url: params.notifyUrl,
    signature,
  };

  if (params.itemDescription) formParams.item_description = params.itemDescription;
  if (params.mPaymentId) formParams.m_payment_id = params.mPaymentId;
  if (params.emailAddress) formParams.email_address = params.emailAddress;
  if (params.nameFirst) formParams.name_first = params.nameFirst;
  if (params.nameLast) formParams.name_last = params.nameLast;

  return formParams;
}
