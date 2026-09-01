# 交付与迭代

## 适用范围

需要整理最终文件、区分评审稿与正式交付稿，或根据反馈继续迭代时使用本入口。

## 两种交付状态

### 评审稿

- 保留 `runtime/prepare-mark.mjs --inline` 生成的 html-mark 注入块。
- 可双击打开并继续打 pin。
- 正式产品说明仍来自 snapshot + Viewer，评审 pin 只存在于浏览器 localStorage。

### 正式交付稿

- 运行 `node <skill-root>/runtime/prepare-mark.mjs <prototype.html> --remove`。
- HTML 中不得存在 Author Loader、Editor、html-mark、Inspector、源码定位 token，以及任何内联标注编辑脚本（含把说明写入 localStorage 的 `file://` 变通方案）。
- 根目录保留 `prototype.html`、`prototype/` 与 `screenshots/`；页面 CSS、业务 JS、snapshot 与 Viewer 均收进 `prototype/`。图片、字体等静态资源仅在需要时收进 `assets/`，不要在根目录散落 CSS、JS、snapshot 或 Viewer。

## 迭代分流

- 结构、布局、菜单或业务状态大改：返回 [ui-generation.md](ui-generation.md)。
- 正式说明内容、顺序或目标变化：使用 [local-authoring.md](local-authoring.md)。
- 仅有评审文字反馈：按 [review-mark.md](review-mark.md) 的 For AI 数据修改源 HTML。
- 视觉状态变化后需要重新验收：运行 [screenshots.md](screenshots.md)。
