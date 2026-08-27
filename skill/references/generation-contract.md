# 单文件 HTML 原型生成契约

## 1. 适用范围与优先级

本契约约束后续 AI 生成的所有单文件 HTML 产品原型。发生冲突时按以下顺序执行：

1. 用户在当前任务中的明确要求。
2. 当前所选 UI foundation 的 `design-system.md`。
3. 当前所选 UI provider 的 foundation 与组件实现。
4. `ui/contract.md` 和对应 `PACK.md` 中的组合约束。
5. `addons/annotations/` 中的标注契约，以及 `runtime/viewer.js` 的只读渲染行为。

本文件只保存所有生成路径共享的硬约束。UI 生成、产品说明标注、本地作者服务、评审打点、截图和交付的操作步骤分别以同目录对应入口文档为准。

## 2. 强制生成流程

### 第一步：读取事实来源

生成代码前必须完整读取：

- `ui/catalog.md`
- `ui/contract.md`
- 当前所选 UI 包的 `PACK.md`
- 当前 foundation 的 `design-system.md` 与 `foundation.html`

随后只读取当前页面需要的 provider：

- 导航、侧栏、树、Tabs → navigation provider
- 输入、搜索、Select、字段 → form provider
- 筛选、工具栏、表格、分页 → data provider
- 提示、Modal、Drawer、Toast → feedback provider
- 右侧说明和 SVG 连线 → `addons/annotations/`，并复用 `runtime/viewer.js`

禁止为了方便一次性读取全部 UI 包或组件类别。不得只凭 `SKILL.md`、旧示例或模型记忆生成视觉和状态。

### 第二步：确认需求边界

- 提取用户明确给出的系统名、页面名、菜单、字段、数据、可见状态和交互。
- 信息不明确时不得猜系统名、产品名、组织名、用户身份、真实业务数据或正式品牌资源。
- 系统名未明确时使用“系统名称”“业务工作台”等中性占位，或直接省略品牌文字。
- 未确认的组件状态和行为不得按 Ant Design、Tailwind 或常见中后台经验补造。

### 第三步：选择最小组件片段

- 从已选择的 foundation 和 provider 复制满足需求的最小 HTML、CSS 和 JavaScript 片段，不复制无关组件或演示数据。
- 保留所选 UI 包声明的语义类、`role`、`aria-*`、`data-*` 和配套脚本。
- 删除未使用的组件样式和函数优于保留完整 UI Kit。
- 不新增未被要求的抽象、框架、构建工具、依赖或样板。

### 第四步：建立 token 驱动视觉

- 单文件内定义并使用与当前 foundation 的 `design-system.md`、`foundation.html` 一致的 Token。
- 颜色、字体、字号、行高、间距、控件尺寸、边框、圆角和阴影都必须引用 token；不得在业务组件中散落“相近”硬编码值。
- 若需求新增视觉值但证据不足，不得创建猜测 token；应省略该视觉或用 `ponytail:` 标明当前上限与升级证据。
- Tailwind 若使用只能负责布局，例如 flex/grid、定位、宽高、溢出和响应式显隐；不得使用 Tailwind 颜色、边框、圆角、阴影、字体、字号、行高、间距或交互状态类覆盖 `ui-*` 视觉 token。

### 第五步：建立唯一标注数据源、统一状态与显式场景

