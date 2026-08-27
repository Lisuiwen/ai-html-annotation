---
id: antd-admin
name: Ant Design 中后台 UI
version: 2
class-prefix: ui-
token-prefix: ui-
provides:
  - foundation
  - action
  - navigation
  - form
  - data
  - feedback
compatible-foundations:
  - antd-admin.default
---

# Ant Design 中后台 UI 包

## 读取入口

- 设计事实：`design-system.md`
- 路由索引：`manifest.json`
- 基础层契约：`foundation/FOUNDATION.md`
- 基础 Token：`foundation/tokens.css`
- CSS 基线：`foundation/base.css`

读取 `manifest.json` 后，根据用户需求选择 Component、Pattern 或 Preset，递归展开 `requires`，再读取命中的契约和实现文件。`optional` 依赖只有在当前页面实际需要时才加入；禁止按类别遍历或加载全部组件。

## 组合限制

- 本包所有组件默认依赖 `antd-admin.default` foundation。
- 同一类别不得与其他 provider 同时加载。
- 其他包只有显式声明兼容 `antd-admin.default` foundation 后，才可替换本包某个组件类别。
- `feedback._overlay-core` 是私有组件，只能由 Modal 或 Drawer 间接加载。
- Pattern 只提供组合骨架，Preset 只提供无业务事实的页面起点；两者都不得复制组件实现。
- 本包只模拟已确认的 Ant Design 中后台视觉特征，不代表正式项目依赖特定 Ant Design 版本。

