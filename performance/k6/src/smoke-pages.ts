import { sleep } from 'k6';
import type { Options } from 'k6/options';
import { performanceProfile, smokePages } from './config';
import { openPage } from './http-client';
import { buildSummaryReport } from './summary-report';
import { smokeThresholds } from './thresholds';

export const options: Options = {
  scenarios: {
    smoke_pages: {
      executor: 'constant-vus',
      vus: performanceProfile.smokeVus,
      duration: performanceProfile.smokeDuration
    }
  },
  thresholds: smokeThresholds
};

// Chạy scenario smoke bằng cách mở lần lượt các trang/API cấu hình sẵn.
export default function smokePagesScenario(): void {
  for (const page of smokePages) {
    openPage(page.path, page.name, page.requestType);
    sleep(performanceProfile.defaultThinkTimeSeconds);
  }
}

// Xuất summary JSON sau khi k6 smoke test kết thúc.
export function handleSummary(data: unknown): Record<string, string> {
  return {
    'performance/k6/reports/smoke-summary.json': buildSummaryReport(data as never, {
      testName: 'k6 smoke load khong phat sinh don',
      mode: 'smoke',
      configuredVus: performanceProfile.smokeVus,
      configuredDuration: performanceProfile.smokeDuration
    })
  };
}
