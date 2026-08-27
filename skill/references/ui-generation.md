# UI 生成

## 适用范围

用户要求生成原型、UI 重建、底图还原，或大改页面结构、布局、菜单和业务状态时使用本入口。

## 读取顺序

1. 读取 `../ui/catalog.md`，根据用户材料选择唯一 foundation 和所需组件 provider；无法判断时先询问。
2. 读取 `../ui/contract.md`、已选 UI 包的 `PACK.md` 和 `manifest.json`。
3. 完整读取 `design-system.md`、foundation 契约及 manifest 声明的 foundation sources。
4. 从 manifest 匹配 Component、Pattern 或 Preset，递归展开 `requires`；`optional` 仅在当前需求明确需要时加入。
5. 只读取依赖闭包中的契约与实现，禁止遍历整个组件类别或 UI 包。
6. 读取 [generation-contract.md](generation-contract.md) 中的需求边界、代码质量、依赖、状态和无障碍约束。
7. 只有需要正式产品说明时，继续执行 [product-annotations.md](product-annotations.md)。

当前已有完整 UI 包为 `../ui/packs/antd-admin/`，用于 Ant Design 风格的桌面中后台原型。

## 生成流程

1. 从用户材料提取系统名、页面、菜单、字段、数据、可见状态和交互；不明确的信息先询问。
2. 记录本次选择的 foundation、provider、Component、Pattern、Preset 和 Addon，并从依赖闭包复制最小 CSS、HTML 和 JavaScript 片段；有状态组件优先读取其 `state-adapter.js`，由原型业务 Adapter 映射到 `PrototypeViewers`，所有原型都接入 snapshot + Viewer 状态协调器。
3. 产品视觉只使用所选 foundation 和 provider 已声明的 Token；标注层颜色不得成为产品视觉。
4. 实现用户明确要求的最小交互和 URL state，不补造未确认业务规则。
5. 按共享契约完成无障碍、依赖、注释和 `ponytail:` 检查。

## 完成后分流

- 所有原型：读取 [product-annotations.md](product-annotations.md)，维护 snapshot、Viewer 和场景状态。
- 默认需要浏览器评审：读取 [review-mark.md](review-mark.md)。
- 用户明确不要打点或评审层：直接进入 [delivery.md](delivery.md)。
