import { test } from '@playwright/test';
import { muaHangKhongLogin } from '../../steps/checkout.steps';
import { saveTestResultReport } from '../../utils/test-report.helper';

test.describe('Checkout', () => {
  // Lưu report sau mỗi test guest checkout.
  test.afterEach(async ({ page }, testInfo) => {
    await saveTestResultReport(page, testInfo);
  });

  // Kiểm tra flow đặt hàng thành công khi không đăng nhập.
  test('should place order successfully when guest user completes checkout flow @smoke @checkout', async ({ page }) => {
    await muaHangKhongLogin(page);
  });
});
