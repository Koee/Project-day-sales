import { chromium, type FullConfig } from '@playwright/test';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';
import { env } from './config/env';
import { LoginPage } from './pages/LoginPage';

export default async function globalSetup(_config: FullConfig): Promise<void> {
  if (shouldSkipAuthSetupForCurrentRun()) {
    return;
  }

  if (!env.loginEmail || !env.loginPassword) {
    return;
  }

  await mkdir(dirname(env.authStorageState), { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL: env.baseURL });

  try {
    await new LoginPage(page).loginWithConfiguredAccount();
    await page.context().storageState({ path: env.authStorageState });
  } finally {
    await browser.close();
  }
}

function shouldSkipAuthSetupForCurrentRun(): boolean {
  const command = process.argv.join(' ').replace(/\\/g, '/');

  return command.includes('tests/UI/store-ui.spec.ts') || command.includes('TC-TH-');
}