- 需要正式标注时生成 `prototype-assets/notes.snapshot.js`，它是唯一标注数据源；禁止重复生成 `notes.json` 或把同一份卡片数据写进 HTML。
- 数据文件必须把对象赋给 `window.__PROTOTYPE_NOTES__`，并包含 `schemaVersion: 2`、基础完整 `state`、`activeScenario`、`scenarios`、`header`、`cards`。
- `scenarios` 使用以稳定场景 id 为键的对象；每个场景标准结构为 `{ extends?, state }`。`state` 表达页面、浮层、Tab、数据态等可组合业务状态；通过 `extends` 复用基础场景时只保存差异。
- `state.activeGroup` 是旧 `group` 与现有作者工具的唯一兼容分组来源，不另设 `notesGroup`。
- `PrototypeViewers` 是状态单一来源。业务代码通过 `registerState` 注册 Adapter，通过 `setState` / `patchState` / `activateScenario` 提交状态；Adapter 再把状态渲染为 DOM 的 `hidden`、class 与 `aria-*`。
- 不得读取 DOM class、ARIA 或状态专用 `data-*` 反推业务状态，也不得为页面、浮层、Tab 或数据态新增标签属性协议。
- 卡片优先使用 `when` 对规范化后的完整 state 做 AND 匹配。主格式为平铺点路径，例如 `{ "product.page": "list", "product.layers.includes": "create", "product.tabs.modal": "rules" }`；简单等值也兼容嵌套对象。无 `when` 时才按旧 `group` 规则兼容。
- 无 `when` 且无旧 `group` 的卡片始终显示。旧 `group: "common"` 仍始终显示，其他旧 group 按 `state.activeGroup` 匹配。
- `header` 不参与分组，始终显示；右栏只展示带连线的说明卡片，不再使用统一说明框（`overview`）。

### 第五步半：URL scene 契约（无头截图 / 深链恢复）

原型必须支持用 URL 恢复任意显式场景与折叠态，供无头截图和深链分享使用：

- Viewer 读取 `?scene=<id>`，通过 `activateScenario(id)` 一次提交继承并规范化后的完整组合状态。
- 标注脚本读取 `?collapsed=1`：默认折叠右侧说明与 SVG 连线，只呈现页面视觉。
- 业务 Adapter 不再自行解析 URL；它只消费协调器下发的 state 并渲染对应 DOM 状态。
- 两个参数可叠加：`?scene=create&collapsed=1` 表示「新建场景 + 折叠说明」。
- 未传 `scene` 时激活 `activeScenario`；场景无效时回退顶层基础 `state`。
- `?state=<group>` 仅作为 schema v1 和旧深链兼容入口，由 Viewer 映射到同名 scenario 或旧标注组；新产物不得继续生成 `state` 链接。
- 该契约由 `runtime/viewer.js` 的 URL 读取与 `PrototypeViewers.activateScenario` 实现。

截图操作和验收见 [screenshots.md](screenshots.md)。

### 第六步：实现标注连线与交互标记

标注点的数量由需求决定，不设固定上限：

- 凡是需要交互描述或逻辑说明的点，都应建立标注并连线；不需要说明的控件不标注。
- 一个说明对应一个语义单元：共同完成一件事的控件合并为区域标注，例如「重置 + 查询」合为查询区，表格与其分页合为一个单元，不按 DOM 节点逐个拆分。
- 不得为凑数或求全把所有控件都连线，也不得因担心数量而漏掉真正需要说明的点。

连线实现约束：

- 原型目标元素优先复用稳定、唯一的 `id`；卡片用 `target.anchor` 保存不带 `#` 的 id，并可附带 `target.label` 供人和 AI 阅读。只有元素不适合拥有 id 时才添加 `data-prototype-note-target`，并以 `target.selector` 兼容绑定。
- 已有 `id` 的节点不得重复添加 `data-prototype-note-target`；标注锚点只表达身份，不保存业务状态。
- Viewer 运行时创建 `.ui-page`、`.ui-preview`、`.ui-notes`、说明卡片和 SVG；主 HTML 不得硬编码右栏 DOM、卡片正文或 Viewer CSS/逻辑。
- 起点连接左侧目标右边缘中点，终点连接右侧说明左边缘中点，使用 2 px 平滑贝塞尔曲线。
- 编号由脚本按当前激活说明组内的卡片顺序统一生成并回写 `.ui-note-index`；HTML 中不得写死序号，也不得按绘制顺序编号，否则连线被裁剪时序号会随滚动重排。
- 目标锚点或说明锚点任一端滑出所属容器可视矩形时，整条连线不绘制；不得把连线 clamp 到容器边缘。
- 悬停目标或说明时同步高亮目标、说明和路径。
- DOM 完成、左右区域滚动、窗口尺寸变化和状态切换后重新计算连线。
- anchor 或兼容 selector 找不到时保留卡片并显示“目标未找到”，不得静默删除说明或猜测绑定目标。

交互标记与标注点彼此正交，独立使用：

