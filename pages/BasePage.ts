import type { Page } from '@playwright/test';
import { waitForPageReady } from '../utils/wait.helper';

export abstract class BasePage {
  protected readonly page: Page;

  // Lưu Playwright page dùng chung cho các page object.
  protected constructor(page: Page) {
    this.page = page;
  }

  // Điều hướng tới đường dẫn và chờ trang sẵn sàng để tương tác.
  protected async goto(path: string): Promise<void> {
    await this.page.goto(path);
    await waitForPageReady(this.page);
  }
}
