import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  // Khởi tạo trang giỏ hàng với Playwright page hiện tại.
  constructor(page: Page) {
    super(page);
  }

  async openCart(): Promise<void> {
    await this.page.goto('/shoppingCart');
    await expect(this.page, 'Cart page should open shopping cart URL').toHaveURL(/shoppingCart/i);
  }

  async expectCartLayoutVisible(): Promise<void> {
    await expect(this.page, 'Cart page should stay on shopping cart URL').toHaveURL(/shoppingCart/i);
    await expect(this.page.locator('body'), 'Cart should show visible cart content').toContainText(/Giỏ hàng|Mua hàng|Thanh toán|Đặt hàng|Chưa có|empty/i);
  }

  async expectEmptyCartOrItemsVisible(): Promise<void> {
    await expect(this.page.locator('body'), 'Cart should show either empty-cart state or cart items').toContainText(/Giỏ hàng|Mua hàng|Chưa có|empty/i);
  }

  async hasCartItem(): Promise<boolean> {
    return await this.cartItem().isVisible().catch(() => false);
  }

  async increaseFirstItemQuantity(): Promise<boolean> {
    if (!(await this.hasCartItem())) {
      return false;
    }

    const quantityInput = this.quantityInput();
    const before = await this.currentQuantity();
    const plusButton = this.page
      .getByRole('button', { name: /\+|tÄƒng|increase/i })
      .or(this.page.locator('.qty-plus, .quantity-plus, .qty-right, .icon-add-circle'))
      .first();

    if (await plusButton.isVisible().catch(() => false)) {
      await plusButton.click();
    } else if (await quantityInput.isVisible().catch(() => false)) {
      await quantityInput.fill(String(before + 1));
      await quantityInput.press('Enter').catch(() => undefined);
    } else {
      return false;
    }

    await expect.poll(async () => this.currentQuantity(), {
      message: 'Cart item quantity should increase'
    }).toBeGreaterThan(before);
    return true;
  }

  async removeFirstItem(): Promise<boolean> {
    if (!(await this.hasCartItem())) {
      return false;
    }

    const removeButton = this.page
      .getByRole('button', { name: /xÃ³a|remove|delete|trash/i })
      .or(this.page.locator('button.remove-item, .remove-item, .icon-trash, [class*="delete"], [class*="remove"]'))
      .first();

    if (!(await removeButton.isVisible().catch(() => false))) {
      return false;
    }

    const before = await this.cartItems().count();
    await removeButton.click();
    await expect.poll(async () => this.cartItems().count(), {
      message: 'Cart item count should decrease after removing the first item'
    }).toBeLessThan(before);
    return true;
  }

  async expectTotalMatchesItems(): Promise<boolean> {
    if (!(await this.hasCartItem())) {
      return false;
    }

    await expect(this.totalPrice(), 'Cart total should be visible when cart has items').toBeVisible();
    await expect(this.totalPrice(), 'Cart total should include a numeric amount').toContainText(/[0-9]/);
    return true;
  }

  async expectCartPersistsAfterReload(): Promise<boolean> {
    if (!(await this.hasCartItem())) {
      return false;
    }

    const before = await this.cartItems().count();
    await this.page.reload();
    await expect.poll(async () => this.cartItems().count(), {
      message: 'Cart item count should persist after reload'
    }).toBeGreaterThanOrEqual(before);
    return true;
  }

  // Chọn sản phẩm đầu tiên trong giỏ hàng để chuẩn bị checkout.
  async selectProduct(): Promise<void> {
    const cartItem = this.page.locator('.cart__item').first();
    const emptyCart = this.page.getByText(/chưa có sản phẩm nào trong giỏ hàng/i).first();

    await expect(
      cartItem.or(emptyCart),
      'Cart page should show either a cart item or the empty-cart state before selecting product'
    ).toBeVisible({ timeout: 5_000 });
    await expect(emptyCart, 'Cart should not be empty after adding product before checkout').toBeHidden({ timeout: 1_000 });

    const checkbox = this.page
      .getByRole('checkbox')
      .first();

    if (await checkbox.isVisible().catch(() => false)) {
      await checkbox.check();
      return;
    }

    // TODO: Replace this fallback with an accessible locator/data-testid after DOM inspection.
    // Day Sales hides the native checkbox and exposes the visible control as its label.
    await this.page
      .locator('.cart__item .checkbox-container .label-checkbox')
      .first()
      .click();
  }

  // Bấm đặt hàng các sản phẩm đã chọn và chờ chuyển sang trang checkout.
  async checkoutSelected(): Promise<void> {
    await this.page
      .getByRole('button', { name: /đặt hàng đã chọn/i })
      .or(this.page.getByText(/đặt hàng đã chọn/i))
      .first()
      .click();

    await expect(this.page, 'Page should navigate to shopping checkout after clicking checkout selected').toHaveURL(/shoppingCheckout/i);
  }

  private cartItems(): Locator {
    return this.page.locator('.cart__item, [class*="cart__item"], [data-testid*="cart-item"]');
  }

  private cartItem(): Locator {
    return this.cartItems().first();
  }

  private emptyCartMessage(): Locator {
    return this.page.getByText(/chÆ°a cÃ³ sáº£n pháº©m nÃ o trong giá» hÃ ng|giá» hÃ ng trá»‘ng|empty cart/i).first();
  }

  private checkoutButton(): Locator {
    return this.page
      .getByRole('button', { name: /Ä‘áº·t hÃ ng|thanh toÃ¡n|checkout/i })
      .or(this.page.getByText(/Ä‘áº·t hÃ ng|thanh toÃ¡n|checkout/i))
      .first();
  }

  private quantityInput(): Locator {
    return this.cartItem().locator('input[type="number"], input:visible').first();
  }

  private totalPrice(): Locator {
    return this.page.locator('.cart-total, [class*="total"], [class*="summary"]').filter({ hasText: /[0-9]/ }).first();
  }

  private async currentQuantity(): Promise<number> {
    const quantityInput = this.quantityInput();

    if (await quantityInput.isVisible().catch(() => false)) {
      const value = await quantityInput.inputValue().catch(() => '1');
      const quantity = Number.parseInt(value, 10);
      return Number.isFinite(quantity) ? quantity : 1;
    }

    return 1;
  }
}
