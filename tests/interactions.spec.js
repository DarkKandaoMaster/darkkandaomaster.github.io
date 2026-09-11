import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('project filters show matching work and restore all projects', async ({ page }) => {
  await page.goto('/');
  for (const [name, count] of [
    ['AI 应用', 2],
    ['数据探索', 2],
    ['效率工具', 1],
    ['全部', 4],
  ]) {
    const filter = page.getByRole('button', { name, exact: name !== '全部' });
    await filter.click();
    await expect(filter).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.project-card:visible')).toHaveCount(count);
    await expect(page.locator('#filter-status')).toContainText(`${count} 个作品`);
  }
});

test('theme can be toggled, persists after reload and meets WCAG AA', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '切换到深色主题' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.getByRole('button', { name: '切换到浅色主题' })).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(
    results.violations.map(({ id, nodes }) => ({
      id,
      nodes: nodes.map((node) => node.failureSummary),
    })),
  ).toEqual([]);
  await page.getByRole('button', { name: '切换到浅色主题' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('copy email writes the correct address and confirms success', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.getByRole('button', { name: '复制邮箱' }).click();
  await expect(page.locator('#copy-feedback')).toContainText('已复制');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('2837619550@qq.com');
});

test('clipboard denial provides a manual fallback without a false success message', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('Denied')) },
    });
  });
  await page.goto('/');
  await page.getByRole('button', { name: '复制邮箱' }).click();
  await expect(page.locator('#copy-feedback')).toContainText('请手动复制');
  await expect(page.locator('#copy-feedback')).not.toContainText('已复制');
});

test('blocked browser storage does not break theme or filters', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('Storage disabled');
      },
    });
  });
  await page.goto('/');
  await page.getByRole('button', { name: '切换到深色主题' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: '效率工具', exact: true }).click();
  await expect(page.locator('.project-card:visible')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('mobile navigation and native project details work with a keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: '跳到主要内容' })).toBeFocused();
  const link = page.getByRole('navigation').getByRole('link', { name: '02 作品' });
  await link.click();
  await expect(page).toHaveURL(/#work$/);
  await expect(link).toHaveAttribute('aria-current', 'location');
  const headingTop = await page
    .locator('#work-title')
    .evaluate((element) => element.getBoundingClientRect().top);
  const headerBottom = await page
    .locator('.site-header')
    .evaluate((element) => element.getBoundingClientRect().bottom);
  expect(headingTop).toBeGreaterThanOrEqual(headerBottom);
  const summary = page.locator('details summary').first();
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('details').first()).toHaveAttribute('open', '');
  await page.keyboard.press('Enter');
  await expect(page.locator('details').first()).not.toHaveAttribute('open', '');
});
