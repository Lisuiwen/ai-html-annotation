# 产品指南

[English](guide.md)

AI HTML Annotation 给需要和编程 Agent 一起评审原生 HTML 的人用。你**标注**、复制给 AI、截图的对象都是**页面**，不是一张效果图。

默认走读：[`examples/minimal-notes-system`](../examples/minimal-notes-system)（桌面）。手机宽度：[`examples/mobile-work-order`](../examples/mobile-work-order)。

第一次运行：[quickstart](quickstart.zh-CN.md)。对比截图 / Figma / 裸 HTML：[对比](comparison.zh-CN.md)。短问答：[FAQ](faq.zh-CN.md)。官方视觉：[UI 包](ui-packs.zh-CN.md)。

## 为何失败

很多原型的问题不是“画得不够像”，而是**画完之后没法继续和 Agent 一起工作**。

| 谁 | 旧做法 | 失败点 |
| --- | --- | --- |
| 评审人 / 产品 | 截图 + 聊天（“往左移一点”） | 意见对不上元素。Agent 猜结构，下一轮就漂。 |
| 作者 / Agent | 对着像素重写 HTML | 没有共享 UI 包。每次视觉都重来。 |
| 任何要验收修改的人 | 说明在文档、意见在聊天、改动在源码 | 对不上同一个元素，验证很慢。 |

接回去的方式是原生 HTML：在真实 DOM 上**标注**，用**作者工具**，**复制给 AI**，再出**多状态截图**。

```text
UI 包 → 标注（Viewer）→ Mark → 复制给 AI
        → Direct Edit → Inspector → 多状态截图
```

## 四个场景

### 1. 产品评审 — 打点，再复制给 AI

你在评审一页已经能打开的 HTML。你不想重写说明，只想让 Agent 改**这个**控件。

1. 在页面上打开作者工具。
2. 作者工具 → **Mark**（或按 `M`）。按住 `Ctrl`（macOS：`⌘`）点击元素。
3. 在 pin 上写意见。需要就钉多处。
4. `Copy all → For AI` 复制 selector、元素 HTML 和你的原文。

这些 pin 是会话里的评审标记，不是正式标注，也不会改 HTML 文件。右侧正式文案仍在 Viewer。

### 2. 作者迭代 — UI 包 + Direct Edit + Inspector

你在出页或收口，而不只是批注。

1. 从已安装的 UI 包生成（`admin-desktop` 或 `mobile-vant`），让后面的页面长得像这一套。见 [UI 包](ui-packs.zh-CN.md)。
2. 本地改样式或文案：作者工具 → **edit**，按住 `Ctrl` / `⌘`，改完保存。保存后的 CSS / 文案成为源码；编辑器界面不会。
3. 确认改的是对的节点：用 **Inspector**，按住 `Alt + Shift`，悬停后单击 — 在本机 IDE 打开对应位置。

Direct Edit 改源码；Mark 不改。Inspector 的高亮只用于当前会话 — 不要把它当成复制给 AI 的 selector。

### 3. 交付 — 多状态截图

交接不能只有一张主路径截图。新建、编辑、空态、关联（以及你声明的任何状态）都应显式、可复现。

1. 用正式标注声明页面状态。
2. 用右侧控件切换（或 `?scene=<id>`）。
3. 出纯净 PNG：只要产品页 — 不含标注栏、连线、Mark 和作者工具。

正式 HTML 仍可以带只读 Viewer。PNG 是纯产品页。交付目录里的 `AGENTS.md` 让后续 Coding Agent 读标注和截图，而不是搬原型实现。

### 4. Pack 负责人 — 自有 UI 包，稳定视觉

你要的不只是这一页，而是下一张后台或 H5 还长得像上一张。

- **安装**官方 `admin-desktop`、`mobile-vant`（或已下载的包）。UI 包**不**打进原型 Skill。
- 官方视觉不是你的语言时，去 **自定义或编写** UI 包，而不是每页手写一套 CSS。写包用另一套 Skill，不是生成业务原型。
- 自制包放在 `~/.html-prototype/packs/<id>/`，id 加命名空间，避免盖住官方 id。

