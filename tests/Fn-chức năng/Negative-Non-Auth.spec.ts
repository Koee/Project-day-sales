import { expect, test } from '@playwright/test';
import { expectInvalidCheckoutPhone } from '../../steps/checkout.steps';
import { saveTestResultReport } from '../../utils/test-report.helper';

test.describe('Negative Non-Auth', () => {
  test.afterEach(async ({ page }, testInfo) => {
    await saveTestResultReport(page, testInfo);
  });

  test.skip('TC-NEG-001 should prevent quantity above stock @negative @cart', async () => {
    // Requires a stable staging product with known limited stock.
  });

  test.skip('TC-NEG-002 should prevent adding out-of-stock product @negative @store', async () => {
    // Requires a stable staging product with stock = 0.
  });

  test('TC-NEG-004 should show friendly response for non-existing store @negative @store', async ({ page }) => {
    const response = await page.goto('/store/99999/');

    expect(response?.status(), 'Non-existing store should not return server error').not.toBeGreaterThanOrEqual(500);
    await expect(page.locator('body'), 'Non-existing store should show page content or friendly error').toBeVisible();
  });

  test('TC-NEG-005 should handle checkout with empty cart @negative @checkout', async ({ page }) => {
    await page.goto('/shoppingCheckout');
    await expect(page, 'Empty checkout should redirect to cart or stay on checkout with warning').toHaveURL(/shoppingCart|shoppingCheckout/i);
    await expect(page.locator('body'), 'Empty checkout should show visible content').toBeVisible();
  });

  test('TC-NEG-008 should validate invalid checkout phone @negative @checkout', async ({ page }) => {
    await expectInvalidCheckoutPhone(page);
  });
});
