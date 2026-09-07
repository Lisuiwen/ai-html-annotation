# 产品说明标注

## 适用范围

所有原型都通过本入口维护 Viewer；功能说明、右侧标注、SVG 连线、交互意图、待确认项和业务操作闪电均在此定义。

产品说明标注属于正式原型文档，不等同于 Author Tools Mark 的临时评审 pin。

## 必读资源

1. [generation-contract.md](generation-contract.md) 中的“状态与场景”“标注”“浮层”和“交付文件”章节。
2. `../addons/annotations/ADDON.md` 与 `../addons/annotations/ui-annotations.html`。
3. 若标注 Modal 或 Drawer，从当前包的 manifest 选择 `feedback.modal` 或 `feedback.drawer` 并完整展开依赖。

## 正式产物结构

```text
prototype.html
prototype/
├─ prototype.css
├─ prototype.js
├─ notes.snapshot.js
├─ display-mode.js
├─ state.js
└─ viewer.js
screenshots/
assets/                # 仅存在静态资源时创建
```

- `prototype/notes.snapshot.js` 是唯一标注数据源，赋给 `window.__PROTOTYPE_NOTES__`。
- `prototype/display-mode.js`、`prototype/state.js`、`prototype/viewer.js` 分别从 `runtime/client/core/display-mode.js`、`runtime/client/core/state.js`、`runtime/client/notes/viewer.js` 原样复制，并按该顺序加载。
- HTML 保留可读页面 DOM、稳定锚点和配套资源相对路径；已有 id 时不得重复添加 note-target。
- 禁止生成重复 `notes.json`，也禁止把同一份卡片数据内嵌进 HTML。

## 标注边界

- snapshot 使用 `schemaVersion: 2` 和显式 `scenarios`；场景保存页面、浮层、Tab、数据态等可恢复组合 state。
- 标注显示条件读取 `PrototypeViewers` state；标注不得创建独立业务状态。
- 卡片用 `when` 匹配组合状态；无 `when` 的卡片始终显示。
- `target.anchor` 优先引用元素已有稳定 id；无合适 id 时才使用 `data-prototype-note-target` + `target.selector`。
- Modal / Drawer 说明绑定内层面板 id，不绑定遮罩层。
- `data-ui-interactive` 只标本次迭代需要用户操作的业务入口，不生成说明卡片或连线。
- 原型必须支持 `?scene=<id>` 与 `?collapsed=1`。

## 后续路径

- 浏览器直接编辑、编辑卡片或重新绑定目标：[local-authoring.md](local-authoring.md)。
- 页面评审意见：[review-mark.md](review-mark.md)。
- 按场景截图：[screenshots.md](screenshots.md)。
