# 单页 HTML 原型生成契约

## 交付闭环

下列三项是本文件唯一的强制路径，其余章节只解释细节：

1. 从 manifest 选择最小 UI pack 依赖闭包。
2. 所有业务状态只经 `PrototypeViewers` 提交；UI pack Adapter 仅渲染局部 state。
3. 交付前核对场景、锚点、Token 和正式文件结构。

## 1. 适用范围与优先级

本契约约束后续 AI 生成的所有单页 HTML 产品原型。根目录仅保留页面入口 HTML；配套 CSS、业务 JS、状态数据与运行时收进 `prototype/`。发生冲突时按以下顺序执行：

1. 用户在当前任务中的明确要求。
2. 当前所选 UI foundation 的 `design-system.md`、foundation 契约与基础源文件。
3. 当前所选 UI provider 的 manifest、组件契约与组件实现。
4. `ui/contract.md` 和对应 `PACK.md` 中的组合约束。
5. `addons/annotations/` 中的标注契约，以及 `runtime/viewer.js` 的只读渲染行为。

本文件只保存所有生成路径共享的硬约束。UI 生成、产品说明标注、本地作者服务、评审打点、截图和交付的操作步骤分别以同目录对应入口文档为准。

## 2. 视觉

- 在 `prototype/prototype.css` 中定义并使用与当前 foundation 的 `design-system.md` 和 `foundation/tokens.css` 一致的 Token。
- foundation 与 Case 色彩必须使用命名 token；布局尺寸只要来自当前材料，可保留在页面 CSS。
- 若需求新增视觉值但证据不足，不得创建猜测 token；应省略该视觉或用 `ponytail:` 标明当前上限与升级证据。
- Tailwind 若使用只能负责布局，例如 flex/grid、定位、宽高、溢出和响应式显隐；不得使用 Tailwind 颜色、边框、圆角、阴影、字体、字号、行高、间距或交互状态类覆盖 `ui-*` 视觉 token。

## 3. 状态与场景

- 所有原型都生成 `prototype/notes.snapshot.js`，它既是唯一标注数据源，也是 `PrototypeViewers` 的场景状态来源；禁止重复生成 `notes.json` 或把同一份卡片数据写进 HTML。
- 数据文件必须把对象赋给 `window.__PROTOTYPE_NOTES__`，并包含 `schemaVersion: 2`、基础完整 `state`、`activeScenario`、`scenarios`、`header`、`cards`。
- `scenarios` 使用以稳定场景 id 为键的对象；每个场景标准结构为 `{ extends?, state }`。`state` 表达页面、浮层、Tab、数据态等可组合业务状态；通过 `extends` 复用基础场景时只保存差异。
- `PrototypeViewers` 是状态单一来源；提交状态只使用 `registerState` / `setState` / `patchState` / `activateScenario`。
- UI pack 的 `state-adapter.js` 只提供组件局部 state 的 `normalize` / `render` 投影；原型业务 Adapter 负责调用它，UI pack 不得直接持有业务 state 或订阅 `PrototypeViewers`。
- 不得读取 DOM class、ARIA 或状态专用 `data-*` 反推业务状态，也不得为页面、浮层、Tab 或数据态新增标签属性协议。
- 卡片使用 `when` 对规范化后的完整 state 做 AND 匹配。主格式为平铺点路径，例如 `{ "product.page": "list", "product.layers.includes": "create", "product.tabs.modal": "rules" }`；简单等值也兼容嵌套对象。禁止生成 legacy `group` 规则。列表态卡片须同时约束 `product.layers` 为空数组，避免弹窗打开时仍显示列表说明。
- 无 `when` 的卡片始终显示。
- `header` 不参与分组，始终显示；右栏只展示带连线的说明卡片，不再使用统一说明框（`overview`）。

## 4. URL 场景

Viewer 负责 `?scene=<id>` 与 `?collapsed=1` 的恢复；业务 Adapter 不解析 URL，只消费统一 state。新产物只生成 `scene` 链接。

截图操作和验收见 [screenshots.md](screenshots.md)。

## 5. 标注

标注点的数量由需求决定，不设固定上限：

- 凡是需要交互描述或逻辑说明的点，都应建立标注并连线；不需要说明的控件不标注。
- 一个说明对应一个语义单元：共同完成一件事的控件合并为区域标注，例如「重置 + 查询」合为查询区，表格与其分页合为一个单元，不按 DOM 节点逐个拆分。
- 不得为凑数或求全把所有控件都连线，也不得因担心数量而漏掉真正需要说明的点。

- 原型目标元素优先复用稳定、唯一的 `id`；卡片用 `target.anchor` 保存不带 `#` 的 id，并可附带 `target.label` 供人和 AI 阅读。只有元素不适合拥有 id 时才添加 `data-prototype-note-target`，并以 `target.selector` 兼容绑定。
- 已有 `id` 的节点不得重复添加 `data-prototype-note-target`；标注锚点只表达身份，不保存业务状态。
- Viewer 创建右栏、连线、编号和移动端展示；主 HTML 不得硬编码这些内容。

交互标记与标注点彼此正交，独立使用：

- 用 `data-ui-interactive` 只标记**本次迭代业务中需要用户操作的入口**，在元素内侧右上角显示珊瑚色闪电符号。
- 判定来源是当前需求里新增或变更的操作，例如新菜单、新主按钮、新下拉、新的行内操作；不是页面上所有可点击控件。
- 同类重复操作只标一次：表格每行的编辑/删除只在首行（或该列的代表单元格）标记，禁止给每一行打闪电。
- 不标记：壳层品牌与顶导、侧栏收起、关闭、取消、分页跳转，以及与本次需求无关的既有菜单和控件。
- 交互标记不写说明文字、不占用说明卡片、不参与连线绘制；同一元素可同时作为 `target.anchor` 目标并带 `data-ui-interactive`。

