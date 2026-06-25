import type { Locator, Page, Response, TestInfo } from '@playwright/test';

type PageAvailabilityOptions = {
  pageName: string;
  response?: Response | null;
  testInfo?: TestInfo;
};

const availabilityStatuses = [403, 404, 503, 504] as const;

// Điều hướng và dừng TC nếu trang trả lỗi availability.
export async function gotoAndAssertPageAvailable(
  page: Page,
  path: string,
  pageName: string,
  testInfo?: TestInfo
): Promise<Response | null> {
  let status: number | undefined;

  try {
    const response = await page.goto(path, { waitUntil: 'commit' });
    status = response?.status();
    await assertPageAvailable(page, { pageName, response, testInfo });
    await page.waitForLoadState('domcontentloaded');
    await assertNoAvailabilityErrorPage(page, { pageName, testInfo });
    return response;
  } catch (error) {
    if (isAvailabilityFailureError(error)) {
      throw error;
    }

    await attachAvailabilityScreenshot(page, pageName, testInfo);
    throw new Error(`${pageName} navigation failed before availability checks completed. Status: ${status ?? 'unknown'}. ${String(error)}`);
  }
}

// Kiểm tra response HTTP có thuộc nhóm lỗi cần dừng TC không.
export async function assertPageAvailable(page: Page, options: PageAvailabilityOptions): Promise<void> {
  const status = options.response?.status();

  if (status === undefined || !isAvailabilityStatus(status)) {
    return;
  }

  await failWithAvailabilityEvidence(page, options.pageName, status, options.testInfo);
}

// Kiểm tra DOM trang lỗi 403/404/503/504 sau khi navigation hoàn tất.
export async function assertNoAvailabilityErrorPage(page: Page, options: PageAvailabilityOptions): Promise<void> {
  const errorPage = availabilityErrorSignal(page);

  if (!(await errorPage.isVisible().catch(() => false))) {
    return;
  }

  const message = (await errorPage.textContent().catch(() => undefined))?.trim();

  await attachAvailabilityScreenshot(page, options.pageName, options.testInfo);
  throw new Error(availabilityErrorMessage(options.pageName, message));
}

// Nhận biết HTTP status thuộc nhóm lỗi hệ thống cần dừng TC.
export function isAvailabilityStatus(status: number | undefined): boolean {
  return status !== undefined && availabilityStatuses.includes(status as (typeof availabilityStatuses)[number]);
}

// Format message lỗi availability để report dễ đọc.
export function availabilityErrorMessage(pageName: string, statusOrMessage: number | string | undefined): string {
  if (typeof statusOrMessage === 'number') {
    return `${pageName} returned HTTP ${statusOrMessage} ${availabilityStatusText(statusOrMessage)}. Screenshot attached when testInfo is available.`;
  }

  return `${pageName} returned ${statusOrMessage || 'Availability error page'}. Screenshot attached when testInfo is available.`;
}

async function failWithAvailabilityEvidence(page: Page, pageName: string, status: number, testInfo?: TestInfo): Promise<void> {
  await attachAvailabilityScreenshot(page, pageName, testInfo);
  throw new Error(availabilityErrorMessage(pageName, status));
}

async function attachAvailabilityScreenshot(page: Page, pageName: string, testInfo?: TestInfo): Promise<void> {
  if (!testInfo) {
    return;
  }

  const attachmentName = `${pageName.toLowerCase().replace(/\s+/g, '-')}-availability-error`;
  const screenshotPath = testInfo.outputPath(`${attachmentName}.png`);

  await page.screenshot({ path: screenshotPath, fullPage: true });
  await testInfo.attach(attachmentName, {
    path: screenshotPath,
    contentType: 'image/png'
  });
}

function availabilityErrorSignal(page: Page): Locator {
  return page
    .getByRole('heading', { name: /403 forbidden|404 not found|503 service unavailable|504 gateway time-out/i })
    .or(page.getByText(/403 forbidden|404 not found|503 service unavailable|504 gateway time-out/i))
    .first();
}

function availabilityStatusText(status: number): string {
  switch (status) {
    case 403:
      return 'Forbidden';
    case 404:
      return 'Not Found';
    case 503:
      return 'Service Unavailable';
    case 504:
      return 'Gateway Time-out';
    default:
      return '';
  }
}

function isAvailabilityFailureError(error: unknown): boolean {
  return error instanceof Error && /returned (HTTP )?(403|404|503|504|Availability error page|Forbidden|Not Found|Service Unavailable|Gateway Time-out)/i.test(error.message);
}
