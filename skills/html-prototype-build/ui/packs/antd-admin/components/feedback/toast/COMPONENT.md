---
id: feedback.toast
category: feedback
requires: [action.button]
states:
  confirmed: []
  provisional: [visible, dismissed]
---

# Toast

自动消失的中性反馈。消息内容与显示时机必须来自当前交互，不得补造成功或错误语义。

## 状态 Adapter

`state-adapter.js` 暴露 `window.PrototypeUiAdapters['feedback.toast']`，局部 state 为 `{ visible: boolean, message: string }`。超时关闭策略属于最终原型业务逻辑；组件 Adapter 只渲染 live region 内容。

