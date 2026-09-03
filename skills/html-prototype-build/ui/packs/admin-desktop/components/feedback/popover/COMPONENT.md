---
id: feedback.popover
category: feedback
requires: [action.button]
states:
  confirmed: [closed]
  provisional: [open]
---

# feedback.popover

通用气泡卡片。定位、点击外部关闭与焦点管理由最终原型处理；内容区保留 DOM，Adapter 只同步 open 与 title。
