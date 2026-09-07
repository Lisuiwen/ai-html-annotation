# 交付与迭代

## 适用范围

需要整理最终文件、区分作者会话与正式交付稿，或根据反馈继续迭代时使用本入口。

操作说明见 [交付复检清单](delivery-checklist.md) 与 [README.md](../README.md#交付检查)。

## Agent 交付约束

### 作者 / 评审会话

- Author Tools 由 `runtime/server/index.mjs` 动态注入；Direct Edit、Mark、Notes Editor、Inspector 均不写入正式 HTML 的加载结构。
- 正式产品说明来自 snapshot + Client Runtime；Mark pin 只存在于浏览器 localStorage。

### 正式交付稿

- HTML 中不得存在 Author Bootstrap、Direct Edit、Notes Editor、Inspector、源码定位 token 或任何内联标注编辑脚本。
- 不需要额外移除 Mark 注入，因为新版 Mark 从不注入源 HTML。
- 根目录保留 `prototype.html`、`prototype/` 与 `screenshots/`；页面 CSS、业务 JS、snapshot 与 `display-mode.js` / `state.js` / `model.js` / `viewer.js` 均收进 `prototype/`。静态资源按需收进 `assets/`。

## 迭代分流

- 结构、布局、菜单或业务状态大改：[ui-generation.md](ui-generation.md)。
- 正式说明内容、顺序或目标变化：[local-authoring.md](local-authoring.md)。
- 评审文字反馈：[review-mark.md](review-mark.md) 导出 For AI 后修改源 HTML。
- 视觉状态变化后重新验收：[screenshots.md](screenshots.md)。
- 交付前最终核对：[delivery-checklist.md](delivery-checklist.md)。
