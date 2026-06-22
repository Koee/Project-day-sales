import { test } from '@playwright/test';
import { muaHangKhongLogin } from '../../steps/checkout.steps';
import { saveTestResultReport } from '../../utils/test-report.helper';

test.describe('Checkout', () => {
  test.afterEach(async ({ page }, testInfo) => {
    await saveTestResultReport(page, testInfo);
  });

  test('should place order successfully when guest user completes checkout flow @smoke @checkout', async ({ page }) => {
    await muaHangKhongLogin(page);
  });
});
