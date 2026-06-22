/// <reference types="k6" />

import { SharedArray } from 'k6/data';

export type SmokeRequestType = 'page' | 'checkout-api';

export type SmokeTarget = {
  name: string;
  path: string;
  requestType?: SmokeRequestType;
};

export type PerformanceProfile = {
  baseURL: string;
  smokeVus: number;
  smokeDuration: string;
  defaultThinkTimeSeconds: number;
  orderRequestCount: number;
  orderRequestVus: number;
  orderRequestEndpoint: string;
  orderRequestPayload: string;
  checkoutCookie: string;
};

export const performanceProfile: PerformanceProfile = {
  baseURL: __ENV.BASE_URL ?? 'https://day-sales-staging.timdaythay.com',
  // Smoke load only opens pages and must not create real orders.
  smokeVus: Number(__ENV.K6_SMOKE_VUS ?? 100), // user ảo
  smokeDuration: __ENV.K6_SMOKE_DURATION ?? '60s',// thời gian chịu tải
  defaultThinkTimeSeconds: Number(__ENV.K6_THINK_TIME_SECONDS ?? 1),
  // Order load posts to the real order API. Count is total requests, VUs is concurrency.
  orderRequestCount: Number(__ENV.K6_ORDER_REQUEST_COUNT ?? 100),
  orderRequestVus: Number(__ENV.K6_ORDER_REQUEST_VUS ?? 30),
  // Use the actual endpoint/body captured from the checkout "Dat hang" request.
  orderRequestEndpoint: __ENV.K6_ORDER_REQUEST_ENDPOINT ?? '',
  orderRequestPayload: __ENV.K6_ORDER_REQUEST_PAYLOAD ?? '',
  // Optional browser cookie for checkout API smoke requests. Do not hard-code real cookies in code.
  checkoutCookie: __ENV.K6_CHECKOUT_COOKIE ?? ''
};

export const commonHeaders = {
  'User-Agent': 'day-sales-k6-performance/1.0',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
};

export const jsonHeaders = {
  'User-Agent': 'day-sales-k6-performance/1.0',
  Accept: 'application/json, text/plain, */*',
  'Content-Type': 'application/json'
};

export function checkoutApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'User-Agent': 'day-sales-k6-performance/1.0',
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'vi',
    Referer: `${performanceProfile.baseURL}/shoppingCheckout`
  };

  if (performanceProfile.checkoutCookie) {
    headers.Cookie = performanceProfile.checkoutCookie;
  }

  return headers;
}

export const smokePages = new SharedArray<SmokeTarget>('smoke pages', () => [
  {
    name: 'home',
    path: '/'
  },
  {
    name: 'store 11 product detail',
    path: '/store/11/product/cha-ca-kg-6568.html?package_query='
  },
  {
    name: 'cart',
    path: '/shoppingCart'
  },
  {
    name: 'cart checkout',
    path: '/shoppingCheckout'
  },
  {
    name: 'checkout products api',
    path: '/api/public/products/for-checkout?ids=7658&seller_entity_id=4225',
    requestType: 'checkout-api'
  }
]);
