import { expect, test } from '@playwright/test';
import { expectInvalidCheckoutPhone } from '../../steps/checkout.steps';
import { gotoAndAssertPageAvailable } from '../../utils/page-availability.helper';
import { saveTestResultReport } from '../../utils/test-report.helper';

test.describe('Negative Non-Auth', () => {
  test.afterEach(async ({ page }, testInfo) => {
    await saveTestResultReport(page, testInfo);
  });

  test('TC-NEG-004 should show friendly response for non-existing store @negative @store', async ({ page }) => {
    const response = await gotoAndAssertPageAvailable(page, '/store/99999/', 'Non-existing store page');

    expect(response?.status(), 'Non-existing store should not return server error').not.toBeGreaterThanOrEqual(500);
    await expect(page.locator('body'), 'Non-existing store should show page content or friendly error').toBeVisible();
  });

  test('TC-NEG-005 should handle checkout with empty cart @negative @checkout', async ({ page }) => {
    await gotoAndAssertPageAvailable(page, '/shoppingCheckout', 'Empty checkout page');
    await expect(page, 'Empty checkout should redirect to cart or stay on checkout with warning').toHaveURL(/shoppingCart|shoppingCheckout/i);
    await expect(page.locator('body'), 'Empty checkout should show visible content').toBeVisible();
  });

  test('TC-NEG-008 should validate invalid checkout phone @negative @checkout', async ({ page }) => {
    await expectInvalidCheckoutPhone(page);
  });
});
