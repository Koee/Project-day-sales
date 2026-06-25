import type { Page } from '@playwright/test';
import { products } from '../fixtures/test-data';
import { CartPage } from '../pages/CartPage';
import { LoginPage } from '../pages/LoginPage';
import { StorePage } from '../pages/StorePage';

export async function expectCartLayout(page: Page): Promise<void> {
  const cartPage = new CartPage(page);

  await cartPage.openCart();
  await cartPage.expectCartLayoutVisible();
}

export async function expectCartEmptyOrItems(page: Page): Promise<void> {
  const cartPage = new CartPage(page);

  await cartPage.openCart();
  await cartPage.expectEmptyCartOrItemsVisible();
}

export async function prepareGuestCart(page: Page): Promise<void> {
  const storePage = new StorePage(page);
  const cartPage = new CartPage(page);

  await storePage.openProductWithSalesChannel();
  await storePage.addProductToCart(products.chaCaKg);
  await storePage.goToCart();
  await cartPage.waitForProductInCart(products.chaCaKg);
}

export async function prepareLoggedInCart(page: Page): Promise<void> {
  const loginPage = new LoginPage(page);

  await loginPage.expectAuthenticatedHeaderVisible();
  await prepareGuestCart(page);
}

export async function increaseCartQuantity(page: Page): Promise<void> {
  const cartPage = new CartPage(page);

  await prepareGuestCart(page);
  if (!(await cartPage.increaseProductQuantity(products.chaCaKg))) {
    throw new Error('Quantity increase control is not available for current cart item.');
  }
}

export async function removeCartItem(page: Page): Promise<void> {
  const cartPage = new CartPage(page);

  await prepareGuestCart(page);
  if (!(await cartPage.removeProduct(products.chaCaKg))) {
    throw new Error('Remove item control is not available for current cart item.');
  }
}

export async function expectCartTotal(page: Page): Promise<void> {
  const cartPage = new CartPage(page);

  await prepareGuestCart(page);
  if (!(await cartPage.expectSelectedTotalForProduct(products.chaCaKg))) {
    throw new Error('Cart total is not visible for current cart state.');
  }
}

export async function checkoutGuestCart(page: Page): Promise<void> {
  const cartPage = new CartPage(page);

  await prepareGuestCart(page);
  await cartPage.selectProduct();
  await cartPage.checkoutSelected();
}

export async function checkoutLoggedInCart(page: Page): Promise<void> {
  const cartPage = new CartPage(page);

  await prepareLoggedInCart(page);
  await cartPage.selectProduct();
  await cartPage.checkoutSelected();
}

export async function expectLoggedInCartPersistsAfterReload(page: Page): Promise<void> {
  const cartPage = new CartPage(page);

  await prepareLoggedInCart(page);
  if (!(await cartPage.expectProductPersistsAfterReload(products.chaCaKg))) {
    throw new Error('Cart item is not available to verify persistence after reload.');
  }
}
