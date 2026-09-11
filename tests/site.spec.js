import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home presents identity, real projects and contact without failed resources', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(response.url());
  });
  await page.goto('/');
  await expect(page).toHaveTitle(/砍刀/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('把想法');
  await expect(page.locator('.project-card')).toHaveCount(4);
  await expect(page.getByRole('link', { name: '2837619550@qq.com', exact: true })).toHaveAttribute(
    'href',
    'mailto:2837619550@qq.com',
  );
  await page.locator('#contact').scrollIntoViewIfNeeded();
  expect(errors).toEqual([]);
});

test('all work stays readable with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(process.env.SITE_URL || 'http://127.0.0.1:4173');
  await expect(page.locator('.project-card:visible')).toHaveCount(4);
  await page.locator('details summary').first().click();
  await expect(page.locator('details').first()).toHaveAttribute('open', '');
  await expect(page.locator('a[href="resume.html"]').first()).toBeVisible();
  await context.close();
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`layout fits a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.locator('#contact').scrollIntoViewIfNeeded();
    const dimensions = await page.evaluate(() => ({
      viewport: innerWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
}

test('light theme meets automated WCAG AA checks', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(
    results.violations.map(({ id, nodes }) => ({
      id,
      nodes: nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
    })),
  ).toEqual([]);
});
