/**
 * Payfast Refund operations
 */
import { payfastRequest } from './client';
import type {
  PayfastRefundQueryResponse,
  PayfastRefundCreateResponse,
  PayfastRefundRetrieveResponse,
  CreateRefundInput,
} from './types';

export async function queryRefund(pfPaymentId: string, testing = false): Promise<PayfastRefundQueryResponse> {
  const path = `/refunds/query/${encodeURIComponent(pfPaymentId)}`;
  const response = await payfastRequest<PayfastRefundQueryResponse>({
    path,
    method: 'GET',
    testing,
  });
  return response;
}

export async function createRefund(input: CreateRefundInput, testing = false): Promise<PayfastRefundCreateResponse> {
  const path = `/refunds/${encodeURIComponent(input.pfPaymentId)}`;
  const body: Record<string, unknown> = {
    amount: input.amount,
    reason: input.reason,
    notify_merchant: input.notifyMerchant ?? false,
    notify_buyer: input.notifyBuyer,
  };

  if (input.method === 'BANK_PAYOUT') {
    body.bank_account_holder = input.bankAccountHolder;
    body.bank_name = input.bankName;
    body.bank_branch_code = input.bankBranchCode;
    body.bank_account_number = input.bankAccountNumber;
    body.bank_account_type = input.bankAccountType;
  }

  const response = await payfastRequest<PayfastRefundCreateResponse>({
    path,
    method: 'POST',
    body,
    testing,
  });
  return response;
}

export async function retrieveRefund(pfPaymentId: string, testing = false): Promise<PayfastRefundRetrieveResponse> {
  const path = `/refunds/${encodeURIComponent(pfPaymentId)}`;
  const response = await payfastRequest<PayfastRefundRetrieveResponse>({
    path,
    method: 'GET',
    testing,
  });
  return response;
}
