import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async selectProduct(): Promise<void> {
    const cartItem = this.page.locator('.cart__item').first();
    const emptyCart = this.page.getByText(/chưa có sản phẩm nào trong giỏ hàng/i).first();

    await expect(cartItem.or(emptyCart)).toBeVisible({ timeout: 5_000 });
    await expect(emptyCart).toBeHidden({ timeout: 1_000 });

    const checkbox = this.page
      .getByRole('checkbox')
      .first();

    if (await checkbox.isVisible().catch(() => false)) {
      await checkbox.check();
      return;
    }

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

    await expect(this.page).toHaveURL(/shoppingCheckout/i);
  }
}
