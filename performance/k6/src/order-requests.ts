import type { Options } from 'k6/options';
import { performanceProfile } from './config';
import { submitOrderRequest } from './http-client';
import { buildSummaryReport } from './summary-report';
import { orderRequestThresholds } from './thresholds';

if (!performanceProfile.orderRequestEndpoint) {
  throw new Error('Missing K6_ORDER_REQUEST_ENDPOINT. Set the order API path before running perf:orders.');
}

if (!performanceProfile.orderRequestPayload) {
  throw new Error('Missing K6_ORDER_REQUEST_PAYLOAD. Set the JSON payload before running perf:orders.');
}

export const options: Options = {
  scenarios: {
    order_requests: {
      executor: 'shared-iterations',
      vus: performanceProfile.orderRequestVus,
      iterations: performanceProfile.orderRequestCount,
      maxDuration: '10m'
    }
  },
  thresholds: orderRequestThresholds
};

// Chạy scenario gửi request đặt hàng theo cấu hình k6.
export default function orderRequestsScenario(): void {
  submitOrderRequest();
}

// Xuất summary JSON sau khi k6 order load test kết thúc.
export function handleSummary(data: unknown): Record<string, string> {
  return {
    'performance/k6/reports/orders-summary.json': buildSummaryReport(data as never, {
      testName: 'k6 order load co phat sinh don that',
      mode: 'orders',
      configuredVus: performanceProfile.orderRequestVus,
      configuredIterations: performanceProfile.orderRequestCount
    })
  };
}
