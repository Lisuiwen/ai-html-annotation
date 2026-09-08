# AI HTML Annotation

[English](README.md)

![skills.sh](https://skills.sh/b/Lisuiwen/ai-html-annotation)

> 面向 AI Agent 的 HTML UI 原型生成、DOM 标注、评审与迭代工具。

很多原型的问题，不是“画得不够像”，而是**画完之后无法继续工作**：

- 截图没有 DOM，AI 只能猜页面结构，修改结果容易漂移；
- 评审意见写在文档或聊天里，“这里改一下”无法准确对应页面元素；
- 设计说明、评审批注和源码彼此分离，改完之后也很难快速验证。

AI HTML Annotation 用原生 HTML 把这条链路接起来：用 UI 包稳定搭建页面，在真实 DOM 上完成标注和评审，把意见复制给 AI，并从锁定的元素直接跳到源码。**页面本身就是可操作的交付物，不只是一张效果图。**

## 安装

### Agent Skills / skills.sh

适用于 Claude Code、Cursor、Codex 兼容工作流和其他支持 Agent Skills 的客户端：

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```

skills.sh 会根据真实 CLI 安装自动发现并统计公开 Skill，不需要额外维护平台专用 manifest。

### Claude Code Plugin Marketplace

先把本仓库加入 Claude Code Marketplace，再安装插件：

```text
/plugin marketplace add Lisuiwen/ai-html-annotation
/plugin install ai-html-annotation@lisuiwen-agent-skills
```

Claude 插件直接引用仓库中的 `skills/html-prototype-build/`，所以仍然只有一份 Skill 源，不需要同步维护第二份 `SKILL.md`。

实验性 0.x · 零 npm 依赖 · MIT

## 你可以先看演示



### 1. 右侧工具栏：标注的增删改查与场景切换

Viewer 把正式说明组织在页面右侧。你可以新增、编辑、删除和查看标注，并按场景切换页面说明；标注通过 SVG 连线指向对应模块，阅读和定位都在同一页面完成。

![Viewer：右侧工具栏中的标注增删改查与分组管理](media/viewer.gif)

### 2. 页面评审：打点并复制给 AI

在真实 HTML 元素上添加可移除的评审标记，集中查看意见后使用 `Copy all → For AI`，即可复制包含 selector 与元素 HTML 快照的修改上下文，直接交给 AI。

![Mark：在页面上打评审点并复制给 AI](media/mark.gif)

### 3. Inspector：锁定元素并跳转源码

按住 `Alt + Shift` 悬停页面元素，Inspector 会显示对应选择器；单击即可在本机 IDE 打开该元素的源码位置，减少在文件中反复搜索和猜测的时间。

![Inspector：按住 Alt + Shift 锁定元素并跳转到对应源码](media/inspector.gif)

## 核心价值



### HTML 标注，意见和元素绑定

正式说明不是贴在截图上的便利贴，而是由 `notes.snapshot.js` 驱动的结构化数据。Viewer 将说明、锚点、SVG 连线和交互状态渲染到页面上，让每条说明都能回到具体 DOM。

### UI 包复用，页面稳定输出

从本地 UI 包按统一 Token、组件和 Pattern 组合页面，减少 AI 从零拼装时的猜测和视觉漂移。相同的 UI 资产可以持续产出风格一致、结构稳定的原生 HTML 原型。

### 便捷修改，评审上下文可执行

Mark 只在本地作者服务会话中加载，评审标记可以批量复制和随时清空，不污染正式页面。导出的指令带有稳定 selector、元素 HTML 快照和评审意见，AI 拿到的是可执行的修改上下文。

### 从页面直接回源码

本地作者服务运行在 `127.0.0.1`，负责直接编辑页面、编辑正式说明、重绑锚点和定位源码。作者层与正式交付物分离，原型文件仍保持轻量、可移植。

### 一份状态，多种输出

通过 `PrototypeViewers` 统一管理业务状态；同一份原型既可以用于页面评审，也可以按 `scenarios` 批量输出不带批注层的纯页面 PNG。新建、编辑、空态、关联等多种页面状态都能被显式声明、稳定复现并批量截图。

### 标注和原型分离，交付物保持干净

正式原型只保留语义 DOM、稳定锚点、只读 Viewer 和渲染逻辑。Mark、Direct Edit、Notes Editor、Inspector、本地作者服务都属于独立作者工具，不写入正式 HTML 的加载结构。

## 最终产出

一次原型任务最终可以得到三类相互配合的产物：

- **可运行的原型文件**：原生 HTML，可直接打开或通过本地服务访问；
- **可复用的状态定义**：由 snapshot 声明页面说明和 `scenarios`，保证后续修改仍有稳定基准；
- **多状态页面截图**：按场景批量生成新建、编辑、空态、关联等纯页面 PNG，截图不包含右侧说明、SVG 连线和作者工具。

评审标注留在作者层，最终截图和原型文件保持干净；需要继续修改时，再通过作者服务打开页面或将评审上下文复制给 AI。

## 工作方式

```text
原生 HTML
   │
   ├── Viewer：正式说明、场景切换、SVG 连线
   ├── Mark：页面评审、selector、元素快照、Copy for AI
   ├── Inspector：锁定元素、查看选择器、跳转源码
   └── Screenshot：按场景输出纯页面截图
```

这套方式适合需要频繁调整的后台页面、配置页和交互原型：产品在页面上指出问题，AI 获得明确上下文，开发或作者可以快速回到源码验证修改。

## 开始使用

要求 Node.js 18+；场景截图还需要本机 Microsoft Edge 或 Google Chrome。

```powershell
# 用作者服务打开示例
node skills/html-prototype-build/runtime/server/index.mjs examples/minimal-notes/prototype.html --snapshot=prototype/notes.snapshot.js
```

```powershell
# 按 snapshot scenarios 批量生成纯页面截图
node skills/html-prototype-build/runtime/cli/screenshot.mjs examples/minimal-notes/prototype.html --snapshot=examples/minimal-notes/prototype/notes.snapshot.js
```

完整样例见 `[examples/minimal-notes](examples/minimal-notes)`。将 `skills/html-prototype-build/` 安装到 Agent Skill 路径后，即可让 Agent 创建或修改原型。

需要亲自启动作者服务、发起评审或输出截图时，请阅读 [references/local-authoring.md](skills/html-prototype-build/references/local-authoring.md) 等任务入口。Agent 的任务分流和约束见 `[SKILL.md](skills/html-prototype-build/SKILL.md)`。

## 分发结构

```text
.claude-plugin/marketplace.json  Claude Code Marketplace 清单
skills/html-prototype-build/     唯一的 Agent Skill 源
examples/                        可直接运行的最小原型
media/                           README 演示素材
scripts/                         校验脚本
tests/                           Runtime 单元测试与契约测试
```

Skill 内部 Runtime 按执行边界拆分：`client/` 是正式浏览器运行时，`author/` 是浏览器作者工具，`server/` 是本地 Node 作者服务，`cli/` 是独立命令行工具。

## 适用范围

这是一个面向 AI 协作的 HTML 标注和原型工具，不是生产组件库、Figma 替代品，也不是第三方设计系统实现。它更适合：

- 需要快速把 UI 材料落成可打开 HTML 的原型；
- 需要在页面上评审，并把意见准确交给 AI；
- 需要频繁修改页面结构、文案和状态，并保留可复现截图的场景。



## 安全边界

- `runtime/server/index.mjs` 只监听 `127.0.0.1`。不要对不可信 HTML 或 snapshot 运行作者服务和截图。
- 作者写接口要求 localhost 同源 JSON；`.env` 位于 `skills/html-prototype-build/`，只用于本机 IDE 选择，不要提交。
- Mark 是临时作者工具，按页面把评审上下文存入 localStorage，也可能复制到剪贴板；它不会注入源 HTML，也不属于正式交付物。
- 原型中不要放真实凭据、生产数据、个人信息或未授权品牌。



## 开源协作

项目当前处于实验性 0.x 阶段，接口和目录仍可能变化。贡献方式见 `[CONTRIBUTING.md](CONTRIBUTING.md)`，行为规范见 `[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)`，漏洞请按 `[SECURITY.md](SECURITY.md)` 私下报告。

本项目 UI 包为自研原生 HTML 视觉模拟，不捆绑第三方设计系统代码或官方资源。

## 许可证

[MIT](LICENSE)。第三方溯源见 [NOTICE](NOTICE)（含 html-mark 致谢与 Apache ECharts）。