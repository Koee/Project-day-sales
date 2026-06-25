import { test } from '@playwright/test';
import { muaHangCoLogin } from '../../steps/checkout.steps';
import { saveTestResultReport } from '../../utils/test-report.helper';

test.describe('Checkout', () => {
  // Lưu report sau mỗi test login checkout.
  test.afterEach(async ({ page }, testInfo) => {
    await saveTestResultReport(page, testInfo);
  });

  // Kiểm tra flow đặt hàng thành công với user đã đăng nhập.
  test('TC-LOGIN-ORDER-001 should place order successfully when logged-in user completes checkout flow @smoke @checkout @auth @auth-state', async ({ page }) => {
    await muaHangCoLogin(page);
  });
});
