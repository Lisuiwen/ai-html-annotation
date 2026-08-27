---
id: action.button
category: action
requires: []
states:
  confirmed: [default, primary, text, icon, disabled]
  provisional: [hover, focus]
---

# Button

用于页面操作、表单提交、工具栏动作和浮层操作。仅图标按钮必须提供 `aria-label`。

读取 `component.html` 后，只复制当前页面实际使用的变体。hover 与 focus 视觉仍受文件内 `ponytail:` 约束。