自定义 / 维护的产品文档仍在[计划中](README.zh-CN.md#计划中)。在此之前看 [UI 包](ui-packs.zh-CN.md)。

## 能力表

| 你要做什么 | 用什么 | 所在层 |
| --- | --- | --- |
| 正式标注、场景切换、SVG 连线 | Viewer | 正式页面 |
| 评审 pin → 复制给 AI | Mark，`Copy all → For AI` | 作者会话 |
| 在页面上改样式或文案 | Direct Edit | 作者会话 |
| 锁定元素 → IDE | Inspector | 作者会话 |
| 视觉稳定 | UI 包 | 包，不在 Skill 内 |
| 新建 / 编辑 / 空态等纯净 PNG | 多状态截图 | 交付 |

### 作者层 vs 正式交付物

Mark、Direct Edit、Inspector 和作者工具只在你写作时加载。交出去的是语义 HTML、稳定锚点、只读 Viewer、可选纯净 PNG 和 `AGENTS.md`。不要把 Mark 的 pin 当成正式标注。不要把作者工具写进交付 HTML。

## 端到端步骤

不必每次跑完每一步。只做评审时从 Mark 开始。UI 包工作是可选的。第一条命令：[quickstart](quickstart.zh-CN.md)。

1. **从材料到可打开的 HTML。** 从材料确认页面类型（UI 类型不清楚就先问）。还没有 UI 包就先安装（笔记系统样例用 `admin-desktop`；mobile-work-order 用 `mobile-vant`）。启用原型 Skill，让 Agent 生成页面。双击 HTML 可只读预览 Viewer；要改内容需作者工具。

2. **评审 → Agent 修改。** 打开作者工具。用 Mark 钉元素。`Copy all → For AI` 粘贴给 Agent。再打开页面、切换状态确认。右侧正式文案走 Viewer，不是 Mark。

3. **页面上微调 + 回源码核对。** 作者工具 → **edit**。按住 `Ctrl` / `⌘`，改完保存。再用 Inspector（`Alt + Shift`）跳到 IDE。大改结构或状态应重新生成。正式标注卡片：在作者工具里双击右侧栏。

4. **多状态截图交付。** 声明页面状态（id 必须能当文件名）。在页面上抽查。出纯产品 PNG。整理带 `AGENTS.md` 的目录，让后续 Agent 读标注和 PNG — 不要搬原型实现。作者工具从不进入这个包。

5. **可选：自定义 UI 包再重新生成。** 产品形态变了（桌面后台 vs 手机 H5）就换包。视觉语言是你自己的就自定义（[UI 包](ui-packs.zh-CN.md)）。用新包重新生成。不要把写包当成业务页面任务。自定义 / 维护的产品文档仍在[计划中](README.zh-CN.md#计划中)。

## 接下来

- 第一条命令 → [quickstart](quickstart.zh-CN.md)
- 官方 UI 包 → [UI 包](ui-packs.zh-CN.md)
- 对比 Figma / 截图 → [对比](comparison.zh-CN.md)
- 短问答 → [FAQ](faq.zh-CN.md)

## 进阶

脚本名、快照文件和本机命令在 Skill 参考里 — 不写在上面的产品正文中。

- 启动作者工具 → [本地作者服务](../skills/html-prototype-build/references/local-authoring.md)
- 安装 UI 包 → [Pack install](../skills/html-prototype-build/references/pack-install.md)
- 打点并复制给 AI → [评审打点](../skills/html-prototype-build/references/review-mark.md)
- 多状态 PNG → [截图](../skills/html-prototype-build/references/screenshots.md)
- 交接目录 → [交付](../skills/html-prototype-build/references/delivery.md) / [清单](../skills/html-prototype-build/references/delivery-checklist.md)
- 生成规则 → [UI 生成](../skills/html-prototype-build/references/ui-generation.md)、[生成契约](../skills/html-prototype-build/references/generation-contract.md)
- Agent 分流 → [SKILL.md](../skills/html-prototype-build/SKILL.md)
- Skill 怎么用 → [html-prototype-build README](../skills/html-prototype-build/README.zh-CN.md)
- 编写 UI 包 → [ui-pack-maintain](../skills/ui-pack-maintain/SKILL.md)
