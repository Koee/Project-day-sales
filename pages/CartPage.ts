import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async selectProduct(): Promise<void> {
    const checkbox = this.page
      .getByRole('checkbox')
      .first();

    if (await checkbox.isVisible().catch(() => false)) {
      await checkbox.check();
      return;
    }

    // TODO: Inspect cart selection control with Playwright MCP if it is a custom checkbox.
    await this.page
      .locator('[data-testid*="select"], .checkbox, input[type="checkbox"]')
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
