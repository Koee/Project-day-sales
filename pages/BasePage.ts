import type { Page } from '@playwright/test';
import { waitForPageReady } from '../utils/wait.helper';

export abstract class BasePage {
  protected readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  protected async goto(path: string): Promise<void> {
    await this.page.goto(path);
    await waitForPageReady(this.page);
  }
}
