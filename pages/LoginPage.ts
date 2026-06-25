import { expect, type Locator, type Page } from '@playwright/test';
import { env } from '../config/env';
import { urls } from '../config/urls';
import { gotoAndAssertPageAvailable } from '../utils/page-availability.helper';
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
    await this.openMenuForLoginReport();
  }

  // Mở form đăng nhập từ nút trực tiếp hoặc từ menu mobile.
  async openKeycloakLoginFromStore(): Promise<void> {
    await this.goto(urls.loginStart);
    await this.closeStickerIfVisible();
    await this.openLoginForm();
    await expect(this.page, 'Login action should redirect to Keycloak').toHaveURL(/keycloak-staging\.timdaythay\.com/i);
  }

  async expectAuthenticatedHeaderVisible(): Promise<void> {
    await this.goto(urls.loginStart);
    await this.closeStickerIfVisible();
    await this.hideVConsoleIfVisible();
    await expect(this.loginTrigger(), 'Login action should not be visible after successful login').toBeHidden();
    await expect(
      this.authenticatedUserAction(),
      'Header should show user action/avatar after successful login'
    ).toBeVisible();
  }

  async logoutConfiguredAccount(): Promise<void> {
    await this.goto(urls.loginStart);
    await this.closeStickerIfVisible();
    await this.hideVConsoleIfVisible();

    if (!(await this.logoutTrigger().isVisible().catch(() => false))) {
      await this.menuToggle().click();
    }

    if (!(await this.logoutTrigger().isVisible().catch(() => false))) {
      await this.loginWithConfiguredAccount();
      await this.goto(urls.loginStart);
      await this.closeStickerIfVisible();
      await this.hideVConsoleIfVisible();
    }

    if (!(await this.logoutTrigger().isVisible().catch(() => false))) {
      await this.menuToggle().click();
    }

    await this.clickLogoutAction();
    await this.page.waitForLoadState('domcontentloaded');
    await this.goto(urls.loginStart);
    await this.closeStickerIfVisible();
    await this.hideVConsoleIfVisible();
    if (!(await this.loginTrigger().isVisible().catch(() => false))) {
      await this.menuToggle().click();
    }
    await expect(
      this.loginTrigger().or(this.menuLoginTrigger()),
      'Login action should be visible again after logout'
    ).toBeVisible();
  }

  private async openLoginForm(): Promise<void> {
    const directLoginTrigger = this.loginTrigger();

    if (await directLoginTrigger.isVisible().catch(() => false)) {
      await directLoginTrigger.click();
      return;
    }

    const menuLoginTrigger = this.menuLoginTrigger();
    if (await menuLoginTrigger.isVisible().catch(() => false)) {
      await menuLoginTrigger.click();
      return;
    }

    if (env.keycloakLoginURL) {
      await gotoAndAssertPageAvailable(this.page, env.keycloakLoginURL, 'Keycloak login page');
      return;
    }

    await this.menuToggle().click();
    await this.menuLoginTrigger().click();
  }

  private async openMenuForLoginReport(): Promise<void> {
    const menuToggle = this.menuToggle();

    if (await menuToggle.isVisible().catch(() => false)) {
      await menuToggle.click();
      await expect(
        this.page.locator('.menu-header, .menu-body, .menu-mobile, .offcanvas, .drawer, nav:visible').first(),
        'Menu should be visible in the login success report screenshot'
      ).toBeVisible();
    }
  }

  private async openUserMenuIfPossible(): Promise<void> {
    await this.hideVConsoleIfVisible();
    const userAction = this.authenticatedUserAction();

    if (await userAction.isVisible().catch(() => false)) {
      await userAction.click();
    }
  }

  // Đóng sticker/popup nếu nó đang hiển thị trên trang.
  private async closeStickerIfVisible(): Promise<void> {
    const stickerCloseButton = this.page
      .locator('#wrapper .sticker-code .sticker-code__close')
      .or(this.page.locator('.sticker-code__close'))
      .first();

    if (await stickerCloseButton.isVisible().catch(() => false)) {
      await stickerCloseButton.click({ timeout: 2_000 }).catch(() => undefined);
    }
  }

  // Lấy trigger đăng nhập trên header.
  private async hideVConsoleIfVisible(): Promise<void> {
    await this.page.locator('#__vconsole').evaluateAll((elements) => {
      for (const element of elements) {
        (element as HTMLElement).style.display = 'none';
      }
    });
  }

  private loginTrigger(): Locator {
    return this.page
      .getByText(/Ä‘Äƒng nháº­p|dang nhap|login|log in|sign in/i)
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
  private authenticatedUserAction(): Locator {
    return this.page
      .locator('.user-avatar:visible, .user-name:visible, .logout-btn:visible')
      .or(this.page.getByRole('button', { name: /account|user|profile|tai khoan|dang xuat|logout/i }))
      .or(this.page.getByRole('link', { name: /account|user|profile|tai khoan|dang xuat|logout/i }))
      .first();
  }

  private logoutTrigger(): Locator {
    const logoutButtonName = /đăng xuất|dang xuat|log out|logout|sign out/i;

    return this.page
      .locator('.menu-cover a.menu-item:visible')
      .filter({ hasText: logoutButtonName })
      .or(this.page.getByRole('button', { name: logoutButtonName }))
      .or(this.page.getByRole('link', { name: logoutButtonName }))
      .or(this.page.locator('[role="button"]:visible, [role="menuitem"]:visible').filter({ hasText: logoutButtonName }))
      // TODO: Replace CSS fallback after inspecting the Day Sales logout DOM.
      .or(this.page.locator('button.logout, button.logout-btn, a.logout, a.logout-btn, .logout-btn'))
      .first();
  }

  private async clickLogoutAction(): Promise<void> {
    const logoutTrigger = this.logoutTrigger();

    await expect(logoutTrigger, 'Logout action should be visible for authenticated user').toBeVisible();
    await logoutTrigger.click();
  }

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
    await expect(this.page.locator('body'), 'Day Sales page body should be visible after auth redirect').toBeVisible();
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
    const loginButtonName = /đăng nhập|dang nhap|login|log in|sign in|continue/i;

    return this.page
      .locator('button.btn-submit, input.btn-submit')
      .or(this.page.getByRole('button', { name: loginButtonName }))
      // TODO: Replace CSS fallback after inspecting the Keycloak login DOM.
      .or(this.page.locator('button, input[type="submit"]').filter({ hasText: loginButtonName }))
      .first();
  }
}
