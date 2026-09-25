import { test, expect } from '@playwright/test';
import { CATEGORY, annotate, gotoOnboarded } from './helpers';

test.describe('forms', () => {
  test('onboarding flow completes and lands on Home', async ({ page }) => {
    annotate(
      test.info(),
      CATEGORY.FORMS,
      'Complete the 6-step onboarding form (goals, session length, who it is for, text size) and confirm it saves and lands on Home.',
    );
    await page.goto('/');
    await expect(page).toHaveURL(/\/onboarding/);

    // Step 1
    await page.getByRole('button', { name: 'Get started' }).click();
    await expect(page.locator('.onboarding-progress')).toHaveText('Step 2 of 6');
    await page.locator('.choice-chip').first().click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 3 (session defaults already selected)
    await expect(page.locator('.onboarding-progress')).toHaveText('Step 3 of 6');
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 4 (who this is for)
    await expect(page.locator('.onboarding-progress')).toHaveText('Step 4 of 6');
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 5 (text size / display, defaults already selected)
    await expect(page.locator('.onboarding-progress')).toHaveText('Step 5 of 6');
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 6 (summary) — finish to Home
    await expect(page.locator('.onboarding-progress')).toHaveText('Step 6 of 6');
    await page.getByRole('button', { name: 'Do this later' }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('.home-hero')).toBeVisible();

    // Persisted: reload still shows Home (not redirected back to onboarding).
    await page.reload();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('.home-hero')).toBeVisible();
  });

  test('mood check-in saves a rating', async ({ page }) => {
    annotate(
      test.info(),
      CATEGORY.FORMS,
      'Open Mood, pick a mood and fatigue rating, save, and confirm the "Saved on this device" confirmation appears.',
    );
    await gotoOnboarded(page);
    await page.goto('/mood');

    await page.locator('.rating-scale').nth(0).locator('button[aria-label="4"]').click();
    await page.locator('.rating-scale').nth(1).locator('button[aria-label="5"]').click();
    await page.getByRole('button', { name: 'Save my check-in' }).click();

    await expect(page.locator('.saved-note')).toContainText('Saved on this device');
  });

  test('settings changes apply and persist across reload', async ({ page }) => {
    annotate(
      test.info(),
      CATEGORY.FORMS,
      'In Settings, switch text size to Extra large and enable High contrast, then reload and confirm both persist.',
    );
    await gotoOnboarded(page);
    await page.goto('/settings');

    await page.getByRole('button', { name: 'Extra large' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-font-size', 'xl');

    await page
      .locator('label.check-item', { hasText: 'High contrast' })
      .locator('input')
      .check();
    await expect(page.locator('html')).toHaveAttribute('data-high-contrast', 'true');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-font-size', 'xl');
    await expect(page.locator('html')).toHaveAttribute('data-high-contrast', 'true');
  });
});
