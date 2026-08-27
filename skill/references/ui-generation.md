# UI 生成

## 适用范围

用户要求生成原型、UI 重建、底图还原，或大改页面结构、布局、菜单和业务状态时使用本入口。

## 最小路径

1. 选择一个 foundation 和 UI pack，并从 manifest 读取最小依赖闭包。
2. 生成 snapshot + Viewer；所有原型都通过 Viewer 管理场景和 state。
3. 交付前核对场景、锚点、Token 和正式文件结构。

当前已有完整 UI 包为 `../ui/packs/antd-admin/`，用于 Ant Design 风格的桌面中后台原型。

## 生成流程

1. 业务材料不完整时先确认，不补造业务规则。
2. UI pack 只提供组件与局部 Adapter；业务 Adapter 负责把 `PrototypeViewers` state 映射到组件。
3. foundation 与 Case 颜色都先声明为 token；未确认的视觉和行为用 `ponytail:` 就地说明。

## 完成后分流

- Viewer、场景和标注：读取 [product-annotations.md](product-annotations.md)。
- 默认需要浏览器评审：读取 [review-mark.md](review-mark.md)。
- 用户明确不要打点或评审层：直接进入 [delivery.md](delivery.md)。
