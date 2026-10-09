import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';

// 先运行 npm run dev。生成的 PDF 和分享图会提交进仓库，GitHub Pages 不需要构建它们。
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined),
});
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto('http://127.0.0.1:4173/resume.html');
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: 'print' });
  await page.pdf({
    path: 'assets/resume.pdf',
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    tagged: true,
  });

  const b64 = async (file) => (await readFile(file)).toString('base64');
  const [avatar, serif, italic, mono] = await Promise.all([
    b64('assets/img/avatar-512.jpg'),
    b64('assets/fonts/kandao-serif.woff2'),
    b64('assets/fonts/instrument-serif-italic.woff2'),
    b64('assets/fonts/jetbrains-mono.woff2'),
  ]);
  await page.emulateMedia({ media: 'screen' });
  await page.setContent(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>
    @font-face{font-family:S;src:url(data:font/woff2;base64,${serif})}
    @font-face{font-family:I;font-style:italic;src:url(data:font/woff2;base64,${italic})}
    @font-face{font-family:M;src:url(data:font/woff2;base64,${mono})}
    *{box-sizing:border-box}
    body{margin:0;width:1200px;height:630px;background:#f5f1ea;color:#1f1b17;padding:56px 72px;display:flex;flex-direction:column;justify-content:space-between;
      background-image:radial-gradient(circle,#ddd3c5 1.2px,transparent 1.4px);background-size:26px 26px;font-family:system-ui,'Microsoft YaHei',sans-serif}
    .top,.bottom{display:flex;justify-content:space-between;align-items:center;font:500 15px M,monospace;letter-spacing:.16em;color:#6b635a}
    .top b{display:inline-block;width:9px;height:9px;border-radius:50%;background:#e2672b;margin-right:12px}
    main{display:flex;align-items:center;justify-content:space-between;gap:40px}
    h1{margin:0;font:900 76px/1.25 S,serif}
    h1 u{text-decoration:none;background:linear-gradient(transparent 84%,#e2672b 84%,#e2672b 94%,transparent 94%)}
    p{margin:18px 0 0;font:italic 34px I,serif;color:#a8431a}
    .face{position:relative;flex:none}
    .face img{width:300px;height:300px;border-radius:50%;border:10px solid #fffdf9;box-shadow:0 0 0 1px #ddd4c7,0 30px 50px -24px rgba(168,67,26,.5)}
    .face span{position:absolute;left:50%;bottom:-6px;transform:translateX(-50%) rotate(-4deg);font:italic 30px I,serif;background:#fffdf9;border:1px solid #ddd4c7;padding:0 18px 4px;border-radius:4px;white-space:nowrap}
  </style></head><body>
    <div class="top"><span><b></b>KANDAO'S DESK</span><span>DARKKANDAOMASTER.COM</span></div>
    <main><div><h1>做点小工具，<br>让日子<u>顺手</u>一点。</h1><p>Small tools, made with care.</p></div>
      <div class="face"><img src="data:image/jpeg;base64,${avatar}" alt=""><span>hello, world!</span></div></main>
    <div class="bottom"><span>砍刀 · QUICKSAY · LINEHUSH · SKILLS</span><span>✳</span></div>
  </body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'assets/img/social-preview.png' });
  console.log('Exported assets/resume.pdf and the 1200 × 630 social preview.');
} finally {
  await browser.close();
}
