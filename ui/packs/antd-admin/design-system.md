# 纯 HTML 原型通用设计 Token

## 1. 权威性与边界

- 本文件仅提供仓库级通用视觉 Token 与组件约束，不记录任何具体 Case 的系统名、业务字段、页面结构、坐标、尺寸测量或状态文案。
- 当前 Case 的截图、需求、页面状态、业务数据和经确认的特殊视觉事实，必须由使用者在 Case 材料中明确提供；不得把本文件视为具体业务页面的设计稿。
- 原型应以当前任务中已确认的材料为准。本文 CSS 变量名仅供纯 HTML 原型使用，不代表正式项目存在同名源码 Token。
- 页面出现 `ant-*` 类名或呈现框架视觉特征，只能证明技术特征；不能据此补写未采集的主题配置、组件状态或精确依赖版本。
- 本文服务于纯 HTML 原型。组件应被视为评审用实现，不得仿造或宣称具备完整框架行为。
- 当前材料未确认的 hover、focus、active、disabled、loading、error、折叠、展开、滚动、校验及复杂组件状态，均不得按框架常识自行补全。

## 2. 通用 CSS Variables

后续单文件 HTML 应在 `:root` 中直接复用以下通用变量。若当前 Case 已提供经确认的设计 Token，应以该 Case 的材料为准，并在原型内保持引用一致；不得以“相近”色值随意替换。

```css
/* 通用颜色：具体 Case 可在已确认材料中提供覆盖值。 */
:root {
  --ui-bg-page: #f3f4f7;
  --ui-bg: #ffffff;
  --ui-bg-soft: #fafafa;
  --ui-primary: #1677ff;
  --ui-text: rgba(0, 0, 0, 0.88);
  --ui-text-secondary: rgba(0, 0, 0, 0.65);
  --ui-text-tertiary: rgba(0, 0, 0, 0.45);
  --ui-text-disabled: rgba(0, 0, 0, 0.25);
  --ui-border: #d9d9d9;
  --ui-border-soft: #f0f0f0;
  --ui-border-subtle: rgba(0, 0, 0, 0.06);
  --ui-text-on-primary: #ffffff;

  /* 通用字体栈；品牌字体须由当前 Case 明确提供。 */
  --ui-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  --ui-font-size-caption: 12px;
  --ui-font-size-body: 14px;
  --ui-font-size-nav: 16px;
  --ui-font-size-page-title: 16px;
  --ui-line-height-caption: 12px;
  --ui-line-height-body: 22px;
  --ui-line-height-tree-node: 24px;
  --ui-line-height-nav: 64px;
  --ui-line-height-page-title: 18.4px;
  --ui-font-weight-regular: 400;
  --ui-font-weight-semibold: 600;

  /* 通用 4px 间距基线。 */
  --ui-space-1: 4px;
  --ui-space-2: 8px;
  --ui-space-3: 12px;
  --ui-space-4: 16px;
  --ui-space-6: 24px;

  /* 通用控件尺寸。 */
  --ui-control-height: 32px;
  --ui-control-width-default: 214px;
  --ui-control-padding-inline: 11px;
  --ui-button-padding-inline: 15px;
  --ui-icon-button-size: 32px;
  --ui-search-width: 269px;
  --ui-filter-height: 102px;
  --ui-toolbar-height: 44px;
  --ui-table-header-height: 39px;
  --ui-table-cell-padding: 8px;
  --ui-page-titlebar-height: 56px;

  /* 通用壳层布局：导航高度与侧栏宽度。 */
  --ui-header-height: 64px;
  --ui-sider-width: 224px;

  /* 通用圆角与阴影。 */
  --ui-radius-control: 6px;
  --ui-radius-container: 8px;
  --ui-shadow-button: 0 2px 0 rgba(0, 0, 0, 0.02);
  --ui-shadow-primary: 0 2px 0 rgba(5, 145, 255, 0.1);
}
```

文字色在白底上的合成近似值仅用于理解和对比度复核，不应替代上面的 rgba Token：

- 主文字约 `#1F1F1F`。
- 次要文字约 `#595959`。
- 辅助文字约 `#8C8C8C`。
- 禁用或弱提示文字约 `#BFBFBF`。

## 3. 通用组件静态规范

### 3.1 顶部导航

- 页面存在顶部导航时，导航文字可使用 `--ui-font-size-nav`、`--ui-font-weight-regular` 与 `--ui-space-4`。
- 顶部导航的高度、品牌区宽度、导航项状态和溢出行为必须来自当前 Case 的材料；未提供时应保持最小静态结构。

### 3.2 左侧导航、树与 Tabs

- 侧栏宽度、菜单层级、树节点尺寸、搜索位置和 Tabs 状态必须来自当前 Case 的材料。
- 树和 Tabs 的未确认 hover、focus、active、disabled、loading、empty、error 状态不得自行补造。

### 3.3 输入框、搜索框与选择器

- 默认态可使用 `--ui-control-height`、`--ui-border`、`--ui-radius-control`、`--ui-control-padding-inline` 与通用文字 Token。
- 常规筛选控件宽度和筛选项数量必须由当前 Case 材料确认。
- placeholder 使用辅助文字色 `rgba(0,0,0,.45)`。
- 组合搜索框的输入区圆角为 `6px 0 0 6px`，搜索按钮圆角为 `0 6px 6px 0`。
- 未确认 hover、focus、active、disabled、loading、error 状态。

### 3.4 按钮

