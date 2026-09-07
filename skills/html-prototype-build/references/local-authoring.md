# 本地作者服务

## 适用范围

需要在浏览器中直接修改原型样式/文本、编辑正式说明、增删或排序卡片、重新绑定目标，或者使用 Inspector 跳转源码时使用本入口。

作者服务只绑定 `127.0.0.1`，动态注入 `runtime/author/` 工具，不修改原型源 HTML 的加载结构。

启动命令和页面操作见 [README.md](../README.md#本地作者服务)。

## Agent 边界

- 服务入口为 `runtime/server/index.mjs`；IDE 配置位于 `runtime/server/.env`。
- `file://` 双击只用于只读预览正式说明；改卡片须启动作者服务且配置 `--snapshot`。
- 直接修改样式/纯文本 → `author/tools/direct-edit/`，经 `/__prototype-author/edit` 写回源 HTML。
- 正式说明 → `author/tools/notes-editor/`，写回 snapshot。
- 临时评审 pin → `author/tools/mark/`，只写 localStorage。
- 源码定位 → `author/tools/inspector/`。
- Inspector 动态注入的 `data-insp-target` 仅用于当前作者会话行号映射，禁止保存为正式 selector 或 For-AI selector。
- `runtime/server/.env` 仅本机使用，不提交或分发。
