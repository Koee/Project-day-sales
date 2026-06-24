import { test } from '@playwright/test';
import { expectCartLayout } from '../../steps/cart.steps';
import { expectCheckoutLayout } from '../../steps/checkout.steps';
import {
  expectStoreHeader,
  expectStoreFooter,
  expectStoreLayout,
  expectStoreMobileLayout,
  expectStoreProductCard,
  expectStoreProductImages
} from '../../steps/store.steps';
import { saveTestResultReport } from '../../utils/test-report.helper';

test.describe('Store UI', () => {
  test.afterEach(async ({ page }, testInfo) => {
    await saveTestResultReport(page, testInfo);
  });

  test('TC-UI-001 should show store layout @ui @store', async ({ page }) => {
    await expectStoreLayout(page);
  });

  test('TC-UI-002 should show store header elements @ui @store', async ({ page }) => {
    await expectStoreHeader(page);
  });

  test('TC-TH-005 should show store footer UI @ui @store @footer', async ({ page }) => {
    await expectStoreFooter(page);
  });

  test('TC-UI-003 should render store responsively on mobile viewport @ui @store @mobile', async ({ page }, testInfo) => {
    await expectStoreMobileLayout(page, testInfo);
  });

  test('TC-UI-004 should show product card information @ui @store @product', async ({ page }) => {
    await expectStoreProductCard(page);
  });

  test('TC-UI-005 should not show broken product images @ui @store @product', async ({ page }) => {
    await expectStoreProductImages(page);
  });

  test('TC-UI-006 should show cart page layout @ui @cart', async ({ page }) => {
    await expectCartLayout(page);
  });

  test('TC-UI-007 should show checkout page layout @ui @checkout', async ({ page }) => {
    await expectCheckoutLayout(page);
  });
});
