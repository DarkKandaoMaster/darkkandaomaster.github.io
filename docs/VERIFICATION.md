# 验收记录

日期：2026-09-12。

## 本地验证

- `npm run check`：所有浏览器脚本、预览、构建和资源导出脚本语法检查通过。
- `npm run format:check`：通过；HTML、CSS、JavaScript、工作流与文档使用统一格式。
- `npm audit --registry=https://registry.npmjs.org --audit-level=moderate`：0 个已知漏洞。项目级 registry 固定为官方源，不修改用户全局设置。
- `npm run build`：通过；每次在仓库内安全清理并重新生成 dist，仅包含站点文件。
- `npm test`：18 项通过，Windows Microsoft Edge 129.0.2792.65。
- 桌面 1440px、手机 390px、深浅两种主题截图已实际查看；另以 320、768、1024px 检测横向溢出。
- 首页浅色、深色、简历和 404 均通过 axe 的 WCAG 2 A/AA、WCAG 2.1 AA 自动规则；另测试键盘跳转、导航和展开项目。自动规则不代表完整人工无障碍认证。
- 邮箱复制成功、剪贴板拒绝、存储不可用、无 JavaScript、作品筛选恢复、主题持久化均有浏览器测试。
- PDF 下载实际返回 `%PDF-` 文件，公开简历为一页 A4，中文文本可提取，最终页面已使用 PyMuPDF 渲染并目视检查。
- 社交分享图为 1200 × 630 PNG，已检查。
- 公开头像和字体按真实 JPEG / TrueType 类型命名，字体许可证随资源保留。
- GitHub API 已确认原 anime-face-clipper 地址重定向至 castcount。

## 审阅与发布设计

独立代码审阅检查了正确性、安全、可维护性、内容来源和部署方式。发现原有 Pages 根目录发布会同时暴露开发文件，因此改用 GitHub Actions，仅上传 dist。

工作流对 main 推送和 Pull Request 执行语法、格式、依赖安全、构建及 Chromium 浏览器测试。PR 不发布；main 的检查成功后部署至 github-pages 环境。Actions 固定为已核验官方版本的提交 SHA。

本机额外安装新版 Chromium 时遇到下载 CDN 的 TLS 连接重置，因此本地浏览器验证使用现有 Edge。GitHub Actions 已成功使用 Chrome Headless Shell 153.0.8010.12 执行全部 18 项测试，见 [PR 验证运行](https://github.com/DarkKandaoMaster/darkkandaomaster.github.io/actions/runs/34626483574)。

## 回退

后续网站改动可用 `git revert` 回退对应提交并推送 main，工作流将验证并发布回退后的 dist。此项目没有数据库迁移或不可逆状态变更。最初的占位网页保留在 Git 历史中。

## 线上验证

首次发布版本：`4c653a6dc18c8d1b277af9cedb454afb167d3252`，由 [PR #1](https://github.com/DarkKandaoMaster/darkkandaomaster.github.io/pull/1) 合入。独立审阅的最终结论为 Approve。

- [main 验证与部署运行](https://github.com/DarkKandaoMaster/darkkandaomaster.github.io/actions/runs/34626644855)：构建验证与部署两个 job 均成功。
- 正式地址 [https://darkkandaomaster.com/](https://darkkandaomaster.com/)：HTTP 200，浏览器显示新网站的正确标题与内容，已查看正式地址截图。
- GitHub Pages：`build_type: workflow`、`status: built`、HTTPS 强制开启，自定义域名保持不变。
- 对正式域名运行 Playwright：17 项适用测试通过。仅本地预览服务器的边界测试按环境排除，线上边界另外通过 HTTP 实测确认。
- `/resume.html`、PDF、头像、字体、分享图均返回 200；资源分别使用正确的 `application/pdf`、`image/jpeg`、`font/ttf`、`image/png` MIME。
- `/package.json`、`/AGENTS.md`、`/scripts/serve.mjs`、`/tests/site.spec.js`、`/docs/SPEC.md` 均返回 404。
- 正式域名下主题持久化、作品筛选、邮箱复制及失败反馈、键盘导航、移动端布局、无 JavaScript 阅读和 PDF 实际下载通过测试。
- 无网站 JavaScript 错误或资源加载错误。后续仅更新验收文档，不改变发布的站点文件。
