# 正式产品说明 Addon

## 能力

为原型叠加右侧说明卡片、SVG 连线、移动端说明切换和业务操作闪电。

## 依赖

- 稳定目标锚点，优先使用元素现有的 `id`。
- `window.__PROTOTYPE_NOTES__` snapshot。
- `runtime/client/core/state.js` 提供 `PrototypeViewers`。
- `runtime/client/notes/model.js` 提供场景元数据与 `when` 纯匹配。
- `runtime/client/notes/viewer.js` 提供只读说明 DOM/连线渲染；正式交付同时加载 `runtime/client/core/display-mode.js` 处理 `product-only`。
- snapshot 使用显式 `scenarios`，深链使用 `?scene=<id>`。

## 边界

- 本 Addon 不提供产品导航、表单、数据或反馈组件。
- 标注层专用视觉不得写入所选 UI 包的产品 Token。
- Mark 评审 pin、Notes Editor、Inspector 和本地服务不属于本 Addon。
- Addon 只消费当前状态决定说明展示，不得新增业务状态源。
- 不为状态新增 `data-*`；无合适 `id` 时才使用 `data-prototype-note-target` 作为锚点兜底。

## 视觉约束

- 带右侧说明的原型使用左右分栏：左侧产品区 `minmax(720px, 82%)`，右侧说明区 `minmax(240px, 18%)`，两侧独立滚动。
- 标注点数量由实际需要说明的语义单元决定，不设固定上限；说明序号由 Viewer 按卡片顺序生成。
- `data-ui-interactive` 规则见 [generation-contract.md §5](../../references/generation-contract.md#5-annotations)；珊瑚色 `#ff8d6b` 只属于标注层，不得进入 UI 包产品 Token。

## 资源

- 示例与声明式接口：`ui-annotations.html`
