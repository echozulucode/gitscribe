import { test, expect } from '@playwright/test';

test.describe('CommitIQ GUI Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:1420');
  });

  test('settings section with prompt template is present', async ({ page }) => {
    await expect(page.getByText('Settings')).toBeVisible();
    await expect(page.getByText('Prompt Template')).toBeVisible();
    
    // Check if we have a combobox for templates
    // Note: Playwright matches label text to adjacent input usually, or we find by role
    // Since we have a custom layout, finding the select might need a locator relative to the label
    // or simpler: find the select directly if it has unique attributes, or just check for existence
    // Here we just check if a combobox exists in the settings area
    await expect(page.locator('select').first()).toBeVisible();
  });

  test('ollama status UI is present', async ({ page }) => {
    // Ensure we are in Auto mode
    await page.getByText('Auto', { exact: true }).click();

    // Check for the model label
    await expect(page.getByText('OLLAMA MODEL')).toBeVisible();

    // Since Ollama might not be running in the test env, we expect either the dropdown OR the error message
    // We can check for the refresh button which is always there
    await expect(page.getByTitle('Refresh Models')).toBeVisible();
  });
});
