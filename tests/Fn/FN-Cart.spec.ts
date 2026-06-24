import { test } from '@playwright/test';
import {
  checkoutGuestCart,
  checkoutLoggedInCart,
  expectCartEmptyOrItems,
  expectCartTotal,
  expectLoggedInCartPersistsAfterReload,
  increaseCartQuantity,
  removeCartItem
} from '../../steps/cart.steps';
import { saveTestResultReport } from '../../utils/test-report.helper';

test.describe('Cart Functional', () => {
  test.afterEach(async ({ page }, testInfo) => {
    await saveTestResultReport(page, testInfo);
  });

  test('TC-CART-001 should show empty cart or current cart items @fn @cart', async ({ page }) => {
    await expectCartEmptyOrItems(page);
  });

  test('TC-CART-002 should update quantity for cart item @fn @cart', async ({ page }) => {
    await increaseCartQuantity(page);
  });

  test('TC-CART-003 should remove product from cart @fn @cart', async ({ page }) => {
    await removeCartItem(page);
  });

  test('TC-CART-004 should show numeric cart total @fn @cart', async ({ page }) => {
    await expectCartTotal(page);
  });

  test('TC-CART-005 should allow guest cart checkout behavior without asserting OAuth @fn @cart @checkout', async ({ page }) => {
    await checkoutGuestCart(page);
  });

  test('TC-CART-006 should navigate logged-in cart to checkout @fn @cart @checkout @auth @auth-state', async ({ page }) => {
    test.setTimeout(60_000);
    await checkoutLoggedInCart(page);
  });

  test('TC-CART-007 should persist logged-in cart after refresh @fn @cart @auth @auth-state', async ({ page }) => {
    await expectLoggedInCartPersistsAfterReload(page);
  });
});
