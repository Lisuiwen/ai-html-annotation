# 正式产品说明 Addon

## 能力

为原型叠加右侧说明卡片、SVG 连线、说明分组、移动端说明切换和业务操作闪电。

## 依赖

- 稳定目标锚点，优先使用元素现有的 `id`。
- `window.__PROTOTYPE_NOTES__` snapshot。
- `runtime/viewer.js`。
- 业务状态通过 `PrototypeViewers` 协调器注册和渲染。
- snapshot 使用显式 `scenarios`，深链使用 `?scene=<id>`；旧 `?state=<group>` 仅作兼容。

## 边界

- 本 Addon 不提供产品导航、表单、数据或反馈组件。
- 标注层专用视觉不得写入所选 UI 包的产品 Token。
- html-mark 评审 pin、Editor、Inspector 和本地服务不属于本 Addon。
- DOM 的 `hidden`、class 和 `aria-*` 是统一 JS 状态的渲染输出，不是业务状态真值源。
- 不为状态新增 `data-*`；无合适 `id` 时才使用 `data-prototype-note-target` 作为锚点兜底。

## 视觉约束

- 带右侧说明的原型使用左右分栏：左侧产品区 `minmax(720px, 82%)`，右侧说明区 `minmax(240px, 18%)`，两侧独立滚动。
- 标注点数量由实际需要说明的语义单元决定，不设固定上限；说明序号由 Viewer 按卡片顺序生成。
- `data-ui-interactive` 只用于本次迭代需要用户操作的业务入口，不用于壳层、关闭、取消、分页或每行重复操作。
- 交互标记使用珊瑚色 `#ff8d6b` 和白色 SVG 符号；该颜色只属于标注层，不得进入任何 UI 包的产品 Token。

## 资源

- 示例与声明式接口：`ui-annotations.html`
