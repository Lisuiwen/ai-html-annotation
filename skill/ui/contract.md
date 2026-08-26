# UI 包契约

## 包结构

每个 UI 包使用以下结构：

```text
packs/<pack-id>/
├── PACK.md
├── manifest.json
├── design-system.md
├── foundation/
│   ├── FOUNDATION.md
│   ├── tokens.css
│   └── base.css
├── components/
│   └── <category>/<component-id>/
│       ├── COMPONENT.md
│       └── component.html
├── patterns/
│   └── <pattern-id>/
│       ├── PATTERN.md
│       └── pattern.html
└── presets/
    └── <preset-id>/
        ├── PRESET.md
        └── seed.html
```

未提供的类别、Pattern 和 Preset 可以省略，但必须在 `PACK.md` 与 `manifest.json` 中准确声明。

## 资源职责

- `manifest.json` 是组件、Pattern、Preset、路径和依赖关系的唯一索引。
- foundation 必须唯一且无 DOM，只负责跨组件 Token 与文档级 CSS 基线。
- `COMPONENT.md` 与 `component.html` 分别是组件契约和实现的唯一来源。
- Pattern 只组合组件与布局槽位，不得复制组件实现。
- Preset 只提供无业务事实的页面起点，不得携带可被误用的业务名称、字段或数据。
- 不得保留按类别聚合的组件实现文件；AI 必须通过 manifest 读取叶子资源。

## 组合约束

- foundation 必须唯一，只负责跨组件 Token 与 CSS 基线；不得包含页面壳层、组件、示例 DOM 或脚本。
- 每个组件类别最多选择一个 provider，禁止同时加载两套同类组件。
- provider 只能引用当前 foundation 明确提供的 Token、当前组件声明的私有 Token，或 manifest 中列出的依赖。
- 内部组件只能被公开组件依赖，Pattern 和 Preset 不得直接选择内部组件。
- UI 包不得引用作者服务、html-mark、Inspector、截图工具或正式说明 Viewer。
- Addon 不得覆盖产品组件视觉、Token 或组件行为。

## 包内自由度

共享契约不强制不同 UI 包使用相同 DOM、CSS 类名或 JavaScript 接口。每个包可以独立定义实现，只需满足：

- 纯 HTML、CSS、JavaScript，默认零构建和无外部 CDN。
- 组件资源必须能按叶子组件单独读取；生成时递归展开 `requires`，`optional` 只在需求确实需要时加入。
- 仅实现用户材料确认的状态；有意简化使用 `ponytail:`。
- 满足共享生成契约中的语义化、无障碍、注释和依赖要求。

## PACK.md 最小信息

- 唯一 `id` 和人类可读名称。
- 提供的 foundation 与组件类别。
- 兼容的 foundation。
- Token 和类名前缀。
- `manifest.json` 读取入口与已知组合限制。
