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

本机额外安装新版 Chromium 时遇到下载 CDN 的 TLS 连接重置，因此本地浏览器验证使用现有 Edge；新版 Chromium 的验证由 GitHub Actions 执行，结果在部署完成后记录。

## 回退

后续网站改动可用 `git revert` 回退对应提交并推送 main，工作流将验证并发布回退后的 dist。此项目没有数据库迁移或不可逆状态变更。最初的占位网页保留在 Git 历史中。

## 线上验证

上线后记录工作流、正式域名状态、关键交互与非站点文件 404 结果。
