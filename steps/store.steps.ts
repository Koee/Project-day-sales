import { test, type Page } from '@playwright/test';
import { products } from '../fixtures/test-data';
import { LoginPage } from '../pages/LoginPage';
import { StorePage } from '../pages/StorePage';

export async function expectStoreLayout(page: Page): Promise<void> {
  const storePage = new StorePage(page);

  await storePage.openStore11();
  await storePage.expectStoreLayoutVisible();
}

export async function expectStoreHeader(page: Page): Promise<void> {
  const storePage = new StorePage(page);

  await storePage.openStore11();
  await storePage.expectHeaderVisible();
}

export async function expectStoreMobileLayout(page: Page): Promise<void> {
  const storePage = new StorePage(page);

  await page.setViewportSize({ width: 375, height: 812 });
  await storePage.openStore11();
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

  await loginPage.loginWithConfiguredAccount();
  await storePage.openProductWithSalesChannel();
  await storePage.addProductToCart(products.chaCaKg);
  await storePage.expectCartBadgeVisible();
}

export async function searchProductByName(page: Page): Promise<void> {
  const storePage = new StorePage(page);

  await storePage.openStore11();
  test.skip(!(await storePage.hasSearchInput()), 'Store search input is not visible on current staging UI.');
  await storePage.searchProduct(products.chaCaKg);
  await storePage.expectSearchResult(products.chaCaKg);
}