- 用 `data-ui-interactive` 只标记**本次迭代业务中需要用户操作的入口**，在元素内侧右上角显示珊瑚色闪电符号。
- 判定来源是当前需求里新增或变更的操作，例如新菜单、新主按钮、新下拉、新的行内操作；不是页面上所有可点击控件。
- 同类重复操作只标一次：表格每行的编辑/删除只在首行（或该列的代表单元格）标记，禁止给每一行打闪电。
- 不标记：壳层品牌与顶导、侧栏收起、关闭、取消、分页跳转，以及与本次需求无关的既有菜单和控件。
- 交互标记不写说明文字、不占用说明卡片、不参与连线绘制；同一元素可同时作为 `target.anchor` 目标并带 `data-ui-interactive`。
- 该符号必须用 SVG 背景实现而非 `::after` 文字内容，避免屏幕阅读器朗读装饰符号。
- 移动端保留这些业务操作标记；该场景连线已隐藏，标记是唯一的交互线索。

### 评审锚点（html-mark 兼容）

html-mark 的 `describeElement` 按以下优先级识别标注目标：
`id` > `data-mm-label` > `aria-label` > 语义标签（button/input/select/a/h1-h6）> 兜底 class。

生成原型时按以下顺序为关键语义单元提供锚点：

1. **优先使用语义化 HTML 标签**：button、input、select、a、h1-h6 等，html-mark 自动识别，无需额外属性。
2. **给关键区域添加 `id`**：筛选区、表格容器、统计面板、工具栏等语义单元应添加有意义的 `id`，同时满足 html-mark 识别和可访问性锚点需求。
3. **兜底使用 `data-mm-label`**：对于既无 id、aria-label，也不是语义标签的语义单元（如 `<div>` 容器、`<td>`、`<span>` 分组），添加 `data-mm-label="区域描述"` 提供精确锚点。

约束：

- 已有 `id` 的元素不再重复添加 `data-prototype-note-target` 或 `data-mm-label`。
- 只有缺少适合的 id 时，才以 `data-prototype-note-target` 作为正式标注兜底；它不得承载状态或动作。
- `data-mm-label` 的值应是人可读的中文描述，CSS 选择器路径由 html-mark 自动生成。
- 不逐 DOM 节点打标签，按语义单元粒度（查询区、表格、按钮组、输入区）标注。

### 第七步：实现浮层边界

- Modal 遮罩只覆盖左侧产品区，不能覆盖右侧说明区。
- 为满足该约束，Modal 的 `.ui-overlay` 必须作为 `.ui-preview` 内部的定位子元素，或使用等价的产品区边界定位；禁止使用覆盖整个浏览器视口的全局 `fixed inset: 0` 浮层。
- Modal 打开时向 `PrototypeViewers` 提交浮层状态，只连接 `when` 匹配且目标可见的说明；关闭后恢复此前组合状态。
- Drawer 若作为产品交互，也应限制在左侧产品区内，不遮挡右侧说明。

### 第八步：实现移动端

- 移动端必须隐藏 SVG 连线，并提供“查看说明 / 查看界面”整页切换按钮，保证说明内容不因隐藏连线而丢失。
- 切换按钮必须更新文字和 `aria-pressed`，且不依赖外部图标库才能理解。
- 交互与视觉细节以 `runtime/viewer.js` 的移动端实现为准。

### 第九步：生成交付文件

需要正式标注时只生成：

```text
prototype.html
prototype-assets/
├─ notes.snapshot.js
├─ viewer.js
└─ screenshots/    # 需要交付验收截图时保留
```

- HTML 在 `</body>` 前依次加载 `./prototype-assets/notes.snapshot.js` 与 `./prototype-assets/viewer.js`，路径必须相对 HTML，可在 `file://` 下直接双击使用。
- `prototype-assets/viewer.js` 从本 Skill 的 `runtime/viewer.js` 原样复制；不要把共享 Viewer 实现内联回 HTML。
- 标注编辑器、Inspector、Author Loader、本地服务、源码定位信息和 html-mark 都不属于正式交付物；Mark 仅用于单独生成的评审稿，可随时剥离。
- 研发作者态按 [local-authoring.md](local-authoring.md) 动态加载，不写入源 HTML；评审稿和正式交付稿的清理规则见 [delivery.md](delivery.md)。

