import type { Page, TestInfo } from '@playwright/test';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const reportRoot = 'report';

// Lưu screenshot và metadata kết quả test vào thư mục report.
export async function saveTestResultReport(page: Page, testInfo: TestInfo): Promise<void> {
  await waitForReportReady(page);
  const hasSuccessPopup = await orderSuccessDialog(page).isVisible().catch(() => false);
  const statusFolder = testInfo.status === 'passed' ? 'pass' : 'false';
  const outputDir = path.join(reportRoot, statusFolder);
  const fileBaseName = reportFileBaseName(testInfo);
  const screenshotPath = path.join(outputDir, `${fileBaseName}.png`);
  const infoPath = path.join(outputDir, `${fileBaseName}.json`);
  let screenshot: string | undefined;
  let screenshotError: string | undefined;

  await Promise.all([
    mkdir(path.join(reportRoot, 'pass'), { recursive: true }),
    mkdir(path.join(reportRoot, 'false'), { recursive: true })
  ]);
  await removeStaleReports(fileBaseName);

  try {
    await captureReportScreenshot(page, screenshotPath, hasSuccessPopup);
    screenshot = screenshotPath;
    await testInfo.attach('report screenshot', {
      path: screenshotPath,
      contentType: 'image/png'
    });
  } catch (error) {
    screenshotError = error instanceof Error ? error.message : String(error);
  }

  await writeFile(
    infoPath,
    JSON.stringify(
      {
        title: testInfo.title,
        status: testInfo.status,
        expectedStatus: testInfo.expectedStatus,
        durationMs: testInfo.duration,
        screenshot,
        image: screenshot
          ? {
              path: screenshot,
              contentType: 'image/png',
              attachmentName: 'report screenshot'
            }
          : undefined,
        screenshotError,
        errors: testInfo.errors.map((error) => error.message)
      },
      null,
      2
    ),
    'utf8'
  );
}

// Chụp screenshot ưu tiên dialog thành công nếu test pass.
async function captureReportScreenshot(page: Page, screenshotPath: string, hasSuccessPopup: boolean): Promise<void> {
  if (hasSuccessPopup) {
    const successDialog = orderSuccessDialog(page);
    if (await successDialog.isVisible().catch(() => false)) {
      await successDialog.screenshot({ path: screenshotPath });
      return;
    }
  }

  await page.screenshot({ path: screenshotPath, fullPage: false });
}

async function waitForReportReady(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded', { timeout: 2_000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 3_000 }).catch(() => undefined);
  await busyOverlay(page).waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => undefined);
}

function busyOverlay(page: Page): ReturnType<Page['locator']> {
  return page
    .locator(
      [
        '.vld-overlay:visible',
        '.loading:visible',
        '.loader:visible',
        '.spinner:visible',
        '.loading-overlay:visible',
        '[class*="loading" i]:visible',
        '[class*="loader" i]:visible'
      ].join(', ')
    )
    .or(page.getByText(/đang xử lý|dang xu ly|loading|processing/i))
    .first();
}

function orderSuccessDialog(page: Page): ReturnType<Page['locator']> {
  return page
    .locator('.modal-content:visible, .modal-dialog:visible, [role="dialog"]:visible')
    .filter({ hasText: /đặt hàng.*thành công|thành công/i })
    .last();
}

// Xóa report cũ cùng tên ở cả thư mục pass và false.
async function removeStaleReports(fileBaseName: string): Promise<void> {
  await Promise.all(
    ['pass', 'false'].flatMap((statusFolder) => [
      rm(path.join(reportRoot, statusFolder, `${fileBaseName}.png`), { force: true }),
      rm(path.join(reportRoot, statusFolder, `${fileBaseName}.json`), { force: true })
    ])
  );
}

// Chuẩn hóa tiêu đề test thành tên file an toàn.
function sanitizeFileName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function reportFileBaseName(testInfo: TestInfo): string {
  const testFileName = path.basename(testInfo.file, path.extname(testInfo.file));
  const specBaseName = sanitizeFileName(testFileName.replace(/\.spec$/i, '') || testInfo.title);
  const testCaseCode = reportTestCaseCode(testInfo.title, specBaseName);

  if (!testCaseCode) {
    return specBaseName;
  }

  return `${specBaseName}-${testCaseCode}`;
}

function reportTestCaseCode(title: string, specBaseName: string): string | undefined {
  const testCaseCode = title.match(/\bTC(?:[-\s]+([A-Z]+(?:[-\s]+[A-Z]+)*))?[-\s]*([A-Z]?\d+)\b/i);

  if (!testCaseCode) {
    return undefined;
  }

  const rawGroups = testCaseCode[1]?.toUpperCase().split(/[-\s]+/).filter(Boolean) ?? [];
  const rawCaseNumber = testCaseCode[2].toUpperCase();
  const normalizedCaseNumber = rawCaseNumber.match(/^\d+$/)
    ? rawCaseNumber.padStart(3, '0')
    : rawCaseNumber.replace(/^([A-Z]+)0*(\d+)$/, (_, prefix: string, number: string) => `${prefix}${number.padStart(2, '0')}`);
  const specTokens = new Set(specBaseName.toUpperCase().split('-'));
  const groupsToKeep = rawGroups.filter((group) => !specTokens.has(group));

  if (groupsToKeep.length > 0) {
    return `TC-${groupsToKeep.join('-')}-${normalizedCaseNumber}`;
  }

  return `TC${normalizedCaseNumber}`;
}
