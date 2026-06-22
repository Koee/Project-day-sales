import type { Locator, Page } from '@playwright/test';

export function visibleFirst(locator: Locator): Locator {
  return locator.first();
}

export function byTextOrPattern(page: Page, text: string): Locator {
  return page.getByText(new RegExp(text, 'i')).first();
}