### 第十步：代码质量与注释

- 产物必须是 UTF-8、`lang="zh-CN"`、包含 `<meta charset="UTF-8">` 的单个 HTML 文件；snapshot 与 Viewer 也使用 UTF-8。
- 所有函数必须有中文注释，说明其目的或状态影响。
- CSS、HTML 和 JavaScript 中的主要代码块必须有中文注释；注释应解释职责，不复述每行语法。
- 所有有意简化、未采集状态、静态占位或不完整交互必须按 `design-system.md` 第 5 节就地使用 `ponytail:`，写清当前上限、升级路径和所需证据。

### 第十一步：依赖控制

- 默认使用原生 HTML、CSS、JavaScript，不依赖外部 CDN。
- 只有用户明确要求，或原型目标无法用已有本地资源和平台原生能力合理实现时，才可引入外部 CDN。
- 引入前必须确认其必要性；不得为了图标、布局、基础组件或少量交互引入 Tailwind、Font Awesome、React、Ant Design 等外部资源。
- 图标优先使用文本符号、内联 SVG 或已有合法本地资源，并提供可访问名称。

### 第十二步（可选）：评审层注入

原型生成完毕后，只有用户明确需要评审稿时才按 [review-mark.md](review-mark.md) 注入 html-mark；正式交付默认不注入，用户明确说「不要打点」「不用评审」或「不加 html-mark」时跳过。

- 评审层必须使用 `<!-- html-mark-injection-begin -->` / `<!-- html-mark-injection-end -->` 边界，与产品代码隔离并可剥离。
- `.mm-*` 类前缀不得与设计系统 `ui-*` 类前缀混用。
- 评审 pin 不得写入正式 snapshot，Inspector 临时 token 不得成为导出 selector。

## 3. 内容与数据约束

- 禁止从历史原型或其他任务带入任何示例业务名、系统名、菜单名、字段名、编码、人员、部门、渠道、日期或数据。
- 禁止把类别包中的“系统名称”“示例条目”等结构示例误当成用户业务内容；复制后必须替换为当前需求或中性占位。
- 不得使用真实登录凭据、token、接口地址、个人信息、生产数据或未经授权的品牌资源。
- 本地 mock 只表达当前交互所需的最小数据关系，不扩写用户未要求的业务规则。
- 用户给出的信息不足以确定业务含义时，保持中性并明确待确认，不得“补全得更像真实系统”。

## 4. 状态与可访问性约束

- 使用 `header`、`nav`、`main`、`aside`、`section`、`article` 等适当语义元素。
- 所有仅图标按钮必须提供明确的 `aria-label`。
- Tabs 必须维护 `role="tablist"`、`role="tab"`、`role="tabpanel"`、`aria-selected`、`aria-controls` 和 `aria-labelledby`。
- Dialog 必须维护 `role="dialog"`、`aria-modal="true"` 和可关联标题。
- 自定义 Select 必须维护 `aria-haspopup="listbox"`、`aria-expanded`、`role="listbox"`、`role="option"` 和 `aria-selected`。
- 树若使用 `role="tree"` / `treeitem`，必须至少维护 `aria-expanded`；若不实现必要键盘行为，应通过 `ponytail:` 明确其仅为静态或有限交互演示，不得宣称完整可访问树。
- 键盘焦点不能只依赖低对比度边框。未采集正式焦点视觉时保留浏览器可见焦点，并用 `ponytail:` 标注。
- 不得把设计系统已指出对比度不足的组合声明为通过无障碍验收。

## 5. 强制验收清单

出现任一清单项未通过，产物即不通过；禁止带未通过项交付。

### 输入与来源

- [ ] 已通过 `ui/catalog.md` 确定唯一 foundation 和所需 provider。
- [ ] 已读取 `ui/contract.md`、所选 `PACK.md`、foundation 的设计事实和基础实现。
- [ ] 只读取了当前需求需要的类别包，没有一次性加载全部组件资源。
- [ ] 只复制了当前需求需要的最小组件片段。
- [ ] 未从旧示例带入任何业务名或业务数据。
- [ ] 系统名不明确时没有猜测。

### 视觉

