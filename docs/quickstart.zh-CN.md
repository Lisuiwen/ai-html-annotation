# 5 分钟 quickstart

[English](quickstart.md)

安装 Skill、安装 pack、打开桌面样例、启动作者服务。到这里就应该能看到 Viewer、复制一次 Mark 导出、切换场景。更长的协议在 Skill references — 本页保持短。

需要 **Node.js 18+**。批量截图（可选）需要本机 Microsoft Edge 或 Google Chrome。

默认样例：[`examples/minimal-notes-system`](../examples/minimal-notes-system)。手机宽度备选：[`examples/mobile-work-order`](../examples/mobile-work-order)，pack 用 `mobile-vant`。

## 安装 Skill

**首选 — skills.sh**（Claude Code、Cursor、Codex 兼容客户端，以及其他 Agent Skills）：

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```

CLI 会打印 Skill 目录。下面的 `<skill-root>` 就是这条路径。

**备选 — Claude Code 插件 Marketplace：**

```text
/plugin marketplace add Lisuiwen/ai-html-annotation
/plugin install ai-html-annotation@lisuiwen-agent-skills
```

两者都从本仓库加载 `html-prototype-build`，没有第二份 `SKILL.md`。Pack 作者再加 `--skill ui-pack-maintain`（或同一个插件，它也会加载该 Skill）。

## 安装 UI pack

Pack 不在 Skill 里。安装 Skill 之后：

```bash
node <skill-root>/scripts/install-pack.mjs --pack=admin-desktop
```

默认写到 `~/.html-prototype/packs/admin-desktop/`。需要先选包时用 `--list-remote`。完整参数、覆盖保护和 `--dest=project` 见 [pack 安装](../skills/html-prototype-build/references/pack-install.md)。

移动样例改用 `--pack=mobile-vant`。

## 打开样例

在本仓库的 clone 里，用浏览器打开 `examples/minimal-notes-system/prototype.html`（双击即可）。

你应看到后台页面 **以及** 右侧 Viewer（正式说明、场景控件、连线）。`file://` 下是只读：可以读说明、切场景；不能保存卡片，也不能用 Mark、Direct Edit、Inspector。

如果没用这个仓库：先安装 pack，启用 Skill，让 Agent 按你的材料生成一页（[工作流](workflows.zh-CN.md#1-从材料到可打开的-html)）。

## 本地作者服务（最短路径）

```bash
node <skill-root>/runtime/server/index.mjs examples/minimal-notes-system/prototype.html --snapshot=prototype/notes.snapshot.js
```

保证 HTML 路径相对你的 cwd 正确（或改用绝对路径）。打开进程打印的 `http://127.0.0.1:4178/...`。服务只绑定 `127.0.0.1`。

不带 `--snapshot` 时，Direct Edit、Mark、Inspector 仍可用；正式说明卡片无法保存。

Inspector 跳转 IDE：把 [`skills/html-prototype-build/.env.example`](../skills/html-prototype-build/.env.example) 拷到 `<skill-root>/.env`。不要提交 `.env`。手势和 tab 见[本地作者服务](../skills/html-prototype-build/references/local-authoring.md)。

## 第一次成功

五分钟路径完成的标志是下面三件都成立：

1. **Viewer** — 笔记系统页面上有正式说明；切换场景会改变卡片（以及页面状态）。
2. **Mark 复制** — Author Tools → Mark，钉一个元素，`Copy all → For AI` 把 selector + HTML 快照放到剪贴板（[评审打点](../skills/html-prototype-build/references/review-mark.md)）。
3. **Scenario** — `?scene=<id>` 或右侧控件对应 `prototype/notes.snapshot.js` 里 `scenarios` 的某个 key。可选：用截图 CLI 出纯净 PNG（[截图](../skills/html-prototype-build/references/screenshots.md)）。

Mark、Direct Edit、Inspector 只属于作者会话，不进入正式 HTML。边界：[能力地图](features.zh-CN.md#作者层-vs-正式交付物)。

## 接下来

- 第一次成功之后做什么 → [工作流](workflows.zh-CN.md)
- 工具地图 → [features](features.zh-CN.md)
- Pack → [UI packs](ui-packs.zh-CN.md)
- Agent 分流 → [SKILL.md](../skills/html-prototype-build/SKILL.md)
- Skill 怎么用 → [html-prototype-build README](../skills/html-prototype-build/README.zh-CN.md)
- 常见问题 → [FAQ](faq.zh-CN.md)
