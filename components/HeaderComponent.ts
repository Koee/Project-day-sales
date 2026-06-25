import { expect, type Locator, type Page, type TestInfo } from '@playwright/test';
import { gotoAndAssertPageAvailable } from '../utils/page-availability.helper';

export class HeaderComponent {
  constructor(private readonly page: Page) {}

  // Verify header hiển thị các entry chính.
  async expectVisible(): Promise<void> {
    await expect(this.logo(), 'Header logo should be visible').toBeVisible();
    await expect(this.cartEntry(), 'Cart entry should be visible in header').toBeVisible();
    await expect(this.loginOrUserEntry(), 'Header should show login or user entry').toBeVisible();
  }

  // Verify vùng header hiển thị trước khi thao tác hoặc chụp report.
  async expectRootVisible(message = 'Header should be visible'): Promise<void> {
    await expect(this.root(), message).toBeVisible();
  }

  // Kiểm tra ô search trên header có sẵn để tương tác không.
  async hasSearchInput(): Promise<boolean> {
    return await this.searchInput().isVisible().catch(() => false);
  }

  // Tìm kiếm từ header hoặc mở URL kết quả nếu ô search không hiển thị.
  async search(productName: string, fallbackUrl: string, testInfo?: TestInfo, screenshotName?: string): Promise<void> {
    const searchInput = this.searchInput();

    if (!(await searchInput.isVisible().catch(() => false))) {
      await gotoAndAssertPageAvailable(this.page, fallbackUrl, 'Store search result');
      return;
    }

    await searchInput.click();
    await searchInput.fill(productName);
    if (testInfo && screenshotName) {
      await testInfo.attach(screenshotName, {
        body: await this.screenshot(),
        contentType: 'image/png'
      });
    }
    await searchInput.press('Enter');
    await this.page.waitForLoadState('domcontentloaded');
  }

  // Chụp vùng header search để đưa vào report.
  async attachSearchScreenshot(testInfo: TestInfo | undefined, attachmentName: string): Promise<void> {
    if (!testInfo) {
      return;
    }

    await this.focusSearchForReport();
    await testInfo.attach(attachmentName, {
      body: await this.screenshot(),
      contentType: 'image/png'
    });
  }

  // Focus ô search trên header để chuẩn bị chụp report.
  async focusSearchForReport(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await this.expectRootVisible('Header should be visible before capturing search report');
    await expect(this.searchInput(), 'Header searchbox should be visible before capturing search report').toBeVisible();
    await this.searchInput().click();
  }

  private async screenshot(): Promise<Buffer> {
    return await this.root().screenshot();
  }

  private root(): Locator {
    return this.page.locator('header, nav, .header, #header, [role="banner"]').first();
  }

  private logo(): Locator {
    return this.page
      .getByRole('link', { name: /brandLogo|logo/i })
      .or(this.page.locator('img[alt*="logo" i], header img, nav img').first())
      .first();
  }

  private cartEntry(): Locator {
    return this.page
      .getByRole('link', { name: /giỏ hàng|cart/i })
      .or(this.page.locator('a[href*="shoppingCart"], a.btn-cart'))
      .first();
  }

  private loginOrUserEntry(): Locator {
    return this.page
      .locator('a[href*="/user/profile"]:visible, #usercol:visible, #user-col:visible, .header-block--user:visible')
      .or(this.page.getByRole('link', { name: /đăng nhập|login|tôi|profile/i }))
      .or(this.page.getByRole('button', { name: /đăng nhập|login|tôi|profile/i }))
      .first();
  }

  private searchInput(): Locator {
    return this.page
      .locator('header input[placeholder]:visible, nav input[placeholder]:visible, input[placeholder]:visible')
      .first();
  }
}
