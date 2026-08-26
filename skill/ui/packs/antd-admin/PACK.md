---
id: antd-admin
name: Ant Design 中后台 UI
version: 1
class-prefix: ui-
token-prefix: ui-
provides:
  - foundation
  - navigation
  - form
  - data
  - feedback
compatible-foundations:
  - antd-admin
---

# Ant Design 中后台 UI 包

## 读取入口

- 设计事实：`design-system.md`
- 基础层：`foundation.html`
- 导航：`components/navigation.html`
- 表单：`components/form.html`
- 数据：`components/data.html`
- 反馈：`components/feedback.html`

## 组合限制

- 本包所有组件默认依赖 `antd-admin` foundation。
- 同一类别不得与其他 provider 同时加载。
- 其他包只有显式声明兼容 `antd-admin` foundation 后，才可替换本包某个组件类别。
- 本包只模拟已确认的 Ant Design 中后台视觉特征，不代表正式项目依赖特定 Ant Design 版本。

