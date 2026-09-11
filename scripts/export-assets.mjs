import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';

// Start npm run dev first. Generated assets are committed for build-free GitHub Pages.
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined),
});
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto('http://127.0.0.1:4173/resume.html');
  await page.emulateMedia({ media: 'print' });
  await page.pdf({
    path: 'assets/weng-lukai-resume.pdf',
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    tagged: true,
  });

  const avatar = (await readFile('assets/avatar.jpg')).toString('base64');
  const font = (await readFile('assets/heading-font.ttf')).toString('base64');
  await page.emulateMedia({ media: 'screen' });
  await page.setContent(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>
    @font-face{font-family:Heading;src:url(data:font/ttf;base64,${font})}
    *{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#f7f8f2;color:#25392f;font-family:'Segoe UI','Microsoft YaHei',sans-serif;padding:54px 70px}
    header{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #cdd6c5;padding-bottom:22px;font-size:17px}header span{font-family:monospace;font-size:13px;color:#5c705c;letter-spacing:2px}
    main{display:flex;align-items:center;justify-content:space-between;height:415px}h1{font:600 70px/1.42 Heading,serif;margin:0;letter-spacing:2px}.sub{font:italic 27px Georgia,serif;color:#315d47;margin:22px 0 0}.name{font-size:18px;margin:0 0 16px;color:#586d54}
    .portrait{position:relative;width:315px;height:315px;background:#e9efdf;border:1px solid #c9d5bd;background-image:linear-gradient(#dbe3d1 1px,transparent 1px),linear-gradient(90deg,#dbe3d1 1px,transparent 1px);background-size:24px 24px;display:grid;place-items:center}.portrait img{width:204px;height:204px;border-radius:50%;border:8px solid #fafbf7}.portrait span{position:absolute;right:-17px;bottom:-25px;font:100px Georgia;color:#b95d30}
    footer{border-top:1px solid #cdd6c5;padding-top:17px;font-size:13px;color:#5c705c;display:flex;justify-content:space-between}
  </style></head><body><header><strong>砍刀 / KANDAO</strong><span>CODE · AI · DATA</span></header><main><div><p class="name">翁路凯 · DarkKandaoMaster</p><h1>把想法，<br>写成现实。</h1><p class="sub">From curiosity to creation.</p></div><div class="portrait"><img src="data:image/jpeg;base64,${avatar}" alt=""><span>✳</span></div></main><footer><span>保持好奇，认真创造。</span><span>darkkandaomaster.com</span></footer></body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'assets/social-preview.png' });
  console.log('Exported the PDF resume and 1200 × 630 social preview.');
} finally {
  await browser.close();
}
