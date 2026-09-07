# 安全政策

## 支持范围

当前仅支持默认公开分支中的实验性 0.x 代码。运行时工具面向本机可信文件，
不应暴露到局域网或公网，也不应处理来源不明的 HTML、snapshot 或 `.env`。

## 报告漏洞

请不要在公开 Issue 中发布未修复漏洞的利用代码、敏感文件或内部数据。
请发送至：

suiwenli4@gmail.com

报告至少包含受影响文件、复现步骤、影响范围和建议修复方向。若项目托管平台
支持私密 Security Advisory，也可以使用私密渠道提交。

## 当前已知边界

- `runtime/server/index.mjs` 是本地作者服务，不是生产 Web 服务，只应监听 `127.0.0.1`。
- `runtime/cli/screenshot.mjs` 只应运行可信的本地原型和标注数据。
- 作者写接口只接受同源 localhost JSON；源码和 snapshot 写回仍应限制在当前原型工作流内。
- Inspector 可能根据 `runtime/server/.env` 中的 `CODE_EDITOR` 配置启动本机 IDE。
- Author Tools Mark 可能将评审内容保存在浏览器 localStorage 或复制到剪贴板，但不会注入源 HTML。

收到有效报告后，维护者会确认问题、评估影响，并在适当时发布修复说明。
