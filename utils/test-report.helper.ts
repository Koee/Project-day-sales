import type { Page, TestInfo } from '@playwright/test';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const reportRoot = 'report';

// Lưu screenshot và metadata kết quả test vào thư mục report.
export async function saveTestResultReport(page: Page, testInfo: TestInfo): Promise<void> {
  const hasSuccessPopup = await orderSuccessDialog(page).isVisible().catch(() => false);
  const statusFolder = hasSuccessPopup || testInfo.status === 'passed' ? 'pass' : 'false';
  const outputDir = path.join(reportRoot, statusFolder);
  const fileBaseName = sanitizeFileName(testInfo.title);
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
