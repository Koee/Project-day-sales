import { test } from '@playwright/test';
import {
  addProductToCartAsGuest,
  addProductToCartAsLoggedInUser,
  openFirstProductDetail,
  searchProductByName
} from '../../steps/store.steps';
import { saveTestResultReport } from '../../utils/test-report.helper';

test.describe('Store Functional', () => {
  test.afterEach(async ({ page }, testInfo) => {
    await saveTestResultReport(page, testInfo);
  });

  test('TC-FN-001 should open product detail from store product card @fn @store @product', async ({ page }) => {
    await openFirstProductDetail(page);
  });

  test('TC-FN-002 should add product to cart as guest @fn @store @cart', async ({ page }) => {
    await addProductToCartAsGuest(page);
  });

  test('TC-FN-003 should add product to cart as logged-in user @fn @store @cart @auth', async ({ page }) => {
    await addProductToCartAsLoggedInUser(page);
  });

  test('TC-FN-004 should search product by name when search is available @fn @store @search', async ({ page }) => {
    await searchProductByName(page);
  });
});
