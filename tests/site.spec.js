import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const watchErrors = (page) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  return errors;
};

test('home shows who I am, the tools and how to reach me without failed resources', async ({
  page,
}) => {
  const errors = watchErrors(page);
  await page.goto('/');
  await expect(page).toHaveTitle(/砍刀/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('做点小工具');
  await expect(page.getByRole('img', { name: /砍刀的头像/ })).toBeVisible();
  for (const name of ['QuickSay', 'LineHush']) {
    await expect(page.getByRole('heading', { level: 3, name, exact: true })).toBeVisible();
  }
  await expect(page.getByRole('link', { name: '2837619550@qq.com', exact: true })).toHaveAttribute(
    'href',
    'mailto:2837619550@qq.com',
  );
  await page.locator('#contact').scrollIntoViewIfNeeded();
  expect(errors).toEqual([]);
});

test('the public pages never mention job hunting; only the resume does', async ({ page }) => {
  for (const path of ['/', '/room.html', '/blog/']) {
    await page.goto(path);
    await expect(page.locator('body')).not.toContainText(/求职|正在找|找工作|找实习/);
  }
  await page.goto('/resume.html');
  await expect(page.locator('main')).toContainText('求职意向');
});

test('no page or script exposes a phone number', async ({ request }) => {
  const paths = [
    '/',
    '/room.html',
    '/blog/',
    '/resume.html',
    '/assets/js/site.js',
    '/assets/js/room.js',
  ];
  for (const path of paths) {
    const body = await (await request.get(path)).text();
    expect(body, path).not.toMatch(/(?<!\d)1[3-9]\d{9}(?!\d)/);
  }
});

test('everything stays readable with JavaScript disabled', async ({ browser }) => {
  const base = process.env.SITE_URL || 'http://127.0.0.1:4173';
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(base);
  await expect(page.locator('#work .feature').first()).toBeVisible();
  await expect(page.locator('.cards .card')).toHaveCount(4);
  await page.goto(`${base}/room.html`);
  await expect(page.getByRole('img', { name: /砍刀的房间/ })).toBeVisible();
  await expect(page.locator('[data-item]')).toHaveCount(8);
  await context.close();
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`pages fit a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/room.html', '/blog/', '/resume.html']) {
      await page.goto(path);
      const [content, viewport] = await page.evaluate(() => [
        document.documentElement.scrollWidth,
        innerWidth,
      ]);
      expect(content, path).toBeLessThanOrEqual(viewport);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    }
  });
}

for (const path of ['/', '/room.html', '/blog/', '/resume.html', '/missing-page']) {
  test(`${path} meets automated WCAG AA checks`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
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
}
