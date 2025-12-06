import { test, expect } from '@playwright/test';

test.describe('CommitIQ GUI Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:1420');
  });

  test('git ref comboboxes are present', async ({ page }) => {
    // Check if inputs have the list attribute pointing to git-refs
    const startInput = page.getByPlaceholder('Start (e.g. v1.0.0)');
    await expect(startInput).toBeVisible();
    await expect(startInput).toHaveAttribute('list', 'git-refs');
  });

  test('generation mode toggle works', async ({ page }) => {
    // Check default state (Auto)
    const autoBtn = page.getByText('Auto', { exact: true });
    const manualBtn = page.getByText('Manual', { exact: true });
    const generateBtn = page.getByRole('button', { name: /Generate/ });

    await expect(generateBtn).toHaveText('Generate with AI');

    // Click Manual
    await manualBtn.click();
    await expect(generateBtn).toHaveText('Generate Prompt');

    // Click Auto back
    await autoBtn.click();
    await expect(generateBtn).toHaveText('Generate with AI');
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