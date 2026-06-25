import { expect, type Page } from '@playwright/test';
import { createGuestDeliveryAddress, products } from '../fixtures/test-data';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { LoginPage } from '../pages/LoginPage';
import { StorePage } from '../pages/StorePage';

// Thực hiện flow mua hàng không cần đăng nhập.
export async function muaHangKhongLogin(page: Page): Promise<void> {
  const storePage = new StorePage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);
  const guestDeliveryAddress = createGuestDeliveryAddress();

  await storePage.openProductWithSalesChannel();
  await storePage.addProductToCart(products.chaCaKg);
  await storePage.goToCart();

  await cartPage.selectProduct();
  await cartPage.checkoutSelected();

  await checkoutPage.openAddressForm();
  await checkoutPage.fillDeliveryAddress(guestDeliveryAddress);
  await checkoutPage.completeAddressForm();
  await checkoutPage.changeShippingUnit();
  await checkoutPage.placeOrderAndWaitForSuccess();
}

// Thực hiện bước đăng nhập end-to-end bằng tài khoản cấu hình.
export async function dangNhapE2E(page: Page): Promise<void> {
  const loginPage = new LoginPage(page);

  await loginPage.expectAuthenticatedHeaderVisible();
}

// Thực hiện flow mua hàng sau khi người dùng đã đăng nhập.
export async function muaHangCoLogin(page: Page): Promise<void> {
  const storePage = new StorePage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);
  const guestDeliveryAddress = createGuestDeliveryAddress();

  await dangNhapE2E(page);

  await storePage.openProductWithSalesChannel();
  await storePage.addProductToCart(products.chaCaKg);
  await storePage.goToCart();

  await cartPage.selectProduct();
  await cartPage.checkoutSelected();

  await checkoutPage.ensureDeliveryAddress(guestDeliveryAddress);
  await checkoutPage.changeShippingUnit();
  await checkoutPage.placeOrderAndWaitForSuccess();
}

export async function openCheckoutWithGuestCart(page: Page): Promise<void> {
  const storePage = new StorePage(page);
  const cartPage = new CartPage(page);

  await storePage.openProductWithSalesChannel();
  await storePage.addProductToCart(products.chaCaKg);
  await storePage.goToCart();
  await cartPage.selectProduct();
  await cartPage.checkoutSelected();
}

export async function expectCheckoutLayout(page: Page): Promise<void> {
  const checkoutPage = new CheckoutPage(page);

  await openCheckoutWithGuestCart(page);
  await checkoutPage.expectCheckoutLayoutVisible();
}

export async function expectCheckoutAddressFields(page: Page): Promise<void> {
  const checkoutPage = new CheckoutPage(page);

  await openCheckoutWithGuestCart(page);
  await checkoutPage.expectAddressFieldsVisible();
}

export async function placeOrderWithMissingRequiredPhone(page: Page): Promise<void> {
  const checkoutPage = new CheckoutPage(page);
  const guestDeliveryAddress = createGuestDeliveryAddress();

  await openCheckoutWithGuestCart(page);
  if (!(await checkoutPage.placeOrderWithMissingPhoneAndExpectValidation(guestDeliveryAddress))) {
    throw new Error('Checkout address form is not available to verify missing phone validation.');
  }
}

export async function expectCheckoutSummaryMatchesCart(page: Page): Promise<void> {
  const checkoutPage = new CheckoutPage(page);

  await openCheckoutWithGuestCart(page);
  const summary = await checkoutPage.captureOrderSummary();
  expect(summary, 'Checkout order summary should contain product/amount information').toMatch(/[0-9]/);
}

export async function goBackToCartFromCheckout(page: Page): Promise<void> {
  const checkoutPage = new CheckoutPage(page);

  await openCheckoutWithGuestCart(page);
  if (!(await checkoutPage.goBackToCart())) {
    throw new Error('Checkout does not expose a visible back-to-cart control.');
  }
}

export async function expectInvalidCheckoutPhone(page: Page): Promise<void> {
  const checkoutPage = new CheckoutPage(page);
  const guestDeliveryAddress = createGuestDeliveryAddress();

  await openCheckoutWithGuestCart(page);
  if (!(await checkoutPage.expectInvalidPhoneValidation(guestDeliveryAddress, 'abcxyz'))) {
    throw new Error('Checkout address form is not available to verify invalid phone validation.');
  }
}
