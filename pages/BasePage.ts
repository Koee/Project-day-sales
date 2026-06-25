import type { Page } from '@playwright/test';
import { gotoAndAssertPageAvailable } from '../utils/page-availability.helper';
import { waitForPageReady } from '../utils/wait.helper';

export abstract class BasePage {
  protected readonly page: Page;

  // Lưu Playwright page dùng chung cho các page object.
  protected constructor(page: Page) {
    this.page = page;
  }

  // Điều hướng và dừng sớm nếu trang trả lỗi availability.
  protected async goto(path: string): Promise<void> {
    await gotoAndAssertPageAvailable(this.page, path, path);
    await waitForPageReady(this.page);
  }
}
