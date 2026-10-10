# 砍刀的个人网站

砍刀 / DarkKandaoMaster 的个人网站，原生 HTML、CSS 和 JavaScript，3D 房间用 Three.js。

网站：[darkkandaomaster.com](https://darkkandaomaster.com/)

| 页面          | 内容                                                         |
| ------------- | ------------------------------------------------------------ |
| `index.html`  | 首页：首屏、关于、作品（含小脚本）、联系方式                 |
| `room.html`   | 3D 房间：屋里的物件对应网站的各个板块，没有 WebGL 时显示截图 |
| `blog/`       | 博客入口（暂时没有文章）                                     |
| `resume.html` | 公开版简历（隐去真实姓名和电话），可下载 PDF                 |
| `404.html`    | 找不到页面                                                   |

所有字体、图片和 Three.js 都在本地托管，不请求第三方服务，没有统计和 Cookie。禁用 JavaScript 时内容照样完整可读。

## 目录

| 目录                 | 内容                                                       |
| -------------------- | ---------------------------------------------------------- |
| `assets/`            | 样式、脚本、字体、图片、简历 PDF、Three.js（全部会发布）   |
| `blog/`              | 博客页                                                     |
| `scripts/`           | 开发服务器、构建、导出 PDF/分享图、字体裁剪、Three.js 更新 |
| `tests/`             | Playwright 浏览器测试                                      |
| `docs/`              | 内容与素材来源说明                                         |
| `private/`（不入库） | 本地素材：简历原件、头像/立绘原图等，含真实信息不发布      |

## 本地预览

需要 Node.js 22 或更新版本。

```powershell
npm ci
npm run dev
```

打开 `http://127.0.0.1:4173`。

## 验证与构建

```powershell
npm run check
npm run format:check
npm test
npm run build
```

浏览器测试在 Windows 默认使用已安装的 Microsoft Edge，其他系统先执行 `npx playwright install chromium`。`npm run build` 只把公开文件复制到 `dist/`，清单在 `scripts/site-files.mjs`。

## 更新内容

| 内容                                  | 位置                                           |
| ------------------------------------- | ---------------------------------------------- |
| 首页文字、作品、联系方式              | `index.html`                                   |
| 房间里的物件和说明                    | `assets/js/room.js` 的 `ITEMS`                 |
| 简历                                  | `resume.html`                                  |
| 配色、排版、手机适配                  | `assets/css/site.css`                          |
| 房间页 / 简历样式                     | `assets/css/room.css`、`assets/css/resume.css` |
| 首页交互（时钟、复制、QuickSay 演示） | `assets/js/site.js`                            |

改完文字后要做的事：

1. **字体**：标题字体是 Noto Serif SC 的子集，只包含网站里出现过的字。新增文字后重新裁剪（需要 Python 和 fonttools、brotli）：

   ```powershell
   python scripts/subset-fonts.py <字体源文件目录>
   ```

   源文件从 [google/fonts](https://github.com/google/fonts) 下载：`NotoSerifSC[wght].ttf`、`InstrumentSerif-Italic.ttf`、`JetBrainsMono[wght].ttf`，许可证在 `assets/fonts/`。

2. **简历 PDF 和分享图**：保持 `npm run dev` 运行，另开终端执行 `npm run export:assets`，会重新生成 `assets/resume.pdf` 和 `assets/img/social-preview.png`。

3. **房间截图**（`assets/img/room.jpg`，没有 WebGL 时显示）：房间改动较大时重新截一张。

4. **图片**：新图片放进 `assets/img/` 前先去掉 EXIF 等元数据；游戏截图注意裁掉 UID。

升级 Three.js：`npm install --save-dev three@<版本>` 后运行 `npm run vendor`。

## 发布

推送 `main` 后，GitHub Actions（`.github/workflows/pages.yml`）先检查脚本、格式和依赖安全，再构建并对 `dist/` 跑浏览器测试，全部通过才发布到 GitHub Pages。仓库的 Settings → Pages → Source 应设为 **GitHub Actions**。

内容来源见 [docs/SOURCES.md](docs/SOURCES.md)。