- 默认态使用 `--ui-control-height`、`--ui-radius-control`、`--ui-button-padding-inline` 与通用文字 Token。
- 主按钮使用 `--ui-primary` 背景、`--ui-text-on-primary` 文字与 `--ui-shadow-primary`。
- 次按钮使用 `--ui-bg` 背景、`--ui-border` 边框和 `--ui-text`。
- 文字按钮使用透明背景、透明边框和次要文字色。
- 图标按钮使用 `--ui-icon-button-size`。
- 未确认 hover、focus、active、disabled、loading 状态。

### 3.5 筛选栏与工具栏

- 筛选栏可使用 `--ui-filter-height`、`--ui-space-4`；工具栏可使用 `--ui-toolbar-height` 与 `--ui-space-4`。
- 筛选字段、行数、展开收起、操作顺序和过渡必须来自当前 Case 的材料。

### 3.6 表格与空状态

- 表头使用 `--ui-table-header-height`、`--ui-bg-soft`、`--ui-font-weight-semibold` 与 `--ui-table-cell-padding`。
- 表格容器使用 `--ui-bg`、`--ui-border-soft` 与 `--ui-radius-container`。
- 空状态文案、插图、触发条件、表格列宽和布局必须来自当前 Case 的材料。
- 未确认行 hover、选中、loading、error 状态。

### 3.7 内容容器

- 使用 `--ui-bg`、`--ui-radius-container` 和 `--ui-border-subtle` 建立基础层级。
- 是否使用悬浮阴影应由当前 Case 的材料确认。

## 4. 可访问性硬约束

后续 AI 生成原型时必须满足：

- 页面使用明确地标：顶部使用 `header`，全局导航和侧栏菜单使用 `nav`，业务区域使用 `main`。
- 搜索图标按钮、筛选展开按钮、侧栏收起按钮及其他仅图标按钮必须提供可理解的可访问名称，例如 `aria-label`。
- 若使用树，必须保留 `tree` / `treeitem` 语义，并支持键盘方向键导航；如果静态原型不实现该行为，则不得把普通嵌套列表标注为可交互树。
- DOM 顺序应支持当前页面从全局导航、侧栏、筛选、主要操作到表格操作的自然焦点路径。
- 辅助文字色约 `#8C8C8C`，白底对比度约 3.4:1，不得承载必须阅读的 14 px 正文。
- 白字位于 `#1677FF` 上的对比度约 4.1:1，接近但低于普通文字 4.5:1；不得把该组合无条件声明为满足普通文字对比度要求。正式交付前必须按实际字号、字重和适用标准复核。
- `#D9D9D9` 边框在白底上的对比度不足 3:1，键盘焦点不能只依赖该边框。
- 原型若未实现某个可操作组件的键盘行为，应将其降级为不可操作的静态展示，避免伪造可访问性。

## 5. 未确认状态的 `ponytail:` 规则

所有未确认内容必须就地写 `ponytail:` 注释，明确当前实现上限和升级路径，不能用注释掩盖经验性补造。

```html
<!-- ponytail: 当前上限为已采集的静态默认态；获得对应状态截图或计算样式后，再补充 hover、focus、active、disabled、loading 与 error。 -->
<button class="ui-button ui-button--primary">查询</button>
```

```css
/* ponytail: 当前不定义框架推测的焦点环；采集真实键盘焦点态后新增专用 token，并同时验证至少 3:1 的非文本对比度。 */
.ui-button:focus-visible {
  outline: revert;
}
```

```js
// ponytail: 当前只切换已确认的静态页面状态；获得状态切换、动画和滚动证据后，再升级交互模型。
function renderConfirmedState(state) {
  document.body.dataset.pageState = state;
}
```

标注要求：

1. “当前上限”必须说明目前只实现到哪个已确认状态。
2. “升级路径”必须指出需要补充的证据，例如状态截图、计算样式、键盘行为记录或更多页面采集。
3. 未确认值不得先写入 token 后再用 `ponytail:` 声称“待调整”。
4. 对折叠侧栏、展开筛选、独立滚动、表单校验、弹窗、抽屉、分页、消息提示和日期选择器，可以实现用于评审流程的原型交互，但其未采集视觉和行为必须就地使用 `ponytail:` 标为原型近似，并说明取得真实状态证据后的替换路径。

## 6. 禁止事项

- 不得使用 `#165DFF` 覆盖已确认主色 `#1677FF`。
- 不得使用 8 px 基线覆盖通用的 4 px 间距基线；常用值为 4、8、12、16、24 px。
- 不得把技能旧 example 中的 `#F5F7FA`、`#333333`、`#00B42A`、`#F53F3F` 或琥珀色说明区当作本项目已确认 token。
- 不得因页面存在框架痕迹，就补造默认的 hover、focus、active、disabled、loading、error、分页、弹窗、抽屉、下拉层或校验样式。
- 不得把任何框架视觉体系写成已确认的精确依赖版本或正式源码配置。
- 不得为静态纯 HTML 占位组件宣称完整复刻某框架的交互、键盘操作或无障碍行为。
- 不得以悬浮卡片阴影替代当前 Case 已确认的层级关系。
- 不得把未经当前 Case 材料确认的响应式断点、移动端布局、动画时长或折叠宽度写成正式系统规范；若原型展示必须使用，应以 `ponytail:` 明确标为原型容错方案，并在取得真实证据后替换。
- 不得把文字色的白底合成近似值写回 CSS token；应保留已确认的 rgba 值。
- 不得使用未授权的正式品牌 Logo、真实登录凭据、token、接口或业务数据；原型仅使用本地 mock 与合法占位资源。
