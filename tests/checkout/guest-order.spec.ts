import { test } from '@playwright/test';
import { muaHangKhongLogin } from '../../steps/checkout.steps';

test.describe('Checkout', () => {
  test('mua hàng không login', async ({ page }) => {
    await muaHangKhongLogin(page);
  });
});
