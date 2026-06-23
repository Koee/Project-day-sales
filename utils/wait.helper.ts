import type { Page } from '@playwright/test';

// Chờ trang sẵn sàng ở mức đủ ổn định để tiếp tục tương tác.
export async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {
    // Staging may keep long-polling connections open; DOM readiness is enough for interaction.
  });
}
