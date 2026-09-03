# 本地作者服务

## 适用范围

需要在浏览器中编辑正式说明、增删或排序卡片、重新绑定目标，或者使用 Inspector 跳转源码时使用本入口。

作者服务只绑定本机并动态加载工具，不修改原型源 HTML。

**启动命令、IDE 配置与浏览器操作见 [README.md](../README.md#本地作者服务)。**

## Agent 边界

- `file://` 双击只用于只读预览正式说明；改卡片须启动 `serve.mjs` 且配置 `--snapshot`，否则 Editor 保存会被拒绝。
- 编辑说明卡片 / 稳定 selector → Editor；临时评审 pin → html-mark（localStorage，不写 snapshot）；跳转源码 → Inspector。
- Inspector 动态注入的 `data-insp-target` 仅用于当前作者会话行号映射，禁止保存为正式 selector 或 For-AI selector。
- `runtime/.env` 仅本机使用，不提交或分发。
