import { expect, type BrowserContext, type Locator, type Page } from '@playwright/test';
import { env } from '../config/env';
import { gotoAndAssertPageAvailable } from '../utils/page-availability.helper';

export class SandboxMailPage {
  private readonly page: Page;

  private constructor(page: Page) {
    this.page = page;
  }

  static async open(context: BrowserContext): Promise<SandboxMailPage> {
    const page = await context.newPage();
    await gotoAndAssertPageAvailable(page, env.sandboxMailURL, 'Sandbox mail page');
    return new SandboxMailPage(page);
  }

  async openPasswordResetMessage(): Promise<void> {
    const message = this.page.getByText('Thay Đổi Mật Khẩu', { exact: false }).first();

    await expect(message, 'Sandbox mail should show the password reset message').toBeVisible({ timeout: 30_000 });
    await message.click();
  }

  async confirmPasswordChange(): Promise<Page> {
    const confirmControl = this.confirmControl();

    await expect(confirmControl, 'Password reset email should contain a confirmation action').toBeVisible();

    const popupPromise = this.page.waitForEvent('popup').catch(() => null);
    await confirmControl.click();

    const popup = await popupPromise;
    const resetPage = popup ?? this.page;

    await resetPage.waitForLoadState('domcontentloaded');
    return resetPage;
  }

  private confirmControl(): Locator {
    return this.page
      .getByRole('link', { name: /xac nhan|thay doi mat khau|doi mat khau|confirm|reset password/i })
      .or(this.page.getByRole('button', { name: /xac nhan|thay doi mat khau|doi mat khau|confirm|reset password/i }))
      .or(this.page.locator('a[href*="reset"], a[href*="login-actions"], a[href*="keycloak"]'))
      .first();
  }
}
