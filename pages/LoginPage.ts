import { expect, type Locator, type Page } from '@playwright/test';
import { env } from '../config/env';
import { urls } from '../config/urls';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Khởi tạo trang đăng nhập với Playwright page hiện tại.
  constructor(page: Page) {
    super(page);
  }

  // Đăng nhập bằng tài khoản cấu hình trong config/.env.
  async loginWithConfiguredAccount(): Promise<void> {
    if (!env.loginEmail || !env.loginPassword) {
      throw new Error('LOGIN_EMAIL and LOGIN_PASSWORD must be set in config/.env before running login checkout tests.');
    }

    await this.goto(urls.loginStart);
    await this.closeStickerIfVisible();
    await this.openLoginForm();
    await expect(this.page, 'Login action should redirect to Keycloak').toHaveURL(/keycloak-staging\.timdaythay\.com/i);

    await this.emailInput().fill(env.loginEmail);
    await this.passwordInput().fill(env.loginPassword);
    await this.submitLoginForm();
    await this.goto(urls.loginStart);
    await this.closeStickerIfVisible();
    await expect(this.loginTrigger(), 'Login action should disappear after successful login').toBeHidden();
  }

  // Mở form đăng nhập từ nút trực tiếp hoặc từ menu mobile.
  private async openLoginForm(): Promise<void> {
    const directLoginTrigger = this.loginTrigger();

    if (await directLoginTrigger.isVisible().catch(() => false)) {
      await directLoginTrigger.click();
      return;
    }

    await this.menuToggle().click();
    await this.menuLoginTrigger().click();
  }

  // Đóng sticker/popup nếu nó đang hiển thị trên trang.
  private async closeStickerIfVisible(): Promise<void> {
    const stickerCloseButton = this.page
      .locator('#wrapper .sticker-code .sticker-code__close')
      .or(this.page.locator('.sticker-code__close'))
      .first();

    if (await stickerCloseButton.isVisible().catch(() => false)) {
      await stickerCloseButton.click();
    }
  }

  // Lấy trigger đăng nhập trên header.
  private loginTrigger(): Locator {
    return this.page
      .locator('#usercol > div.flex-vertical > div.flex-column-center > span:nth-child(1)')
      .filter({ hasText: 'Đăng nhập' })
      .or(this.page.getByRole('link', { name: /đăng nhập|login|log in|sign in/i }))
      .or(this.page.getByRole('button', { name: /đăng nhập|login|log in|sign in/i }))
      .first();
  }

  // Lấy nút mở menu trên giao diện responsive.
  private menuToggle(): Locator {
    return this.page.locator('.burger-toggle').filter({ hasText: /Menu/i }).first();
  }

  // Lấy nút đăng nhập trong menu.
  private menuLoginTrigger(): Locator {
    return this.page.locator('.menu-header__btn').filter({ hasText: 'Đăng nhập' }).first();
  }

  // Submit form đăng nhập và chờ redirect thành công.
  private async submitLoginForm(): Promise<void> {
    await Promise.all([
      this.waitForSuccessfulLoginRedirect(),
      this.submitButton().click()
    ]);
  }

  // Chờ Keycloak redirect về Day Sales sau khi đăng nhập.
  private async waitForSuccessfulLoginRedirect(): Promise<void> {
    const daySalesHost = new URL(env.baseURL).host;

    await this.page.waitForURL(
      (url) => url.host === daySalesHost && !url.pathname.toLowerCase().includes('/callback'),
      { timeout: 45_000 }
    );
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {
      // Staging can keep background requests open after auth callback completes.
    });
  }

  // Lấy ô nhập email hoặc username trong form Keycloak.
  private emailInput(): Locator {
    return this.page
      .getByLabel(/email|e-mail|tài khoản|username|user name/i)
      .or(this.page.getByPlaceholder(/email|e-mail|tài khoản|username|user name/i))
      // TODO: Replace CSS fallback after inspecting the Keycloak login DOM.
      .or(this.page.locator('input[type="email"], input[name="username"], input#username'))
      .first();
  }

  // Lấy ô nhập mật khẩu trong form Keycloak.
  private passwordInput(): Locator {
    return this.page
      .getByLabel(/password|mật khẩu/i)
      .or(this.page.getByPlaceholder(/password|mật khẩu/i))
      // TODO: Replace CSS fallback after inspecting the Keycloak login DOM.
      .or(this.page.locator('input[type="password"], input[name="password"], input#password'))
      .first();
  }

  // Lấy nút submit form đăng nhập.
  private submitButton(): Locator {
    return this.page
      .locator('button.btn-submit')
      .filter({ hasText: 'Đăng nhập' })
      .or(this.page.getByRole('button', { name: /đăng nhập|login|log in|sign in|continue/i }))
      // TODO: Replace CSS fallback after inspecting the Keycloak login DOM.
      .or(this.page.locator('input[type="submit"], button[type="submit"]'))
      .first();
  }
}
