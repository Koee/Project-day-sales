import { expect, type Locator, type Page } from '@playwright/test';

export class FooterComponent {
  constructor(private readonly page: Page) {}

  // Verify footer hiển thị và có nội dung.
  async expectVisible(): Promise<void> {
    await this.expectRootVisible('Store footer should be visible');
    await expect(this.root(), 'Store footer should contain visible footer content').not.toHaveText(/^\s*$/);
  }

  // Verify vùng footer hiển thị trên trang.
  async expectRootVisible(message = 'Footer should be visible'): Promise<void> {
    await expect(this.root(), message).toBeVisible();
  }

  // Cuộn tới footer khi cần kiểm tra layout dài.
  async scrollIntoViewIfNeeded(): Promise<void> {
    await this.root().scrollIntoViewIfNeeded();
  }

  private root(): Locator {
    return this.page.locator('footer, .footer, [role="contentinfo"]').first();
  }
}
