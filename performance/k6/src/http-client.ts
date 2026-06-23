import http, { type RefinedResponse, type ResponseType } from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { checkoutApiHeaders, commonHeaders, jsonHeaders, performanceProfile, type SmokeRequestType } from './config';

export const pageDuration = new Trend('day_sales_page_duration', true);
export const pageFailureRate = new Rate('day_sales_page_failure_rate');
export const orderRequestDuration = new Trend('day_sales_order_request_duration', true);
export const orderRequestFailureRate = new Rate('day_sales_order_request_failure_rate');

// Mở một trang hoặc API smoke và ghi nhận metric phản hồi.
export function openPage(
  path: string,
  name: string,
  requestType: SmokeRequestType = 'page'
): RefinedResponse<ResponseType | undefined> {
  const url = `${performanceProfile.baseURL}${path}`;
  const response = http.get(url, {
    headers: requestType === 'checkout-api' ? checkoutApiHeaders() : commonHeaders,
    tags: {
      page: name
    }
  });

  const passed = check(response, {
    [`${name} returns 2xx or 3xx`]: (res) => res.status >= 200 && res.status < 400,
    [`${name} has response body`]: (res) => typeof res.body === 'string' && res.body.length > 0
  });

  pageDuration.add(response.timings.duration, { page: name });
  pageFailureRate.add(!passed, { page: name });

  return response;
}

// Gửi request đặt hàng thật để đo tải endpoint tạo đơn.
export function submitOrderRequest(): RefinedResponse<ResponseType | undefined> {
  const url = `${performanceProfile.baseURL}${performanceProfile.orderRequestEndpoint}`;
  const response = http.post(url, performanceProfile.orderRequestPayload, {
    headers: jsonHeaders,
    tags: {
      request: 'order'
    }
  });

  const passed = check(response, {
    'order request returns 2xx or 3xx': (res) => res.status >= 200 && res.status < 400,
    'order request has response body': (res) => typeof res.body === 'string' && res.body.length > 0
  });

  orderRequestDuration.add(response.timings.duration);
  orderRequestFailureRate.add(!passed);

  return response;
}
