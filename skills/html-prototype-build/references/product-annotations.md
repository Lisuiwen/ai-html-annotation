# 产品说明标注

## 适用范围

所有原型都通过本入口维护 Viewer；功能说明、右侧标注、SVG 连线、交互意图、待确认项和业务操作闪电均在此定义。

产品说明标注属于正式原型文档，不等同于 html-mark 评审 pin。

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
└─ viewer.js
screenshots/
assets/                # 仅存在静态资源时创建
```

- 根目录只保留 `prototype.html`、`prototype/`、`screenshots/` 及按需生成的 `assets/`；全部页面 CSS、业务 JS、说明数据和 Viewer 都收进 `prototype/`。
- `prototype/notes.snapshot.js` 是唯一标注数据源，赋给 `window.__PROTOTYPE_NOTES__`。
- `prototype/viewer.js` 从本 Skill 的 `runtime/viewer.js` 原样复制。
- HTML 保留可读的页面 DOM、稳定锚点和配套资源的相对路径引用；已有 id 时不得重复添加 note-target。
- 禁止生成重复 `notes.json`，也禁止把同一份卡片数据内嵌进 HTML 或在根目录新增散落的配套文件。

## 标注边界

- snapshot 使用 `schemaVersion: 2` 和显式 `scenarios`；场景保存页面、浮层、Tab、数据态等可恢复的组合 state。
- 标注显示条件读取 `PrototypeViewers` state；标注不得创建独立业务状态。
- 卡片用 `when` 匹配组合状态；无 `when` 的卡片始终显示。列表态卡片须同时约束 `product.layers` 为空数组，避免弹窗打开时仍显示列表说明。
- 可选 `section` 字段为右栏插入分组标题；同组卡片相邻排列，标题仅在组内首卡前渲染一次。
- 场景对象可含 `label` 字段，供场景切换钮显示中文名称。
- 一个说明绑定一个业务语义单元，不按 DOM 节点逐个拆分，也不为凑数连线。
- `target.anchor` 优先引用元素已有的稳定 id（值不带 `#`）；无合适 id 时才用 `data-prototype-note-target` 和 `target.selector` 兜底。
- Modal / Drawer 说明须绑定内层面板 id（`.ui-modal` / `.ui-drawer`，推荐 `{overlayId}Panel`），不得绑定遮罩层 `.ui-overlay` id。
- `data-ui-interactive` 只标本次迭代需要用户操作的业务入口，不生成说明卡片或连线。
- 原型必须支持 `?scene=<id>` 与 `?collapsed=1`。

## 后续路径

- 需要浏览器编辑卡片或重新绑定目标：读取 [local-authoring.md](local-authoring.md)。
- 需要对页面写修改意见：读取 [review-mark.md](review-mark.md)。
- 需要按场景截图：读取 [screenshots.md](screenshots.md)。
