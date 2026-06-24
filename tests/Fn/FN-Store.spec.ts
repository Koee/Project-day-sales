import { test } from '@playwright/test';
import {
  addProductToCartAsGuest,
  addProductToCartAsLoggedInUser,
  filterProductsByPrice,
  searchEmptyKeyword,
  openFirstProductDetail,
  showProductsByCategory,
  sortProductsByPrice,
  searchProductByKeywordWithoutAccents,
  searchProductByVietnameseKeyword,
  searchConfiguredProductByName,
  searchSpecialCharacterKeyword,
  searchUnknownProductByName
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

  test('TC-FN-003 should add product to cart as logged-in user @fn @store @cart @auth @auth-state', async ({ page }) => {
    await addProductToCartAsLoggedInUser(page);
  });

  test('TC-TK-001 should show product results when searching configured product @fn @store @search', async ({ page }) => {
    await searchConfiguredProductByName(page);
  });

  test('TC-TK-002 should not show product results when searching unknown product @fn @store @search @negative', async ({ page }) => {
    await searchUnknownProductByName(page);
  });

  test('TC-TK-003 should keep product listing visible when searching empty keyword @fn @store @search @negative', async ({ page }, testInfo) => {
    await searchEmptyKeyword(page, testInfo);
  });

  test('TC-TK-004 should handle special-character keyword from header searchbox @fn @store @search @negative', async ({ page }, testInfo) => {
    await searchSpecialCharacterKeyword(page, testInfo);
  });

  test('TC-TK-005 should show matching product when searching Vietnamese keyword with accents @fn @store @search', async ({ page }, testInfo) => {
    await searchProductByVietnameseKeyword(page, testInfo);
  });

  test('TC-TK-006 should show matching product when searching Vietnamese keyword without accents @fn @store @search', async ({ page }, testInfo) => {
    await searchProductByKeywordWithoutAccents(page, testInfo);
  });

  test('TC-SP-001 should show product list by category @fn @store @product @category', async ({ page }) => {
    await showProductsByCategory(page);
  });

  test('TC-SP-003 should filter products by price @fn @store @product @filter', async ({ page }) => {
    await filterProductsByPrice(page);
  });

  test('TC-SP-005 should sort products by price @fn @store @product @sort', async ({ page }) => {
    await sortProductsByPrice(page);
  });
});
