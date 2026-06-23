import { expect, test } from '@playwright/test';
import { StorePage } from '../../pages/StorePage';
import { saveTestResultReport } from '../../utils/test-report.helper';

test.describe('Misc and Cross-browser', () => {
  test.afterEach(async ({ page }, testInfo) => {
    await saveTestResultReport(page, testInfo);
  });

  test('TC-CB-002 should show store on Safari-like mobile viewport without login assertion @misc @mobile', async ({ page }) => {
    const storePage = new StorePage(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await storePage.openStore11();
    await storePage.expectMobileLayout();
  });

  test('TC-CB-003 should use HTTPS on store pages @misc @security', async ({ page }) => {
    await page.goto('/store/11/');
    expect(page.url(), 'Store URL should use HTTPS').toMatch(/^https:\/\//i);
  });

  test('TC-CB-004 should not log JavaScript console errors on store load @misc @console', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    await page.goto('/store/11/');
    await page.waitForLoadState('domcontentloaded');

    expect(consoleErrors, 'Store should not emit JavaScript console errors while loading').toEqual([]);
  });
});
