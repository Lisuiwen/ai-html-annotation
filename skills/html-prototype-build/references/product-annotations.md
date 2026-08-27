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
prototype-assets/
├─ notes.snapshot.js
└─ viewer.js
```

- 外层只保留 `prototype.html`；全部正式配套文件都收进同一层 `prototype-assets/`。
- `prototype-assets/notes.snapshot.js` 是唯一标注数据源，赋给 `window.__PROTOTYPE_NOTES__`。
- `prototype-assets/viewer.js` 从本 Skill 的 `runtime/viewer.js` 原样复制。
- HTML 只保留稳定锚点和 snapshot、Viewer 的相对路径引用；已有 id 时不得重复添加 note-target。
- 禁止生成重复 `notes.json`，也禁止把同一份卡片数据内嵌进 HTML 或在外层新增其他配套目录。

## 标注边界

- snapshot 使用 `schemaVersion: 2` 和显式 `scenarios`；场景保存页面、浮层、Tab、数据态等可恢复的组合 state。
- 标注显示条件读取 `PrototypeViewers` state；标注不得创建独立业务状态。
- 卡片用 `when` 匹配组合状态；无 `when` 的卡片始终显示。
- 一个说明绑定一个业务语义单元，不按 DOM 节点逐个拆分，也不为凑数连线。
- `target.anchor` 优先引用元素已有的稳定 id（值不带 `#`）；无合适 id 时才用 `data-prototype-note-target` 和 `target.selector` 兜底。
- `data-ui-interactive` 只标本次迭代需要用户操作的业务入口，不生成说明卡片或连线。
- 原型必须支持 `?scene=<id>` 与 `?collapsed=1`。

## 后续路径

- 需要浏览器编辑卡片或重新绑定目标：读取 [local-authoring.md](local-authoring.md)。
- 需要对页面写修改意见：读取 [review-mark.md](review-mark.md)。
- 需要按场景截图：读取 [screenshots.md](screenshots.md)。
