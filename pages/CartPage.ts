import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

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

  async checkoutSelected(): Promise<void> {
    await this.page
      .getByRole('button', { name: /đặt hàng đã chọn/i })
      .or(this.page.getByText(/đặt hàng đã chọn/i))
      .first()
      .click();

    await expect(this.page, 'Page should navigate to shopping checkout after clicking checkout selected').toHaveURL(/shoppingCheckout/i);
  }
}
