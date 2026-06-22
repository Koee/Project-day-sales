import type { Page } from '@playwright/test';

export async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle').catch(() => {
    // Staging may keep long-polling connections open; DOM readiness is enough for interaction.
  });
}
