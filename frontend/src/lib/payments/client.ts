/**
 * Payfast API client
 *
 * Centralized HTTP client for Payfast REST API v1.
 */
import { headers } from 'next/headers';
import { getPayfastBaseUrl, payfastConfig, isPayfastConfigured } from './config';
import { generateApiSignature } from './signature';
import type { PayfastApiError } from './types';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  path: string;
  method?: HttpMethod;
  body?: Record<string, unknown>;
  query?: Record<string, string>;
  testing?: boolean;
}

export interface PayfastResponse<T> {
  code: number;
  status: string;
  data: T;
}

function buildQueryString(query?: Record<string, string>): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value);
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function merge<T extends Record<string, unknown>>(target: T, source: Record<string, unknown>): T {
  const result = { ...target } as Record<string, unknown>;
  for (const key of Object.keys(source)) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== '') {
      result[key] = value;
    }
  }
  return result as T;
}

export async function payfastRequest<T>(options: RequestOptions): Promise<T> {
  if (!isPayfastConfigured()) {
    throw new Error('Payfast is not configured. Set PAYFAST_MERCHANT_ID and PAYFAST_PASSPHRASE.');
  }

  const { path, method = 'GET', body, query, testing } = options;

  const timestamp = new Date().toISOString();

  const headerFields: Record<string, string> = {
    'merchant-id': payfastConfig.merchantId,
    'version': payfastConfig.version,
    timestamp,
  };

  const queryParams = testing ? { ...query, testing: 'true' } : query;

  const url = `${getPayfastBaseUrl()}${path}${buildQueryString(queryParams)}`;

  let signaturePayload: Record<string, unknown> = { ...headerFields };

  if (body && method !== 'GET') {
    signaturePayload = merge(signaturePayload, body);
  }

  if (queryParams) {
    signaturePayload = merge(signaturePayload, queryParams as Record<string, unknown>);
  }

  const signature = generateApiSignature(signaturePayload, payfastConfig.passphrase);

  const headersMap: Record<string, string> = {
    ...headerFields,
    signature,
  };

  const isJson = body && Object.keys(body).length > 0;

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headersMap,
    },
  };

  if (isJson && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  let remoteAddr: string | undefined;
  try {
    const headersList = await headers();
    remoteAddr = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined;
  } catch {
    remoteAddr = undefined;
  }

  if (remoteAddr) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      'REMOTE_ADDR': remoteAddr,
    };
  }

  const response = await fetch(url, fetchOptions);

  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    let errorData: PayfastApiError | null = null;
    try {
      errorData = contentType.includes('application/json') ? await response.json() : null;
    } catch {
      errorData = null;
    }
    const message = errorData?.data?.message || errorData?.status || `HTTP ${response.status}`;
    const error = new Error(`Payfast API error: ${message}`) as Error & { status: number; code?: number };
    error.status = response.status;
    error.code = errorData?.code;
    throw error;
  }

  if (contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  const text = await response.text();
  return { message: text } as unknown as T;
}
