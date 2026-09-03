---
id: admin-desktop
name: 中后台桌面 UI
---

# 中后台桌面 UI 包

## 读取入口

- 设计事实：`design-system.md`
- 路由索引：`manifest.json`
- 基础层契约：`foundation/FOUNDATION.md`
- 基础 Token：`foundation/tokens.css`
- CSS 基线：`foundation/base.css`

读取 `manifest.json` 后，根据用户需求选择 Component、Pattern 或 Preset，递归展开 `requires`，再读取命中的契约和实现文件。需要组件交互时，读取 manifest 声明的 `adapter`。`optional` 依赖只有在当前页面实际需要时才加入；禁止按类别遍历或加载全部组件。

## 组合限制

- 本包所有组件默认依赖 `admin-desktop.default` foundation。
- 同一类别不得与其他 provider 同时加载。
- 其他包只有显式声明兼容 `admin-desktop.default` foundation 后，才可替换本包某个组件类别。
- `feedback._overlay-core` 是私有组件，只能由 Modal 或 Drawer 间接加载。
- 本包提供中后台桌面原型视觉，不捆绑第三方设计系统代码，也不承诺兼容任何商业 UI 库版本。

