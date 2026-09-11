# 个人网站实施说明

## 目标与设计

为翁路凯（DarkKandaoMaster / 强壮的砍刀）建立中文个人作品集，服务于实习招聘、开源项目介绍与技术交流。以用户提供的本地简历和 GitHub 公开仓库为事实来源。参考站点只用于理解编辑式排版，不复用其代码或个人内容。

设计采用浅纸色、墨绿、少量橙色、中文衬线大标题、细分隔线、原创工作台插图。默认浅色，支持深色主题。移动端重新组织布局。

## 技术与结构

原生 HTML、CSS、JavaScript，无运行时依赖。GitHub Actions 对 main 分支运行格式、语法、安全审计和浏览器测试，仅向 GitHub Pages 发布 dist 中的站点资源。测试使用 Playwright 和 axe。保留 CNAME 与 .nojekyll。

- `index.html`：身份、介绍、作品、能力、荣誉、联系。
- `resume.html`：可打印、可保存为 PDF 的公开简历。
- `assets/`：样式、交互、头像、原创 SVG、公开简历下载。
- `scripts/`：本地预览与静态产物构建。
- `tests/`：真实浏览器验证。
- `docs/`：需求、来源与验收记录。

## 命令

`npm install` 安装开发依赖；`npm run dev` 启动 http://127.0.0.1:4173；`npm run build` 生成 dist；`npm run check` 检查脚本；`npm test` 运行浏览器验收。默认测试使用 Windows 上已安装的 Edge，其他环境可通过 PLAYWRIGHT_CHANNEL 指定浏览器，或安装 Chromium。

## 代码约定

语义化 HTML、CSS 变量、两空格缩进、原生 button / a / details；核心正文静态渲染，JavaScript 逐步增强。

```js
const filterButtons = document.querySelectorAll('[data-filter]');
for (const button of filterButtons) {
  button.addEventListener('click', () => filterProjects(button.dataset.filter));
}
```

## 功能与验收

1. 首屏清楚呈现真实身份、2028 届本科在读、AI 应用 / 数据挖掘方向。
2. 四项作品：OmicsInferenceDeck、QuickSay、CastCount（简历中的 anime-face-clipper）、MathorCup 2026。链接可用，技术细节可展开，分类可筛选。
3. 页内导航在桌面和手机可操作，支持键盘、定位高亮、减少动态效果偏好。
4. 主题切换持久化；存储不可用时仍能使用网站。复制邮箱成功或失败均提供准确反馈。
5. 可查看和下载公开简历、使用邮件链接。公开版本只提供邮箱和 GitHub，不展示手机号及具体每周到岗时段。
6. 320、390、768、1024、1440px 无横向溢出；浅色与深色通过 axe WCAG AA 自动检查；无脚本和资源错误。
7. 禁用 JavaScript 仍可浏览所有作品和联系信息。404 页面、搜索元数据和社交分享图完整。
8. 构建文件仅包含公开站点资源；正式发布后核验页面、资源与 Pages 构建状态。

## 执行顺序

- [x] 基础工具、设计与内容来源记录。
- [x] 首页静态布局与视觉素材，浏览器检查并保存提交。
- [x] 筛选、主题、导航与联系交互，验证功能。
- [x] 公开简历、404、站点元数据与文档。
- [x] 多尺寸截图、可访问性与浏览器测试，审阅、发布和线上核验。

## 边界

- 始终：使用可核实内容，保留现有用户提交，资源本地化，发布前检查。
- 遇到需要用户信息或不可逆决策时暂停；普通设计、安装开发依赖、测试和可回退部署按用户无人值守授权自主执行。
- 不编造工作经历、量化成绩或照片；不发布私密信息；不使用追踪器、登录或无后端的假联系表单。
- 用户已明确要求全程自主执行，常规规范、方案和阶段审核由本次授权覆盖，无需中途确认。

## 资料

- 用户指定本地简历（读取于 2026-09-12），GitHub https://github.com/DarkKandaoMaster
- 参考 https://chasen-intro.vercel.app/
- GitHub Pages https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- 浏览器断言 https://playwright.dev/docs/test-assertions
