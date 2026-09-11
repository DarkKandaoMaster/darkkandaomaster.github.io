# 砍刀的个人网站

翁路凯 / DarkKandaoMaster 的个人作品集，使用原生 HTML、CSS 和 JavaScript 构建。

网站：[darkkandaomaster.com](https://darkkandaomaster.com/)

包含个人介绍、四项项目、作品分类、技术能力、获奖经历、深浅主题、邮箱复制，以及可打印和下载的公开简历。全部内容和资源本地托管，访问首页不依赖第三方 API。禁用 JavaScript 仍可查看所有项目和联系方式。

## 本地预览

需要 Node.js 22 或更新版本。

```powershell
npm ci
npm run dev
```

打开 `http://127.0.0.1:4173`。预览服务器仅监听本机，并限制访问公开站点文件。

## 验证与构建

```powershell
npm run check
npm run format:check
npm test
npm run build
```

浏览器测试在 Windows 默认使用已安装的 Microsoft Edge。其他系统先执行 `npx playwright install chromium`。可以使用 `PLAYWRIGHT_CHANNEL` 环境变量指定已安装的浏览器，例如 `chrome`。

构建会重新生成项目内的 `dist/`，只复制公开网页、资源、CNAME 和 `.nojekyll`。开发工具、测试、文档不会包含在产物内。

## 更新内容

| 内容                             | 位置                          |
| -------------------------------- | ----------------------------- |
| 身份、介绍、项目、技术能力和荣誉 | `index.html`                  |
| 网页与 PDF 简历正文              | `resume.html`                 |
| 文字版简历                       | `assets/weng-lukai-resume.md` |
| 配色、布局、手机适配             | `assets/style.css`            |
| 简历排版与 A4 打印样式           | `assets/resume.css`           |
| 筛选、导航、主题与复制交互       | `assets/site.js`              |
| 在首屏绘制前恢复主题             | `assets/theme.js`             |
| 分享图片与简历导出               | `scripts/export-assets.mjs`   |

项目的 `data-category` 可以包含 `ai`、`data`、`tools`。添加或删除作品时，同时更新“全部”按钮的数量。所有项目详情使用原生 `details`，不依赖脚本。

字体 `heading-font.ttf` 是 Noto Serif SC 的标题字符子集，采用 SIL Open Font License，许可证见 `assets/OFL-NotoSerifSC.txt`。新增标题字符可使用系统字体回退；如需一致样式，可重新生成子集。项目预览 SVG 是原创功能示意，并在页面注明，不是实际运行截图。

更新简历或分享文案后，保持预览服务器运行，在另一个终端执行：

```powershell
npm run export:assets
```

它会重新生成 `assets/weng-lukai-resume.pdf` 和 `assets/social-preview.png`。发布前检查 PDF 页数与排版、分享图，以及所有简历版本中的内容一致性。公开简历提供邮箱和 GitHub 联系方式。

## 发布

仓库使用 GitHub Actions 发布，工作流见 `.github/workflows/pages.yml`，域名保持 `darkkandaomaster.com`。推送 `main` 后，工作流先检查脚本、格式和依赖安全，再构建并使用 Chromium 对 `dist/` 运行浏览器测试。所有检查成功后，只将 `dist/` 发布到 GitHub Pages；开发脚本、测试、文档和 AGENTS.md 不会作为网站文件发布。Pull Request 只执行验证，不部署。

GitHub 仓库的 Settings → Pages → Source 应设为 **GitHub Actions**（`build_type: workflow`）。其他静态托管服务也可使用 `dist/`。网站运行本身没有框架或 npm 运行时依赖。

发布后检查 GitHub Pages 构建状态、首页、字体图片、简历 PDF 和未知路径的 404。需要回退时，用 `git revert` 回退本次网站提交并重新发布，保留现有历史。

需求与内容依据见 [docs/SPEC.md](docs/SPEC.md)，验收记录见 [docs/VERIFICATION.md](docs/VERIFICATION.md)。
