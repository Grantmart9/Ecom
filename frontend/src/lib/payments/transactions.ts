/**
 * Payfast Transaction history and query operations
 */

import { payfastRequest } from './client';
import type { PayfastTransactionQueryResponse } from './types';

export interface TransactionHistoryFilters {
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export async function getTransactionHistory(filters: TransactionHistoryFilters = {}, testing = false): Promise<string> {
  const query: Record<string, string> = {};
  if (filters.from) query.from = filters.from;
  if (filters.to) query.to = filters.to;
  if (filters.limit) query.limit = String(filters.limit);
  if (filters.offset) query.offset = String(filters.offset);

  const response = await payfastRequest<{ response: string }>({
    path: '/transactions/history',
    method: 'GET',
    query,
    testing,
  });
  return response.response;
}

export async function getDailyTransactionHistory(date = '', testing = false): Promise<string> {
  const query: Record<string, string> = {};
  if (date) query.date = date;

  const response = await payfastRequest<{ response: string }>({
    path: '/transactions/history/daily',
    method: 'GET',
    query,
    testing,
  });
  return response.response;
}

export async function getWeeklyTransactionHistory(date = '', testing = false): Promise<string> {
  const query: Record<string, string> = {};
  if (date) query.date = date;

  const response = await payfastRequest<{ response: string }>({
    path: '/transactions/history/weekly',
    method: 'GET',
    query,
    testing,
  });
  return response.response;
}

export async function getMonthlyTransactionHistory(date = '', testing = false): Promise<string> {
  const query: Record<string, string> = {};
  if (date) query.date = date;

  const response = await payfastRequest<{ response: string }>({
    path: '/transactions/history/monthly',
    method: 'GET',
    query,
    testing,
  });
  return response.response;
}

export async function queryTransaction(id: string, testing = false): Promise<PayfastTransactionQueryResponse> {
  const path = `/process/query/${encodeURIComponent(id)}`;
  const response = await payfastRequest<{
    response: PayfastTransactionQueryResponse;
    message: string;
  }>({
    path,
    method: 'GET',
    testing,
  });
  return response.response;
}