## 6. 浮层

- Modal 遮罩只覆盖左侧产品区，不能覆盖右侧说明区。
- 为满足该约束，Modal 的 `.ui-overlay` 必须作为 `.ui-preview` 内部的定位子元素，或使用等价的产品区边界定位；禁止使用覆盖整个浏览器视口的全局 `fixed inset: 0` 浮层。
- Modal 打开时向 `PrototypeViewers` 提交浮层状态，只连接 `when` 匹配且目标可见的说明；关闭后恢复此前组合状态。
- Drawer 若作为产品交互，也应限制在左侧产品区内，不遮挡右侧说明。
- Modal / Drawer 必须在 `.ui-modal` / `.ui-drawer` 内层面板赋予稳定 `id`（推荐 `{overlayId}Panel`）；`target.anchor` 绑定内层面板 id。遮罩层 `.ui-overlay` 的 `id` 保留给浮层 Adapter、`aria-controls` 与 `role="dialog"`，不得作为标注连线锚点。

## 7. 交付文件

所有原型统一生成：

```text
prototype.html
prototype/
├─ prototype.css       # 页面与组件样式
├─ prototype.js        # 页面业务交互与状态 Adapter
├─ notes.snapshot.js   # 正式说明、场景与基础 state
└─ viewer.js           # 只读说明与状态协调运行时
screenshots/           # 需要交付验收截图时保留
assets/                # 仅出现图片、字体、音视频等静态资源时生成
```

- 根目录只允许 `prototype.html`、`prototype/`、`screenshots/`，以及按需创建的 `assets/`；不要在根目录散落 CSS、JS、snapshot 或运行时文件。
- HTML 在 `<head>` 中加载 `./prototype/prototype.css`，在 `</body>` 前依次加载 `./prototype/notes.snapshot.js`、`./prototype/viewer.js` 与 `./prototype/prototype.js`。路径必须相对 HTML，可在 `file://` 下直接双击使用。
- `prototype.html` 保留可读的页面 DOM、稳定锚点和少量资源引用；禁止内联大段 CSS 或业务脚本。超过少量启动配置的 JS 必须放入 `prototype/prototype.js`。
- `prototype/viewer.js` 从本 Skill 的 `runtime/viewer.js` 原样复制；不要把共享 Viewer 实现内联回 HTML。
- 截图只存入根目录 `screenshots/`，不作为页面运行依赖；`assets/` 不得为空目录。
- 标注编辑器、Inspector、Author Loader、本地服务、源码定位信息和 html-mark 都不属于正式交付物；Mark 仅用于单独生成的评审稿，可随时剥离。
- 禁止在 `prototype.html` 内联任何标注编辑逻辑（含 `file://` 专用脚本、`prompt()` 改说明、把卡片覆盖或自定义备注写入 localStorage）；`file://` 只读展示 snapshot，编辑必须走 [local-authoring.md](local-authoring.md) 的 `serve.mjs`。

## 8. 依赖

- 默认使用原生 HTML、CSS、JavaScript，不依赖外部 CDN。
- 只有用户明确要求，或原型目标无法用已有本地资源和平台原生能力合理实现时，才可引入外部 CDN。
- 引入前必须确认其必要性；不得为了图标、布局、基础组件或少量交互引入 Tailwind、Font Awesome、React、Ant Design 等外部资源。
- 图标优先使用文本符号、内联 SVG 或已有合法本地资源，并提供可访问名称。

## 9. 内容与数据

- 禁止从历史原型或其他任务带入任何示例业务名、系统名、菜单名、字段名、编码、人员、部门、渠道、日期或数据。
- 禁止把组件、Pattern 或 Preset 中的“系统名称”“示例条目”等结构示例误当成用户业务内容；复制后必须替换为当前需求或中性占位。
- 不得使用真实登录凭据、token、接口地址、个人信息、生产数据或未经授权的品牌资源。
- 本地 mock 只表达当前交互所需的最小数据关系，不扩写用户未要求的业务规则。
- 用户给出的信息不足以确定业务含义时，保持中性并明确待确认，不得“补全得更像真实系统”。

## 10. 可访问性

- 使用 `header`、`nav`、`main`、`aside`、`section`、`article` 等适当语义元素。
- 所有仅图标按钮必须提供明确的 `aria-label`。
- Tabs 必须维护 `role="tablist"`、`role="tab"`、`role="tabpanel"`、`aria-selected`、`aria-controls` 和 `aria-labelledby`。
- Dialog 必须维护 `role="dialog"`、`aria-modal="true"` 和可关联标题。
- 自定义 Select 必须维护 `aria-haspopup="listbox"`、`aria-expanded`、`role="listbox"`、`role="option"` 和 `aria-selected`。
- 树若使用 `role="tree"` / `treeitem`，必须至少维护 `aria-expanded`；若不实现必要键盘行为，应通过 `ponytail:` 明确其仅为静态或有限交互演示，不得宣称完整可访问树。
- 键盘焦点不能只依赖低对比度边框。未采集正式焦点视觉时保留浏览器可见焦点，并用 `ponytail:` 标注。
- 不得把设计系统已指出对比度不足的组合声明为通过无障碍验收。
