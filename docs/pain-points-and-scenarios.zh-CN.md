# 痛点与场景

[English](pain-points-and-scenarios.md)

很多原型的问题不是“画得不够像”，而是**画完之后没法继续和 Agent 一起工作**。下面先点出三处失败，再按四个岗位走一遍默认样例 [`examples/minimal-notes-system`](../examples/minimal-notes-system)（桌面）。手机宽度 H5 用同一套闭环，样例见 [`examples/mobile-work-order`](../examples/mobile-work-order)。

能力细节：[features](features.zh-CN.md)。逐步操作：[workflows](workflows.zh-CN.md)。第一次运行：[quickstart](quickstart.zh-CN.md)。对比截图 / Figma / 裸 HTML：[对比](comparison.zh-CN.md)。

## 三处失败

| 谁 | 旧做法 | 失败点 |
| --- | --- | --- |
| 评审人 / 产品 | 截图 + 聊天（“往左移一点”） | 意见对不上 DOM。Agent 猜结构，下一轮就漂。 |
| 作者 / Agent | 对着像素或一次性页面重写 HTML | 没有共享 Token，也没有标注运行时。每次视觉和结构都重来。 |
| 任何要验收修改的人 | 说明在文档、意见在聊天、改动在源码 | 对不上同一个元素，验证很慢。 |

这与[根 README](../README.zh-CN.md) 里的三处断裂是同一件事。AI HTML Annotation 用原生 HTML 把它们接回去：你评审、复制、截图的对象都是**页面**。

## 场景 1 — 产品评审：Mark + Copy for AI

你在评审一页已经能打开的 HTML（笔记系统样例，或 Agent 刚生成的页）。你不想重写说明，只想让 Agent 改**这个**控件。

1. 启动本地作者服务（[本地作者服务](../skills/html-prototype-build/references/local-authoring.md)）。
2. 打开 Author Tools → **Mark**（或按 `M`）。按住 `Ctrl`（macOS：`⌘`）点击元素。
3. 在 pin 上写意见。需要就钉多处。
4. `Copy all → For AI` 导出稳定 selector、元素 HTML 快照和评审原文。

Mark 的 pin 存在页面作用域的 `localStorage`。它们不是正式说明，也不会写入 `prototype.html` 或 `notes.snapshot.js`。右侧正式文案仍在 Viewer。打点步骤：[评审打点](../skills/html-prototype-build/references/review-mark.md)。

## 场景 2 — 作者迭代：pack + Direct Edit + Inspector

你在出页或收口，而不只是批注。

1. 从已安装的 UI pack 生成，让 Token、组件和 Pattern 可复用（[UI packs](ui-packs.zh-CN.md)，[pack 安装](../skills/html-prototype-build/references/pack-install.md)）。
2. 本地改样式或文案：Author Tools → **edit**，按住 `Ctrl` / `⌘`，改完保存。作者服务把修改写回源 HTML。Direct Edit 的界面本身不会注入交付物。
3. 确认 Agent（或你）改的是对的节点：用 **Inspector**，按住 `Alt + Shift`，悬停后单击 — 在本机 IDE 打开对应位置。

Viewer 仍在同一 DOM 上显示正式说明。Direct Edit 改源码；Mark 不改。Inspector 临时写入的 `data-insp-target` 只用于当前会话 — 不要存成正式 selector 或 For-AI selector。命令见[本地作者服务](../skills/html-prototype-build/references/local-authoring.md)。

## 场景 3 — 交付：scenarios，多状态纯净 PNG

交接不能只有一张主路径截图。新建、编辑、空态、关联（以及你声明的任何状态）都应显式、可复现。

1. `PrototypeViewers` 持有产品状态。`notes.snapshot.js` 用 `scenarios` 声明截图清单和组合状态。
2. 页面上用右侧场景按钮或 `?scene=<id>` 切换。
3. 截图 CLI 写出 `screenshots/<scene-id>.png`，URL 带 `collapsed=1&product-only=1`，藏掉右侧说明、SVG 连线、Mark 和作者工具。

正式 HTML 仍可以带只读 Viewer。PNG 是纯产品页。交付目录里的 `AGENTS.md` 让后续 Coding Agent 读说明和截图，而不是搬原型实现。见[场景截图](../skills/html-prototype-build/references/screenshots.md)与[交付](../skills/html-prototype-build/references/delivery.md)。

## 场景 4 — Pack 负责人：自有 pack，稳定视觉

你要的不只是这一页，而是下一张后台或 H5 还长得像上一张。

- 终端用户用 `install-pack.mjs` **安装**官方 `admin-desktop`、`mobile-vant`（或已下载的 pack）。Pack **不**打进 `html-prototype-build`。
- 官方视觉不是你的语言时，去 **自定义或编写** pack，而不是每页手写一套 CSS。写 pack 用 `ui-pack-maintain` Skill，不是生成业务原型。
- 自制 pack 放在 `~/.html-prototype/packs/<id>/`，id 加命名空间，避免盖住官方 id。

自定义 / 维护的产品文档仍在[计划中](README.zh-CN.md#计划中)。在此之前看 [UI packs](ui-packs.zh-CN.md) 和 [`ui-pack-maintain` SKILL.md](../skills/ui-pack-maintain/SKILL.md)。

## 痛点 × 能力

| 痛点 | 能力 | 所在层 |
| --- | --- | --- |
| 聊天意见对不上元素 | Mark + `Copy all → For AI` | 作者会话 |
| 对着截图写的 HTML 会漂 | 用 UI pack 生成；在 Viewer 上评审 | Pack + 正式页面 |
| 说明 / 聊天 / 源码各说各的 | 正式说明在 `notes.snapshot.js`，绑在真实 DOM | 正式页面 |
| 小改视觉还要满文件找 | Direct Edit，再用 Inspector 核对 | 作者会话 |
| 交付 PNG 带着说明栏 | `scenarios` + 纯产品截图 | 交付 |
| 每个原型都重新发明外观 | 安装、自定义或维护 pack | Pack Skill |

## 接下来

- 各工具是什么 → [能力地图](features.zh-CN.md)
- 端到端步骤 → [工作流](workflows.zh-CN.md)
- 安装与第一次成功 → [5 分钟 quickstart](quickstart.zh-CN.md)
- 和其他评审方式对比 → [对比](comparison.zh-CN.md)
