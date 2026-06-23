import { test } from '@playwright/test';
import {
  expectCheckoutAddressFields,
  expectCheckoutSummaryMatchesCart,
  goBackToCartFromCheckout,
  muaHangKhongLogin,
  placeOrderWithMissingRequiredPhone
} from '../../steps/checkout.steps';
import { saveTestResultReport } from '../../utils/test-report.helper';

test.describe('Checkout UI and Functional', () => {
  test.afterEach(async ({ page }, testInfo) => {
    await saveTestResultReport(page, testInfo);
  });

  test('TC-CHKOUT-001 should show delivery address fields @checkout @ui', async ({ page }) => {
    await expectCheckoutAddressFields(page);
  });

  test('TC-CHKOUT-002 should place order successfully with valid data @checkout @smoke', async ({ page }) => {
    await muaHangKhongLogin(page);
  });

  test('TC-CHKOUT-003 should validate missing required phone @checkout @negative', async ({ page }) => {
    await placeOrderWithMissingRequiredPhone(page);
  });

  test('TC-CHKOUT-004 should show checkout summary with amount information @checkout', async ({ page }) => {
    await expectCheckoutSummaryMatchesCart(page);
  });

  test('TC-CHKOUT-005 should navigate back to cart when control is available @checkout @cart', async ({ page }) => {
    await goBackToCartFromCheckout(page);
  });
});
