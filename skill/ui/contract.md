# UI 包契约

## 包结构

每个 UI 包使用以下结构：

```text
packs/<pack-id>/
├── PACK.md
├── design-system.md
├── foundation.html
└── components/
    ├── navigation.html
    ├── form.html
    ├── data.html
    └── feedback.html
```

未提供的类别可以省略，但必须在 `PACK.md` 中准确声明。

## 组合约束

- foundation 必须唯一，负责 Token、基础重置、页面壳层和跨类别基础控件。
- 每个组件类别最多选择一个 provider，禁止同时加载两套同类组件。
- provider 只能引用当前 foundation 明确提供的 Token 或自身声明的私有 Token。
- UI 包不得引用作者服务、html-mark、Inspector、截图工具或正式说明 Viewer。
- Addon 不得覆盖产品组件视觉、Token 或组件行为。

## 包内自由度

共享契约不强制不同 UI 包使用相同 DOM、CSS 类名或 JavaScript 接口。每个包可以独立定义实现，只需满足：

- 纯 HTML、CSS、JavaScript，默认零构建和无外部 CDN。
- 组件资源可按类别单独读取和复制。
- 仅实现用户材料确认的状态；有意简化使用 `ponytail:`。
- 满足共享生成契约中的语义化、无障碍、注释和依赖要求。

## PACK.md 最小信息

- 唯一 `id` 和人类可读名称。
- 提供的 foundation 与组件类别。
- 兼容的 foundation。
- Token 和类名前缀。
- 读取入口与已知组合限制。
