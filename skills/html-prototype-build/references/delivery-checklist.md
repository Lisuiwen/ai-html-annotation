# 交付复检清单

## 适用范围

原型生成、大改、截图验收或整理正式交付稿前，用本清单做最终核对。Agent 与维护者均适用。

相关约束详见 [generation-contract.md](generation-contract.md)；作者会话与正式交付稿边界见 [delivery.md](delivery.md)。

## 复检项

### 1. 场景

- [ ] `prototype/notes.snapshot.js` 使用 `schemaVersion: 2`
- [ ] 含完整 `state`、`activeScenario`、`scenarios`、`header`、`cards`
- [ ] `scenarios` 显式声明每个可恢复场景及其组合 `state`
- [ ] `?scene=<id>` 能恢复对应页面状态，且说明卡片 `when` 匹配正确
- [ ] 列表态说明卡片同时约束 `product.layers` 为空数组

### 2. 锚点与说明卡片

- [ ] 每张卡片有稳定 `target.anchor`，且唯一命中 DOM `id`
- [ ] Modal / Drawer 的 `target.anchor` 绑定内层面板 id，不绑定遮罩层 `.ui-overlay`
- [ ] 已有 `id` 的节点未重复添加 `data-prototype-note-target`
- [ ] 右栏、SVG 连线、卡片编号由 Viewer 动态生成，HTML 未硬编码
- [ ] 说明数量按语义单元取舍：需要说明的才建卡，不为凑数全标，也不漏关键交互

### 3. 交互闪电（`data-ui-interactive`）

- [ ] 只标记**本次迭代**需要用户操作的业务入口
- [ ] 未标记壳层品牌、顶导、侧栏收起、关闭、取消、分页跳转或与本次需求无关的控件
- [ ] 同类重复操作只标一次（如表格每行编辑/删除仅在代表行标记）
- [ ] 标记元素在页面中可见，且闪电显示在元素内侧右上角
- [ ] 交互闪电与说明卡片彼此独立：有闪电不强制有卡片，有卡片不强制有闪电；同一元素可同时具备两者
- [ ] 纯页面截图（`?collapsed=1&product-only=1`）或 `product-only=1` 时闪电已隐藏
- [ ] 珊瑚色 `#ff8d6b` 仅用于标注层闪电，未写入 UI 包产品 Token

### 4. 文件结构

- [ ] 根目录仅保留 `prototype.html`、`prototype/`、`screenshots/` 及按需 `assets/`
- [ ] 页面 CSS、业务 JS、snapshot、Client Runtime 均收进 `prototype/`
- [ ] 脚本加载顺序：`notes.snapshot.js` → `display-mode.js` → `state.js` → `model.js` → `viewer.js` → `prototype.js`
- [ ] 资源路径为相对路径，`file://` 可直接打开
- [ ] `assets/` 若存在则不为空目录

### 5. Client Runtime

- [ ] `display-mode.js`、`state.js`、`model.js`、`viewer.js` 分别从 skill runtime 原样复制
- [ ] 四者职责分离：`display-mode`（纯页面态）、`state`（`PrototypeViewers`）、`model`（`when` 匹配）、`viewer`（DOM/连线）
- [ ] 业务状态只经 `PrototypeViewers` 提交；UI pack Adapter 不直接订阅 Viewer

### 6. 视觉与 Token

- [ ] 颜色使用命名 token，与当前 foundation `tokens.css` 一致
- [ ] 证据不足的视觉未猜测性写入 token；未确认处已用 `ponytail:` 标明上限

### 7. 浮层

- [ ] Modal 遮罩只覆盖左侧产品区，不遮挡右侧说明区
- [ ] `.ui-overlay` 位于 `.ui-preview` 内或等价产品区边界内
- [ ] 内层 `.ui-modal` / `.ui-drawer` 具备稳定 `id`

### 8. 截图（需要交付截图时）

- [ ] 场景 id 来自 `snapshot.scenarios`，且可安全作为文件名
- [ ] 输出在 `screenshots/<scene-id>.png`
- [ ] 截图不含右侧说明、SVG 连线、Mark、作者工具与交互闪电

### 9. 作者工具与数据边界

- [ ] 正式 HTML 不含 Author Bootstrap、Direct Edit、Notes Editor、Inspector、源码定位 token
- [ ] 正式说明只存在于 `notes.snapshot.js`；Mark pin 只在浏览器 localStorage
- [ ] 系统名、菜单、字段、状态和业务数据来自当前任务材料，无臆造内容
- [ ] 无真实凭据、token、接口地址、生产数据或未授权品牌资源

### 10. 自动化验证

- [ ] 仓库根目录 `npm test` 通过

## 禁止项

### 文件与运行时

- 根目录散落 CSS、JS、snapshot 或运行时文件
- 内联大段 CSS、业务脚本或标注编辑逻辑
- 把 Client Runtime 四文件合并回单个 Viewer
- 作者工具、本地服务脚本或源码定位信息进入正式交付物
- 生成 `notes.json` 或把卡片数据内联进 HTML
- 把正式说明写入 localStorage

### 状态与数据

- 自建第二套业务状态源
- UI pack Adapter 直接访问 `PrototypeViewers` 或从 DOM 反推业务状态
- 为页面、浮层、Tab 或数据态新增状态型 `data-*` 协议
- 从 Seed、历史原型或其他任务带入示例业务内容

### 标注与交互闪电

- 用遮罩层 `.ui-overlay` 的 id 作为说明连线锚点
- 给壳层、关闭、取消、分页等与本次迭代无关的控件加 `data-ui-interactive`
- 为表格每行重复操作逐个加闪电
- 把交互闪电珊瑚色写入 UI 包产品 Token

### 依赖与资源

- 未经要求引入外部 CDN、Tailwind 视觉类、Font Awesome、React 等
- 用 Tailwind 颜色/边框/圆角/阴影/字体覆盖 `ui-*` token
- chart-map 的 geo 引用 CDN 或写在 `component.html` 内

### 截图

- 自造截图场景或让截图流程生成业务状态
