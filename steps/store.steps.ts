import type { Page, TestInfo } from '@playwright/test';
import { env } from '../config/env';
import { products, searchKeywords, storeFilters } from '../fixtures/test-data';
import { LoginPage } from '../pages/LoginPage';
import { StorePage } from '../pages/StorePage';

export async function expectStoreLayout(page: Page): Promise<void> {
  const storePage = new StorePage(page);

  await storePage.openStore11();
  await storePage.expectStoreLayoutVisible();
}

export async function expectStoreHeader(page: Page): Promise<void> {
  const storePage = new StorePage(page);

  await storePage.openStore11ProductList();
  await storePage.expectHeaderVisible();
}

export async function expectStoreFooter(page: Page): Promise<void> {
  const storePage = new StorePage(page);

  await storePage.openStore11();
  await storePage.expectFooterVisible();
}

export async function expectStoreMobileLayout(page: Page, testInfo?: TestInfo): Promise<void> {
  const storePage = new StorePage(page);

  await page.setViewportSize({ width: 375, height: 812 });
  await storePage.openStore11();
  if (testInfo) {
    await testInfo.attach('store-mobile-full-page', {
      body: await storePage.fullPageScreenshot(),
      contentType: 'image/png'
    });
  }
  await storePage.expectMobileLayout();
}

export async function expectStoreProductCard(page: Page): Promise<void> {
  const storePage = new StorePage(page);

  await storePage.openStore11ProductList();
  await storePage.expectFirstProductCardVisible();
}

export async function expectStoreProductImages(page: Page): Promise<void> {
  const storePage = new StorePage(page);

  await storePage.openStore11();
  await storePage.expectProductImagesLoaded();
}

export async function openFirstProductDetail(page: Page): Promise<void> {
  const storePage = new StorePage(page);

  await storePage.openStore11();
  await storePage.openFirstProductDetail();
  await storePage.expectProductDetailVisible();
}

export async function addProductToCartAsGuest(page: Page): Promise<void> {
  const storePage = new StorePage(page);

  await storePage.openProductWithSalesChannel();
  await storePage.addProductToCart(products.chaCaKg);
  await storePage.expectCartBadgeVisible();
}

export async function addProductToCartAsLoggedInUser(page: Page): Promise<void> {
  const loginPage = new LoginPage(page);
  const storePage = new StorePage(page);

  await loginPage.expectAuthenticatedHeaderVisible();
  await storePage.openProductWithSalesChannel();
  await storePage.addProductToCart(products.chaCaKg);
  await storePage.expectCartBadgeVisible();
}

export async function searchConfiguredProductByName(page: Page): Promise<void> {
  const storePage = new StorePage(page);
  const productName = env.searchProductName || products.chaCaKg;

  await storePage.openStore11();
  await storePage.searchFromHeader(productName);
  await storePage.expectSearchResult(productName);
}

export async function searchUnknownProductByName(page: Page): Promise<void> {
  const storePage = new StorePage(page);
  const unknownProductName = `khong-co-san-pham-${Date.now()}`;

  await storePage.openStore11();
  await storePage.searchFromHeader(unknownProductName);
  await storePage.expectNoSearchResult(unknownProductName);
}

export async function searchEmptyKeyword(page: Page, testInfo?: TestInfo): Promise<void> {
  const storePage = new StorePage(page);

  await page.setViewportSize({ width: 1366, height: 900 });
  await storePage.openStore11ProductList();
  await storePage.searchFromHeader('', testInfo, 'TC-TK-003-header-search-empty-before-submit');
  await storePage.expectProductListVisibleAfterSearch();
  await storePage.focusHeaderSearchForReport();
}

export async function searchSpecialCharacterKeyword(page: Page, testInfo?: TestInfo): Promise<void> {
  const storePage = new StorePage(page);
  const specialCharacterKeyword = `khong-co-san-pham-${Date.now()}!@#`;

  await page.setViewportSize({ width: 1366, height: 900 });
  await storePage.openStore11ProductList();
  await storePage.searchFromHeader(specialCharacterKeyword, testInfo, 'TC-TK-004-header-search-special-before-submit');
  await storePage.expectProductListVisibleAfterSearch();
  await storePage.focusHeaderSearchForReport();
}

export async function searchProductByVietnameseKeyword(page: Page, testInfo?: TestInfo): Promise<void> {
  const storePage = new StorePage(page);

  await page.setViewportSize({ width: 1366, height: 900 });
  await storePage.openStore11ProductList();
  await storePage.searchFromHeader(products.chaCaKg, testInfo, 'TC-TK-005-header-search-vietnamese-accent-before-submit');
  await storePage.expectSearchResult(products.chaCaKg);
  await storePage.focusHeaderSearchForReport();
}

export async function searchProductByKeywordWithoutAccents(page: Page, testInfo?: TestInfo): Promise<void> {
  const storePage = new StorePage(page);

  await page.setViewportSize({ width: 1366, height: 900 });
  await storePage.openStore11ProductList();
  await storePage.searchFromHeader(products.chaCaKgWithoutAccents, testInfo, 'TC-TK-006-header-search-vietnamese-no-accent-before-submit');
  await storePage.expectSearchResult(products.chaCaKg);
  await storePage.focusHeaderSearchForReport();
}

export async function showProductsByCategory(page: Page): Promise<void> {
  const storePage = new StorePage(page);

  await storePage.openProductsByCategory(storeFilters.chaCaCategoryId);
  await storePage.expectProductListFilteredByCategory(storeFilters.chaCaCategoryId);
}

export async function filterProductsByPrice(page: Page): Promise<void> {
  const storePage = new StorePage(page);
  const priceFrom = Number(storeFilters.priceFrom);
  const priceTo = Number(storeFilters.priceTo);

  await page.setViewportSize({ width: 1366, height: 900 });
  await storePage.openStore11ProductList();
  await storePage.filterByPrice(storeFilters.priceFrom, storeFilters.priceTo);
  await storePage.expectProductPricesWithinRange(priceFrom, priceTo);
}

export async function sortProductsByPrice(page: Page): Promise<void> {
  const storePage = new StorePage(page);

  await page.setViewportSize({ width: 1366, height: 900 });
  await storePage.openStore11ProductList();
  await storePage.sortByLowestPrice();
  await storePage.expectProductPricesSortedAscending();
}
