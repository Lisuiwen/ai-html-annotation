# HTML Prototype Build

面向中文 AI 协作工作流的原生 HTML 产品原型工具包：可组合 UI 包、正式产品说明、临时评审打点、本地作者工具与按状态截图，组合为渐进读取、零运行时依赖的工作流。

它既是 Agent Skill（入口 [SKILL.md](SKILL.md)），也可由人直接调用 `runtime/` 下的 Node 脚本。

> **给人看的操作说明以本文为准。**  
> Agent 按任务读 [SKILL.md](SKILL.md) 与 `references/`；那些文档是约束与分流，不是用户手册。

## 能做什么

- **重建 UI**：从 UI 包选择 foundation 与组件，生成 `prototype.html` 与配套 `prototype/`。
- **产品说明标注**：用 `notes.snapshot.js` + `viewer.js` 生成右侧正式说明、SVG 连线与交互闪电。
- **评审打点**：向已有 HTML 注入可移除的 html-mark；按 `M` 开启，按住 `Ctrl` 点击打 pin。
- **本地作者服务**：在浏览器中编辑说明卡片、重绑目标，并用 Inspector 跳转源 HTML 对应行。
- **按场景截图**：根据 snapshot 的显式 `scenarios` 批量生成纯页面截图。

## 环境要求

- Node.js 18+；脚本仅依赖 Node 内建模块。
- 截图需要本机 Microsoft Edge 或 Google Chrome。

下文命令中的 `<skill-root>` 指本目录（`skills/html-prototype-build`）。

## 快速开始

最省事：直接对 AI 说，由它执行脚本并打开页面。例如：

- 「帮我把 `xxx/prototype.html` 注入评审层」→ 可打点的评审稿
- 「帮我启动 `xxx/prototype.html` 的作者服务」→ 本地编辑环境
- 「帮我对 `xxx/prototype.html` 按场景截图」→ 纯页面截图

作者服务启动后，浏览器打开它打印的 `http://127.0.0.1:4178/...` 即可。

## 交付物结构

正式原型根目录约定：

```text
prototype.html
prototype/
├─ prototype.css
├─ prototype.js
├─ notes.snapshot.js   # 正式说明唯一数据源
└─ viewer.js
screenshots/           # 按场景截图；不是页面运行依赖
assets/                # 仅有图片/字体等静态资源时创建
```

- `file://` 双击可用于**只读**预览正式说明。
- 要改卡片文案、顺序、锚点或增删说明，必须启动作者服务并配置 `--snapshot`。

## 本地作者服务

作者服务只绑定本机并动态加载工具，**不修改**原型源 HTML。

```bash
# 只读跑作者工具（未配置 snapshot 时 Editor 保存会被拒绝）
node <skill-root>/runtime/serve.mjs <prototype.html> [--port=4178]

# 启用正式说明写回
node <skill-root>/runtime/serve.mjs <prototype.html> --snapshot=prototype/notes.snapshot.js
```

打开 `http://127.0.0.1:4178/<prototype.html>`。

### 工具怎么选

| 目标 | 用什么 |
|------|--------|
| 编辑右侧正式说明卡片 / 稳定 selector | Editor（须带 `--snapshot`） |
| 临时评审 pin | html-mark（存在浏览器 localStorage，不写 snapshot） |
| 跳转源码 | Inspector（作者服务内 `Alt+Shift` 悬停并点击） |

### Inspector 与 IDE

`serve.mjs` 仅在响应 HTML 时动态注入短 token `data-insp-target="iXX"`，用于当前会话的源码行号映射；**不要**把这些 token 存成正式 selector 或 For AI selector。

复制 `runtime/.env.example` 为同目录 `.env` 指定编辑器：

```bash
CODE_EDITOR=cursor
# CODE_EDITOR=D:\Apps\CodeBuddy\CodeBuddy.exe
```

未配置时依次回退 `cursor` → `code`。`.env` 仅本机使用，不要提交。

## 评审打点（html-mark）

html-mark 是可剥离的临时评审层，**不是**右侧产品说明，也不写入正式 snapshot。默认不注入；需要评审 / 打点 / 导出 For AI 时再注入。

```bash
# 推荐：内联注入，评审稿可双击打开
node <skill-root>/runtime/prepare-mark.mjs <html-file> --inline

# 批量注入目录
node <skill-root>/runtime/prepare-mark.mjs <dir> --inline

# 移除评审层
node <skill-root>/runtime/prepare-mark.mjs <html-file> --remove
```

### 浏览器操作

| 操作 | 说明 |
|------|------|
| 按 `M` 或点击右上角 Mark | 进入评审打点模式 |
| 按住 `Ctrl` 点击产品元素 | 落下 pin 并打开便签 |
| `Enter` / `Esc` | 保存 / 关闭便签 |
| 右下角面板 | 查看、定位、删除或清空标注 |
| `Copy all` → For AI | 导出 selector + HTML 快照，交给 Agent 改源码 |

DOM 大改导致旧 pin 失效时，清空该页 localStorage 标注后重新打点。再次 `--inline` 会替换旧注入块，不会叠加。

## 场景截图

前置：snapshot 为 `schemaVersion: 2`，且用 `scenarios` 显式声明场景与组合 state；页面支持 `?scene=<id>`。

```bash
node <skill-root>/runtime/shoot.mjs <prototype.html>

# 可选
node <skill-root>/runtime/shoot.mjs <prototype.html> --width=1440 --height=900
node <skill-root>/runtime/shoot.mjs <prototype.html> --browser="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
node <skill-root>/runtime/shoot.mjs <prototype.html> --snapshot=prototype/notes.snapshot.js
```

脚本用本机 Edge/Chrome，按 `scenarios` 的键串行输出到 `<原型目录>/screenshots/<场景 id>.png`。截图 URL 固定为 `?scene=<id>&collapsed=1&product-only=1`（纯页面态，无右栏 / 连线 / Mark / 闪电）。

验收要点：

- 截图应反映业务状态，而不只是说明卡片切换。
- 图中不应出现右侧说明、SVG 连线、Mark 或交互闪电。
- 场景 id 须可安全作文件名；不适合时先换成稳定中性标识。

## 评审稿与正式交付稿

### 评审稿

- 保留 `prepare-mark.mjs --inline` 注入块，可双击继续打 pin。
- 正式产品说明仍来自 snapshot + Viewer；评审 pin 只在浏览器 localStorage。

### 正式交付稿

```bash
node <skill-root>/runtime/prepare-mark.mjs <prototype.html> --remove
```

交付稿中不得残留 Author Loader、Editor、html-mark、Inspector、源码定位 token，以及任何内联标注编辑脚本。根目录只保留 `prototype.html`、`prototype/`、`screenshots/`，按需再有 `assets/`。

## 目录结构

```text
SKILL.md             Agent 入口：按任务分流到 references/
README.md            给人看的操作说明（本文）
references/          Agent 按任务读取的约束与分流（不是用户手册）
ui/                  UI 包目录与契约
runtime/             原型运行时与作者工具
scripts/             Agent 确定性工具（如 resolve-pack.mjs）
addons/              可叠加的标注插件
```

## Agent / 深入阅读

- 任务分流与硬边界：[SKILL.md](SKILL.md)
- UI 生成：[references/ui-generation.md](references/ui-generation.md)
- 产品说明与 Viewer：[references/product-annotations.md](references/product-annotations.md)
- 生成硬契约：[references/generation-contract.md](references/generation-contract.md)
- Agent 侧作者 / 评审 / 截图 / 交付入口：同目录 `references/` 对应文件（约束用；操作步骤以本文为准）
