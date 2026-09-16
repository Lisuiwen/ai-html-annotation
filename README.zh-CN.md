# AI HTML Annotation

[English](README.md)

![skills.sh](https://skills.sh/b/Lisuiwen/ai-html-annotation)

> 面向 Claude Code、Codex、Cursor 等编程 Agent 的 Skill：原生 HTML 原型 + 真实 DOM 标注。

**页面本身就是交付物，不只是一张效果图。** 用 UI pack 搭页，在真实 DOM 上评审，把 selector 而不是像素交给 Agent，并输出不含作者层的多状态截图。

实验性 0.x · 零 npm 依赖 · MIT · [更新日志](CHANGELOG.md)

## 旧链路在哪里断

三种角色、三种旧做法、三处失败。展开见[痛点与场景](docs/pain-points-and-scenarios.zh-CN.md)。

- **评审人 / 产品** × 把意见写在聊天或文档里（“往左移一点”）× 对不上元素，Agent 只能猜。
- **作者 / Agent** × 对着截图改下一版 HTML × 没有 DOM，结构容易漂。
- **任何要验收修改的人** × 说明、聊天记录和源码各写各的 × 对不上同一个元素，验证很慢。

## 协作闭环

```text
用 UI pack 生成 HTML
        │
        ▼
   Viewer          正式说明贴在真实页面上
        │
        ▼
   Mark → Copy for AI     评审 pin、selector、元素 HTML 快照
        │
        ▼
   Direct Edit     在 localhost 改样式或文案，写回源码
        │
        ▼
   Inspector       锁定元素 → 在 IDE 打开对应位置
        │
        ▼
   scenarios       多状态纯页面 PNG（不含作者层）
```

作者工具（Mark、Direct Edit、Inspector、本地作者服务）只在作者会话中加载。正式 HTML 只保留只读 Viewer 与语义 DOM。按场景输出的 PNG 不含作者层界面。

## 你可以先看演示

### 像产品一样直接在页面上读说明

正式说明绑在真实 DOM 上。增删改查标注、切换页面场景、沿 SVG 连线定位模块 — 都在同一页，不用另开一份说明文档。

![在真实页面上阅读正式说明并切换场景](media/viewer.gif)

### 把问题钉在元素上，交给 Agent

按住 `Ctrl`（macOS：`⌘`）点击元素，打上可移除的评审 pin；或切到 Direct Edit 改样式 / 文案并写回源码。然后用 `Copy all → For AI` 导出 selector 和元素 HTML 快照。

![在真实元素上打点，复制 selector 与 HTML 快照给 Agent](media/mark.gif)

### 锁定看起来不对的地方，跳回源码

按住 `Alt + Shift` 悬停查看选择器，单击即可在本机 IDE 打开对应位置。

![锁定元素并从页面跳转到源码](media/inspector.gif)

## 两条能力线

1. **原型协作**（`html-prototype-build`）— 生成可打开的 HTML，在 DOM 上评审，复制给 Agent 的上下文，原地微调，再按场景出图。见[工作流](docs/workflows.zh-CN.md)。
2. **UI pack** — 安装、自定义或维护一套可复用视觉，让 Agent 搭出来的页面保持稳定。官方 pack 为 `admin-desktop` 与 `mobile-vant`。见 [UI packs](docs/ui-packs.zh-CN.md)。

## 适合 / 不适合

**适合**：

- 尽快把 UI 材料落成可打开的 HTML；
- 在真实页面上评审，并把意见准确交给 AI；
- 改结构、文案和状态，同时保留可复现截图；
- 后台、配置页、交互原型需要跨任务保持视觉稳定。

**不适合**当作生产组件库、Figma 替代品、第三方设计系统实现，或通用前端脚手架 / 生产代码生成器。

## 5 分钟 Quickstart

默认用 skills.sh。CLI 会打印 `<skill-root>`：

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
node <skill-root>/scripts/install-pack.mjs --pack=admin-desktop
```

打开本仓库 [`examples/minimal-notes-system/prototype.html`](examples/minimal-notes-system)（桌面样例）。要用 Mark / Direct Edit / Inspector，需启动本地作者服务 — 命令见[5 分钟 quickstart](docs/quickstart.zh-CN.md)。

Claude Code Marketplace 为备选：`/plugin marketplace add Lisuiwen/ai-html-annotation`，再 `/plugin install ai-html-annotation@lisuiwen-agent-skills`。Pack 作者再安装 `ui-pack-maintain`。

## 能力速查

| 你要做什么 | 用什么 | 所在层 |
| --- | --- | --- |
| 正式说明、场景切换、SVG 连线 | Viewer | 正式页面 |
| 评审 pin → selector + HTML 快照 | Mark，`Copy all → For AI` | 作者会话 |
| 在页面上改样式或文案 | Direct Edit | 作者会话 |
| 锁定元素 → IDE | Inspector | 作者会话 |
| 视觉稳定 | UI pack（`install-pack`） | Pack，不在 Skill 内 |
| 新建 / 编辑 / 空态等纯净 PNG | `scenarios` + 截图 CLI | 交付 |

完整对照见[能力地图](docs/features.zh-CN.md)。作者层与正式交付的边界也在该页。

## 样例

- 默认走读：[`examples/minimal-notes-system`](examples/minimal-notes-system)（桌面后台）。
- 备选：[`examples/mobile-work-order`](examples/mobile-work-order)（移动 H5，`mobile-vant`）。

## 接下来看哪里

- [文档索引](docs/README.zh-CN.md) — 痛点、能力、工作流、quickstart、UI packs、[对比](docs/comparison.zh-CN.md)、[FAQ](docs/faq.zh-CN.md)
- Skill 怎么用 → [`skills/html-prototype-build/README.zh-CN.md`](skills/html-prototype-build/README.zh-CN.md)（[English](skills/html-prototype-build/README.md)）
- Agent 分流 → [`skills/html-prototype-build/SKILL.md`](skills/html-prototype-build/SKILL.md)
- 任务命令 → [`skills/html-prototype-build/references/`](skills/html-prototype-build/references/)（[pack 安装](skills/html-prototype-build/references/pack-install.md)、[本地作者服务](skills/html-prototype-build/references/local-authoring.md)、[评审打点](skills/html-prototype-build/references/review-mark.md)、[截图](skills/html-prototype-build/references/screenshots.md)）

Skill 参考、UI pack 契约和 addon 文档为英文。

## 分发结构

```text
.claude-plugin/marketplace.json  Claude Code Marketplace 清单
.html-prototype/packs/           官方 UI pack 与 registry.json
skills/html-prototype-build/     原型构建 Agent Skill
skills/ui-pack-maintain/         UI pack 维护 Agent Skill
examples/                        可运行样例
media/                           README 演示素材
scripts/                         校验脚本
tests/                           Runtime、pack 与契约测试
```

Skill 内部 Runtime 按边界拆分：`client/` 正式浏览器运行时，`author/` 浏览器作者工具，`server/` 本地 Node 作者服务，`cli/` 独立命令行。

## 安全

- 作者服务只绑定 `127.0.0.1`。不要对不可信 HTML 或 snapshot 跑作者服务和截图。
- 作者写接口要求 localhost 同源 JSON。`skills/html-prototype-build/.env` 只用于本机 IDE 选择，不要提交。
- Direct Edit 与 Mark 只在作者会话中加载。Direct Edit 经 localhost 写回样式 / 文案；Mark 把 pin 存在页面作用域的 `localStorage`，也可能复制到剪贴板。它们都不会注入源 HTML。
- 原型中不要放真实凭据、生产数据、个人信息或未授权品牌。

## 开源协作

实验性 0.x，接口和目录仍可能变化。贡献见 [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md)，行为规范见 [`.github/CODE_OF_CONDUCT.md`](.github/CODE_OF_CONDUCT.md)，漏洞请按 [`.github/SECURITY.md`](.github/SECURITY.md) 私下报告。

本项目 UI pack 为自研原生 HTML 视觉模拟，不捆绑第三方设计系统代码；pack 内引用的库（例如 `admin-desktop` 中的 Apache ECharts）随 pack 分发，见 [NOTICE](NOTICE)。

## 许可证

[MIT](LICENSE)。第三方溯源见 [NOTICE](NOTICE)（含 html-mark 致谢与 Apache ECharts）。
