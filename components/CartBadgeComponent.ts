import { expect, type Locator, type Page } from '@playwright/test';
import { gotoAndAssertPageAvailable } from '../utils/page-availability.helper';

export class CartBadgeComponent {
  constructor(private readonly page: Page) {}

  // Verify entry giỏ hàng hiển thị trong header.
  async expectEntryVisible(): Promise<void> {
    await expect(this.entry(), 'Cart entry should be visible in header').toBeVisible();
  }

  // Verify badge giỏ hàng đang có ít nhất một sản phẩm.
  async expectHasItems(message = 'Cart badge/link should be visible'): Promise<void> {
    await expect(this.badgeWithItems(), message).toContainText(/[1-9]/);
  }

  // Mở giỏ hàng từ header hoặc dùng URL fallback nếu control không hiển thị.
  async openCart(fallbackUrl: string): Promise<void> {
    const cartLink = this.entry();

    if (await cartLink.isVisible().catch(() => false)) {
      await cartLink.click();
      return;
    }

    await gotoAndAssertPageAvailable(this.page, fallbackUrl, 'Cart page');
  }

  private entry(): Locator {
    return this.page
      .getByRole('link', { name: /giỏ hàng|cart/i })
      .or(this.page.getByRole('button', { name: /giỏ hàng|cart/i }))
      .or(this.page.locator('a[href*="shoppingCart"], a.btn-cart'))
      .first();
  }

  private badgeWithItems(): Locator {
    return this.page.locator('a.btn-cart:visible, a[href*="shoppingCart"]:visible').filter({ hasText: /[1-9]/ }).first();
  }
}
