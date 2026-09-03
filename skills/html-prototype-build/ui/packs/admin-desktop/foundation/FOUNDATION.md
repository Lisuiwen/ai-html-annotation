---
id: admin-desktop.default
sources: [tokens.css, base.css]
---

# 中后台桌面基础层

基础层是所有使用本包的原型必须加载的无 DOM 依赖，只提供全局设计 Token 与 CSS 基线。

## 读取顺序

1. `tokens.css`
2. `base.css`

基础层不得包含组件类、页面壳层、示例 DOM 或交互脚本。组件专用尺寸由对应组件声明；页面结构由 Pattern 提供。