- [ ] 所有视觉值来自 `--ui-*` token。
- [ ] 未用硬编码相近值覆盖已确认 token。
- [ ] Tailwind 若存在，仅负责布局且未覆盖 `ui-*` 视觉 token。
- [ ] 未把未采集状态写成正式已确认状态。
- [ ] 有意简化均带完整 `ponytail:` 注释。

### 标注与状态

- [ ] 每个需要交互描述或逻辑说明的语义单元都有标注，无凑数连线也无遗漏。
- [ ] 相邻控件已按语义单元合并，未按 DOM 节点逐个拆分标注。
- [ ] `prototype-assets/notes.snapshot.js` 是唯一标注数据源，没有重复 `notes.json` 或内嵌卡片副本。
- [ ] snapshot 使用 `schemaVersion: 2`，包含完整基础 `state`、`activeScenario` 与显式 `scenarios`；场景通过 `extends/state` 保存可恢复的组合业务状态。
- [ ] 业务状态只由 `PrototypeViewers` 管理，DOM class、ARIA、hidden 和属性只是 Adapter 的渲染输出。
- [ ] 卡片优先用 `when` 匹配组合状态；旧 `group/common` 仅保留兼容，不作为新场景建模方式。
- [ ] 只连接当前可见说明和当前可见元素。
- [ ] `?scene=<id>` 能通过协调器恢复对应组合状态；旧 `?state=<group>` 仍可兼容，`?collapsed=1` 能折叠右栏与连线。
- [ ] `runtime/shoot.mjs` 能从 `scenarios` 枚举场景并逐张截图，不再从卡片反推截图清单。
- [ ] 目标或说明滑出所属容器可视矩形时该条连线不绘制，无悬空曲线。
- [ ] 序号由脚本按卡片顺序生成，滚动时序号稳定不重排，HTML 内无写死序号。
- [ ] 每张卡片 ID 唯一稳定，目标优先用 `target.anchor` 引用现有元素 id；已有 id 的元素未重复添加 note-target。
- [ ] anchor 或兼容 selector 失效时卡片仍可见，作者态可通过卡片右上角绑定图标重新绑定；卡片内不重复展示目标名称。
- [ ] 状态切换、滚动、窗口变化后连线会重绘。
- [ ] 悬停时目标、说明和路径同步高亮。
- [ ] 本次迭代需要用户操作的业务入口已用 `data-ui-interactive` 标记；壳层、关闭/取消、分页和重复行操作未滥标。
- [ ] 关键语义单元有语义化标签或 id；只有无合适 id 时才使用 `data-prototype-note-target` / `data-mm-label` 兜底，且不承载状态。

### 浮层与移动端

- [ ] Modal 遮罩只覆盖左侧产品区，不覆盖右侧说明区。
- [ ] 浮层打开时只显示并连接浮层说明，关闭后恢复页面说明。
- [ ] 移动端隐藏 SVG。
- [ ] 移动端存在“查看说明 / 查看界面”切换按钮，说明内容未丢失。
- [ ] 移动端仍保留 `data-ui-interactive` 交互标记。

### 代码与依赖

- [ ] 无正式标注时为单文件 HTML；有正式标注时外层只保留 HTML，`prototype-assets/` 内严格只有 snapshot.js、viewer.js 和可选的 `screenshots/`。
- [ ] HTML 为 UTF-8、`lang="zh-CN"`，snapshot 与 Viewer 也使用 UTF-8。
- [ ] 正式交付 HTML 中没有 Author Loader、编辑器、Mark 或 Inspector；评审稿仅允许保留边界明确的 Mark 注入块。
- [ ] 函数和主要代码块都有中文注释。
- [ ] 未引入非必要外部 CDN。
- [ ] 没有未使用的组件样式、脚本、演示状态或依赖。
- [ ] 交互按钮具备可理解的名称和必要 `aria-*`。

### 评审层注入

- [ ] 仅交付评审稿时才运行 `runtime/prepare-mark.mjs --inline`；正式交付稿不得注入。
- [ ] 评审稿的注入块使用 `<!-- html-mark-injection-begin -->` / `<!-- html-mark-injection-end -->` 边界。
- [ ] 评审稿中 html-mark 的 `.mm-*` 样式与设计系统 `ui-*` 不冲突。
