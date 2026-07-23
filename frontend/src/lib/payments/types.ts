/**
 * Payfast types
 */

export type PayfastEnvironment = 'sandbox' | 'live';

export type SubscriptionFrequency = 1 | 2 | 3 | 4 | 5 | 6;

export interface PayfastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase: string;
  version: string;
  baseUrl: string;
  environment: PayfastEnvironment;
}

export interface PayfastSubscriptionResponse {
  token: string;
  amount: number;
  cycles: number;
  cyclesComplete: number;
  frequency: number;
  runDate: string;
  status: number;
  statusReason: string;
  statusText: string;
}

export interface PayfastTokenizationResponse {
  status: number;
  statusReason: string;
  statusText: string;
}

export interface PayfastAdhocResponse {
  response: boolean;
  message: string;
  pfPaymentId: string;
}

export interface PayfastRefundQueryResponse {
  token: string;
  fundingType: string;
  amountOriginal: number;
  amountAvailableForRefund: number;
  status: 'REFUNDABLE' | 'COMPLETED' | 'NOT_AVAILABLE';
  errors: string[];
  refundFull: {
    method: 'PAYMENT_SOURCE' | 'BANK_PAYOUT' | 'NOT_AVAILABLE';
  };
  refundPartial: {
    method: 'PAYMENT_SOURCE' | 'BANK_PAYOUT' | 'NOT_AVAILABLE';
    bankAccountHolder?: string;
    bankName?: string;
    bankBranchCode?: string;
    bankAccountNumber?: string;
    bankAccountType?: string;
  };
  bankNames: Array<{
    bankName: string;
    label: string;
  }>;
}

export interface PayfastRefundCreateResponse {
  response: boolean;
  message: string;
}

export interface PayfastRefundRetrieveResponse {
  availableBalance: number;
  transactions: Array<{
    amount: number;
    date: string;
    type: string;
  }>;
}

export interface PayfastTransactionQueryResponse {
  pfPaymentId: number;
  mPaymentId: number;
  status: string;
  amount: number;
  ccStatus: string;
  ccMessage: string;
}

export interface PayfastPingResponse {
  message: string;
}

export interface PayfastApiError {
  code: number;
  status: string;
  data: {
    response: boolean;
    message?: string;
  };
}

export interface PauseSubscriptionInput {
  token: string;
  cycles?: number;
}

export interface UpdateSubscriptionInput {
  token: string;
  cycles?: number;
  frequency?: SubscriptionFrequency;
  runDate?: string;
  amount?: number;
}

export interface AdhocChargeInput {
  token: string;
  amount: number;
  itemName: string;
  itemDescription?: string;
  mPaymentId?: string;
  ccCvv?: string;
  itn?: boolean;
}

export interface CreateRefundInput {
  paymentId: string;
  pfPaymentId: string;
  amount: number;
  reason: string;
  notifyMerchant?: boolean;
  notifyBuyer: boolean;
  method: 'PAYMENT_SOURCE' | 'BANK_PAYOUT';
  bankAccountHolder?: string;
  bankName?: string;
  bankBranchCode?: string;
  bankAccountNumber?: string;
  bankAccountType?: string;
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
