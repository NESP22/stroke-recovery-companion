import { expect, type Page } from '@playwright/test';

/**
 * Assert the page has no horizontal overflow (content wider than the layout
 * viewport). A 1px tolerance absorbs sub-pixel rounding.
 */
export async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(
    scrollWidth,
    `horizontal overflow: scrollWidth ${scrollWidth} > clientWidth ${clientWidth}`,
  ).toBeLessThanOrEqual(clientWidth + 1);
}

/**
 * Complete onboarding through the "Do this later" shortcut, landing on Home.
 * Exercises the goal-selection and preset-choice forms along the way.
 */
export async function completeOnboarding(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Welcome');

  await page.getByRole('button', { name: 'Get started' }).click();

  // Step 1 — choose a goal to exercise the toggle form.
  await expect(page.locator('.goal-grid .choice-chip').first()).toBeVisible();
  await page.locator('.goal-grid .choice-chip').first().click();
  await expect(page.locator('.goal-grid .choice-chip').first()).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Next' }).click();

  // Step 2 — session length / rest / difficulty (preset chips).
  // "20 minutes" is unique to session length (rest choices are 5/10/15).
  await expect(page.getByRole('button', { name: '20 minutes' })).toBeVisible();
  await page.getByRole('button', { name: '20 minutes' }).click();
  await page.getByRole('button', { name: 'Next' }).click();

  // Step 3 — who this is for.
  await page.getByRole('button', { name: 'For myself' }).click();
  await page.getByRole('button', { name: 'Next' }).click();

  // Step 4 — text size / contrast / motion.
  await expect(page.getByRole('button', { name: 'Extra large' })).toBeVisible();
  await page.getByRole('button', { name: 'Next' }).click();

  // Step 5 — finish without taking the baseline.
  await expect(page.getByRole('button', { name: 'Do this later' })).toBeVisible();
  await page.getByRole('button', { name: 'Do this later' }).click();

  // Land on Home (onboarded profile no longer redirects).
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('.module-grid')).toBeVisible();
}

/**
 * Collect every interactive control (button/select/summary/link/checkbox) and
 * return the subset that is visible but smaller than 44×44 CSS px.
 *
 * Inline text links (computed display `inline`) and checkbox/radio inputs are
 * exempt: inline links sit in a text flow (WCAG target-size exception), and
 * checkbox/radio inputs are wrapped in a much larger clickable `.check-item`
 * label. Everything else must meet Apple's 44pt touch-target minimum, which is
 * deliberately more demanding than WCAG 2.2's 24px AA floor because the target
 * audience may have motor impairment.
 */
export async function undersizedTapTargets(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const SELECTOR =
      'button, select, summary, a[href], [role="button"], input[type="checkbox"], input[type="radio"]';
    const els = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
    const bad: string[] = [];
    for (const el of els) {
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      if (el.tagName === 'INPUT') continue; // checkbox/radio — label is the target
      if (el.tagName === 'A' && style.display === 'inline') continue; // inline text link
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue; // off-screen/empty
      if (rect.width < 44 || rect.height < 44) {
        const label =
          (el as HTMLElement).getAttribute('aria-label') ??
          (el as HTMLElement).textContent?.trim().slice(0, 40) ??
          el.tagName;
        bad.push(
          `<${el.tagName.toLowerCase()} class="${el.className}"> "${label}" = ${Math.round(rect.width)}×${Math.round(rect.height)}`,
        );
      }
    }
    return bad;
  });
}

export async function expectNoUndersizedTapTargets(page: Page): Promise<void> {
  const bad = await undersizedTapTargets(page);
  expect(bad, `undersized touch targets:\n${bad.join('\n')}`).toEqual([]);
}
