/**
 * Payfast Subscription operations
 */
import { payfastRequest } from './client';
import type {
  PayfastSubscriptionResponse,
  PayfastAdhocResponse,
  PauseSubscriptionInput,
  UpdateSubscriptionInput,
  AdhocChargeInput,
} from './types';

export async function fetchSubscription(token: string, testing = false): Promise<PayfastSubscriptionResponse> {
  const path = `/subscriptions/${encodeURIComponent(token)}/fetch`;
  const response = await payfastRequest<{ response: PayfastSubscriptionResponse }>({
    path,
    method: 'GET',
    testing,
  });
  return response.response;
}

export async function pauseSubscription(input: PauseSubscriptionInput, testing = false): Promise<boolean> {
  const { token, cycles } = input;
  const path = `/subscriptions/${encodeURIComponent(token)}/pause`;
  const body: Record<string, unknown> = {};
  if (cycles !== undefined) body.cycles = cycles;

  const response = await payfastRequest<{ response: boolean }>({
    path,
    method: 'PUT',
    body,
    testing,
  });
  return response.response;
}

export async function unpauseSubscription(token: string, testing = false): Promise<boolean> {
  const path = `/subscriptions/${encodeURIComponent(token)}/unpause`;
  const response = await payfastRequest<{ response: boolean }>({
    path,
    method: 'PUT',
    testing,
  });
  return response.response;
}

export async function cancelSubscription(token: string, testing = false): Promise<boolean> {
  const path = `/subscriptions/${encodeURIComponent(token)}/cancel`;
  const response = await payfastRequest<{ response: boolean }>({
    path,
    method: 'PUT',
    testing,
  });
  return response.response;
}

export async function updateSubscription(input: UpdateSubscriptionInput, testing = false): Promise<PayfastSubscriptionResponse> {
  const { token, cycles, frequency, runDate, amount } = input;
  const path = `/subscriptions/${encodeURIComponent(token)}/update`;

  const body: Record<string, unknown> = {};
  if (cycles !== undefined) body.cycles = cycles;
  if (frequency !== undefined) body.frequency = frequency;
  if (runDate !== undefined) body.run_date = runDate;
  if (amount !== undefined) body.amount = amount;

  const response = await payfastRequest<{ response: PayfastSubscriptionResponse }>({
    path,
    method: 'PATCH',
    body,
    testing,
  });
  return response.response;
}

export async function adhocCharge(input: AdhocChargeInput, testing = false): Promise<PayfastAdhocResponse> {
  const { token, amount, itemName, itemDescription, mPaymentId, ccCvv, itn } = input;
  const path = `/subscriptions/${encodeURIComponent(token)}/adhoc`;

  const body: Record<string, unknown> = {
    amount,
    item_name: itemName,
    itn: itn ?? true,
  };
  if (itemDescription) body.item_description = itemDescription;
  if (mPaymentId) body.m_payment_id = mPaymentId;
  if (ccCvv) body.cc_cvv = ccCvv;

  const response = await payfastRequest<PayfastAdhocResponse>({
    path,
    method: 'POST',
    body,
    testing,
  });
  return response;
}

export async function ping(testing = false): Promise<string> {
  const path = '/ping';
  const response = await payfastRequest<{ message: string }>({
    path,
    method: 'GET',
    testing,
  });
  return response.message;
}
