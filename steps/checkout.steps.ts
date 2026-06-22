import type { Page } from '@playwright/test';
import { guestDeliveryAddress, products } from '../fixtures/test-data';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { StorePage } from '../pages/StorePage';

export async function muaHangKhongLogin(page: Page): Promise<void> {
  const storePage = new StorePage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  await storePage.openStore11();
  await storePage.searchProduct(products.chaCaKg);
  await storePage.addProductToCart(products.chaCaKg);
  await storePage.goToCart();

  await cartPage.selectProduct();
  await cartPage.checkoutSelected();

  await checkoutPage.openAddressForm();
  await checkoutPage.fillDeliveryAddress(guestDeliveryAddress);
}
