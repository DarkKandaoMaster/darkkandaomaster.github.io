import { test, expect } from '@playwright/test';

test('copy buttons put the email and group number on the clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  for (const [name, text] of [
    ['复制邮箱', '2837619550@qq.com'],
    ['复制群号', '1026364290'],
  ]) {
    const button = page.locator(`[data-label="${name}"]`);
    await button.click();
    await expect(button).toHaveText('已复制');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(text);
  }
});

test('clicking a QuickSay phrase types it into the message box', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: '请用简体中文回答。' }).click();
  await expect(page.locator('[data-chat]')).toHaveText('请用简体中文回答。');
});

test('the clock shows the time in Huzhou', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-clock]')).toHaveText(/^\d{2}:\d{2}$/);
});

test('the room explains each object and links to its section', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/room.html');
  await page.locator('[data-item="diary"]').click();
  await expect(page.locator('[data-detail-title]')).toHaveText('日记本');
  await expect(page.locator('[data-detail-link]')).toHaveAttribute('href', './#work');
  await page.locator('[data-item="posters"]').click();
  await expect(page.locator('[data-detail-link]')).toBeHidden();
  await page.locator('[data-item="window"]').click();
  await page.locator('[data-detail-link]').click();
  await expect(page).toHaveURL(/#contact$/);
  expect(errors).toEqual([]);
});

test('the top navigation reaches the room and the blog', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: '主导航' });
  await nav.getByRole('link', { name: /房间/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('砍刀的房间.');
  await page
    .getByRole('navigation', { name: '主导航' })
    .getByRole('link', { name: /博客/ })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('博客.');
});
