# 交付复检清单

## 适用范围

原型生成、大改、截图验收或整理正式交付稿前，用本清单做最终核对。Agent 与维护者均适用。

硬约束见 [generation-contract.md](generation-contract.md)；作者会话与正式交付稿边界见 [delivery.md](delivery.md)。

## 复检项

### 1. 场景

- [ ] `prototype/notes.snapshot.js` 使用 `schemaVersion: 2`，含 `state`、`activeScenario`、`scenarios`、`header`、`cards`
- [ ] `scenarios` 显式声明每个可恢复场景及其组合 `state`
- [ ] `?scene=<id>` 能恢复对应页面状态，且说明卡片 `when` 匹配正确
- [ ] 列表态说明卡片同时约束 `product.layers` 为空数组

### 2. 锚点与说明卡片

- [ ] 每张卡片有稳定 `target.anchor`，且唯一命中 DOM `id`
- [ ] Modal / Drawer 的 `target.anchor` 绑定内层面板 id，不绑定遮罩层 `.ui-overlay`
- [ ] 已有 `id` 的节点未重复添加 `data-prototype-note-target`
- [ ] 右栏、SVG 连线、卡片编号由 Viewer 动态生成，HTML 未硬编码
- [ ] 说明按语义单元取舍：需要说明的才建卡，不为凑数全标，也不漏关键交互

### 3. 交互闪电（`data-ui-interactive`）

规则定义见 [generation-contract.md §5](generation-contract.md#5-标注)。交付前核对：

- [ ] 只标本次迭代业务入口；不标壳层、关闭、取消、分页及无关控件；同类重复操作只标一次
- [ ] 标记元素可见，闪电在元素内侧右上角
- [ ] 与说明卡片彼此独立，可同元素并存
- [ ] 纯页面态（`product-only=1` 或 `?collapsed=1&product-only=1`）已隐藏；珊瑚色 `#ff8d6b` 未写入 UI 包产品 Token

### 4. 文件结构

- [ ] 最终产物位于独立 `<prototype-name>/` 上层目录，目录名稳定且文件系统安全
- [ ] `<prototype-name>/AGENTS.md` 从 `templates/AGENTS.md` 原样复制
- [ ] `<prototype-name>/` 仅保留 `AGENTS.md`、`prototype.html`、`prototype/`、`screenshots/` 及按需 `assets/`
- [ ] 页面 CSS、业务 JS、snapshot、Client Runtime 均收进 `prototype/`
- [ ] 脚本加载顺序：`notes.snapshot.js` → `display-mode.js` → `state.js` → `model.js` → `viewer.js` → `prototype.js`
- [ ] 资源路径为相对路径，`file://` 可直接打开；`assets/` 若存在则不为空目录

### 5. Client Runtime

- [ ] `display-mode.js`、`state.js`、`model.js`、`viewer.js` 分别从 skill runtime 原样复制，职责分离（详见 [generation-contract.md §7](generation-contract.md#7-交付文件)）
- [ ] 业务状态只经 `PrototypeViewers` 提交；UI pack Adapter 不直接订阅 Viewer，也不从 DOM 反推业务状态

### 6. 视觉、依赖与浮层

- [ ] 颜色使用命名 token，与当前 foundation `tokens.css` 一致；证据不足处已用 `ponytail:` 标明上限
- [ ] 未擅自引入外部 CDN、Tailwind 视觉类、Font Awesome、React 等额外依赖
- [ ] Modal 遮罩只覆盖左侧产品区；`.ui-overlay` 位于 `.ui-preview` 内；内层 `.ui-modal` / `.ui-drawer` 具备稳定 `id`

### 7. 截图（需要交付截图时）

- [ ] 场景 id 来自 `snapshot.scenarios`，输出在 `screenshots/<scene-id>.png`
- [ ] 截图不含右侧说明、SVG 连线、Mark、作者工具与交互闪电

### 8. 作者工具与数据边界

- [ ] 正式 HTML 不含 Author Bootstrap、Direct Edit、Notes Editor、Inspector、源码定位 token 或内联标注编辑逻辑
- [ ] 正式说明只存在于 `notes.snapshot.js`；不存在 `notes.json`、HTML 内联副本或正式说明 localStorage 副本；Mark pin 才允许写 localStorage
- [ ] 系统名、菜单、字段、状态和业务数据来自当前任务材料，无臆造内容；无真实凭据、token、接口地址、生产数据或未授权品牌资源

### 9. 自动化验证

- [ ] 仓库根目录 `npm test` 通过
