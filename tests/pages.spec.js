import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('resume is readable on mobile and the PDF is a real downloadable document', async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/resume.html');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('翁路凯');
  await expect(page.locator('main')).toContainText('全国一等奖');
  const dimensions = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  expect(dimensions[0]).toBeLessThanOrEqual(dimensions[1]);
  const pdf = await request.get('/assets/weng-lukai-resume.pdf');
  expect(pdf.ok()).toBeTruthy();
  expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: '下载 PDF' }).click();
  expect((await download).suggestedFilename()).toBe('weng-lukai-resume.pdf');
  const markdown = await request.get('/assets/weng-lukai-resume.md');
  expect(markdown.ok()).toBeTruthy();
  expect(await markdown.text()).toContain('翁路凯');
  expect(await markdown.text()).not.toContain('联系电话');
});

test('resume and 404 are accessible, and unknown routes return a useful 404', async ({ page }) => {
  for (const path of ['/resume.html', '/a-page-that-does-not-exist']) {
    const response = await page.goto(path);
    expect(response.status()).toBe(path.includes('does-not-exist') ? 404 : 200);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      results.violations.map(({ id, nodes }) => ({
        id,
        nodes: nodes.map((node) => node.failureSummary),
      })),
    ).toEqual([]);
  }
  await page.getByRole('link', { name: '返回首页' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('把想法');
});

test('public links, local resources and navigation targets are valid', async ({
  page,
  request,
}) => {
  await page.goto('/');
  const links = await page
    .locator('a[href]')
    .evaluateAll((elements) => elements.map((element) => element.getAttribute('href')));
  for (const href of new Set(links)) {
    if (href.startsWith('#')) expect(await page.locator(href).count(), href).toBe(1);
    else if (!href.includes(':')) expect((await request.get(`/${href}`)).ok(), href).toBeTruthy();
  }
  const external = await page
    .locator('a[target="_blank"]')
    .evaluateAll((elements) => elements.every((element) => element.rel.includes('noopener')));
  expect(external).toBeTruthy();
  for (const path of ['/robots.txt', '/sitemap.xml', '/assets/social-preview.png'])
    expect((await request.get(path)).ok(), path).toBeTruthy();
});

test('preview server does not expose repository metadata or private local files', async ({
  request,
}) => {
  test.skip(Boolean(process.env.SITE_URL), 'Development-server boundary check');
  for (const path of [
    '/.git/config',
    '/package.json',
    '/AGENTS.md',
    '/assets/../AGENTS.md',
    '/assets/%2e%2e%2fAGENTS.md',
  ]) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
});
