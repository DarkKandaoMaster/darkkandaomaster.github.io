import { test, expect } from '@playwright/test';

test('the resume is public-safe and its PDF is a real document', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/resume.html');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('砍刀');
  await expect(page.locator('main')).toContainText('已隐去真实姓名和电话');
  await expect(page.locator('main')).toContainText('某 AI 数据公司');
  const pdf = await request.get('/assets/resume.pdf');
  expect(pdf.ok()).toBeTruthy();
  expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: '下载 PDF' }).click();
  expect((await download).suggestedFilename()).toBe('resume.pdf');
});

test('the blog has an honest empty state', async ({ page }) => {
  await page.goto('/blog/');
  await expect(page.getByRole('heading', { name: '还没有文章' })).toBeVisible();
});

test('unknown routes return a useful 404', async ({ page }) => {
  const response = await page.goto('/a-page-that-does-not-exist');
  expect(response.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('页面走丢了');
  await expect(page.getByRole('link', { name: '回到首页' })).toHaveAttribute('href', '/');
});
