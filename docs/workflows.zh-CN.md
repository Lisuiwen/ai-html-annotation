# 端到端工作流

[English](workflows.md)

一条环上的五件事。本仓库默认页面：[`examples/minimal-notes-system`](../examples/minimal-notes-system)。移动备选：[`examples/mobile-work-order`](../examples/mobile-work-order)。

作者会话 vs 正式文件：[能力地图 — 作者层 vs 正式交付](features.zh-CN.md#作者层-vs-正式交付物)。这些步骤为什么存在：[痛点](pain-points-and-scenarios.zh-CN.md)。

## 闭环

```text
材料 → 用 UI pack 生成 HTML
        → Viewer（正式说明）
        → Mark → Copy for AI → Agent 改源码
        → Direct Edit（可选，页面上微调）
        → Inspector（到源码核对）
        → scenarios（纯净 PNG）
        → 可选：自定义 pack，再重新生成
```

不必每次跑完每一步。只做评审时从 Mark 开始。Pack 工作是可选的，用另一套 Skill。

## 1. 从材料到可打开的 HTML

**目标：** 一页能打开的 HTML，而不是一叠截图。

1. 从材料确认页面类型和业务事实。UI 类型不清楚就先问 — 不要默认某套视觉（[目录](../skills/html-prototype-build/ui/catalog.md)）。
2. 还没有 pack 就先安装（笔记系统样例用 `admin-desktop`；mobile-work-order 用 `mobile-vant`）。短命令：[quickstart](quickstart.zh-CN.md)；完整协议：[pack 安装](../skills/html-prototype-build/references/pack-install.md)。
3. 启用 `html-prototype-build`，让 Agent 生成带 `prototype.html` 和 `prototype/` 的 `<prototype-name>/`，状态走 `PrototypeViewers`。约束：[SKILL.md](../skills/html-prototype-build/SKILL.md)、[UI 生成](../skills/html-prototype-build/references/ui-generation.md)、[生成契约](../skills/html-prototype-build/references/generation-contract.md)。

双击 `prototype.html` 可只读预览 Viewer（`file://`）。改说明、Mark、Direct Edit、Inspector 都需要作者服务。

## 2. 评审 → Agent 修改

**目标：** 能点名 DOM 节点的反馈。

1. 带 snapshot 启动作者服务（[本地作者服务](../skills/html-prototype-build/references/local-authoring.md)）。
2. 用 Mark 钉元素（[评审打点](../skills/html-prototype-build/references/review-mark.md)）。
3. `Copy all → For AI` 粘贴给 Agent。它应按 selector 和 HTML 快照定位源码 — 不是对着截图猜。
4. 再打开页面、切换场景确认修改。右侧正式文案走 Viewer / Notes editor，不是 Mark。

## 3. 页面上微调 + 回源码核对

**目标：** 小改样式或文案，不必再描述整棵树。

1. Author Tools → `edit`。按住 `Ctrl` / `⌘`，改样式或文本，保存。服务端写回源 HTML。
2. Inspector：`Alt + Shift`，单击，跳到 IDE。Agent 改完或 Direct Edit 保存后都可以用。
3. 大改结构、布局或状态应走 [UI 生成](../skills/html-prototype-build/references/ui-generation.md)，不要靠一连串 Direct Edit。

正式说明卡片：在作者会话且带 `--snapshot` 时，双击右侧栏。那是写 `notes.snapshot.js`，不是 Mark 的存储。

## 4. 多状态截图交付

**目标：** 每个声明状态一张纯净 PNG，外加交接目录。

1. 保持 `schemaVersion: 2` 的 snapshot，并显式声明 `scenarios`。id 必须能当文件名。
2. 在作者服务 URL 上抽查 `?scene=<id>`。
3. 跑截图 CLI（[截图](../skills/html-prototype-build/references/screenshots.md)）。它总会加上 `collapsed=1&product-only=1`。
4. 整理独立目录，并按[交付](../skills/html-prototype-build/references/delivery.md) / [清单](../skills/html-prototype-build/references/delivery-checklist.md)过一遍。`AGENTS.md` 保持模板：后续 Agent 读说明和 PNG；不要搬原型实现。

Author Tools 从不进入这个包。Direct Edit 可能已经改过源 HTML；Mark 的 pin 不在文件里。

## 5. 可选：自定义 pack 再重新生成

**目标：** 下一页看起来像这一页，是故意的。

产品形态变了（桌面后台 vs 手机 H5）就 **换 pack**。视觉语言是你自己的、官方 pack 只是错误的模拟时，去 **自定义或编写** pack。

1. 安装或拷贝 pack；本地 pack 用带命名空间的 id（[UI packs](ui-packs.zh-CN.md)）。
2. Pack 契约、校验、registry：[`ui-pack-maintain`](../skills/ui-pack-maintain/SKILL.md)。产品文档[自定义 pack](ui-pack-customize.zh-CN.md)和[维护 pack](ui-pack-maintain.zh-CN.md)仍在计划中。
3. 用新 pack 重新生成原型（[UI 生成](../skills/html-prototype-build/references/ui-generation.md)）。不要把写 pack 当成业务页面任务。

## 接下来

- 第一条命令 → [quickstart](quickstart.zh-CN.md)
- 工具地图 → [features](features.zh-CN.md)
- 对比 Figma / 截图 → [对比](comparison.zh-CN.md)
