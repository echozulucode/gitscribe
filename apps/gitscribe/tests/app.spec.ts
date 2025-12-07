import { test, expect } from '@playwright/test';

test.describe('GitScribe Features', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Tauri v2 IPC environment
    // This script runs before the page loads
    await page.addInitScript(() => {
      // @ts-ignore
      window.__TAURI_INTERNALS__ = {
        invoke: async (cmd: string, args: any) => {
          // console.log(`[MockIPC] ${cmd}`, args);

          if (cmd.startsWith('plugin:store|')) {
            return null;
          }
          
          if (cmd.startsWith('plugin:dialog|')) {
            return null;
          }

          switch (cmd) {
            case 'get_repo_refs_cmd':
              return ['HEAD', 'main', 'v1.0'];
            case 'get_ollama_models_cmd':
              return ['llama3', 'mistral'];
            case 'list_templates_cmd':
              return ['default.md'];
            case 'load_template_cmd':
              return 'Mock Template Content';
            case 'load_file_cmd':
              return 'Mock File Content';
            case 'generate_preview_cmd':
              return 'Mock Preview Content';
            default:
              return null;
          }
        },
        // Mock event system
        transformCallback: (callback: any) => callback,
        metadata: {}
      };
    });

    await page.goto('http://localhost:1420');
  });

  test('settings section with prompt template is present', async ({ page }) => {
    // Wait for app to stabilize
    await page.waitForTimeout(2000);

    await expect(page.getByText('Settings', { exact: true })).toBeVisible();
    await expect(page.getByText('Prompt Template')).toBeVisible();
    
    // Check for the dropdown
    await expect(page.locator('select').first()).toBeVisible();
  });

  test('ollama status UI is present', async ({ page }) => {
    // Click Auto to ensure we see the model selector
    // Use force click in case something is overlaying it temporarily
    await page.getByText('Auto', { exact: true }).click({ force: true });

    await expect(page.getByText('Ollama Model')).toBeVisible();
    await expect(page.getByTitle('Refresh Models')).toBeVisible();
  });
});