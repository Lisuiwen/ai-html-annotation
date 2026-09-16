# 5 分钟 quickstart

[English](quickstart.md)

安装 Skill、安装 UI 包、打开桌面样例、启动作者工具。到这里就应该能看到 Viewer、复制一次给 AI、切换页面状态。

需要 **Node.js 18+**。批量多状态截图（可选）需要本机 Microsoft Edge 或 Google Chrome。

默认样例：[`examples/minimal-notes-system`](../examples/minimal-notes-system)。手机宽度：[`examples/mobile-work-order`](../examples/mobile-work-order)，UI 包用 `mobile-vant`。

这条环为什么存在、第一次成功之后做什么：见[产品指南](guide.zh-CN.md)。

## 安装 Skill

**首选 — skills.sh**（Claude Code、Cursor、Codex 兼容客户端，以及其他 Agent Skills）：

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```

CLI 会打印 Skill 目录。Pack 作者再加 `--skill ui-pack-maintain`。

**备选 — Claude Code 插件 Marketplace：**

```text
/plugin marketplace add Lisuiwen/ai-html-annotation
/plugin install ai-html-annotation@lisuiwen-agent-skills
```

两者都从本仓库加载原型 Skill，没有第二份 `SKILL.md`。同一个插件也会加载 pack 编写 Skill。

## 安装 UI 包

UI 包不在 Skill 里。安装 Skill 之后，让 Agent 安装 `admin-desktop`（桌面）或 `mobile-vant`（手机）。默认位置：`~/.html-prototype/packs/<id>/`。

## 打开样例

在本仓库的 clone 里，用浏览器打开 `examples/minimal-notes-system/prototype.html`（双击即可）。

你应看到后台页面 **以及** 右侧 Viewer（标注、场景控件、连线）。双击打开是只读：可以读标注、切状态；不能保存卡片，也不能用 Mark、Direct Edit、Inspector。

如果没用这个仓库：先安装 UI 包，启用 Skill，让 Agent 按你的材料生成一页（[产品指南](guide.zh-CN.md#端到端步骤)）。

## 启动作者工具

作者工具只监听 `127.0.0.1`。打开进程打印的 localhost 地址。没有正式标注数据时，Direct Edit、Mark、Inspector 仍可用；标注卡片无法保存。

Inspector 跳转 IDE：把 Skill 根目录的 `.env.example` 拷成 `.env`。不要提交 `.env`。

## 第一次成功

五分钟路径完成的标志是下面三件都成立：

1. **Viewer** — 笔记系统页面上有标注；切换状态会改变卡片（以及页面）。
2. **复制给 AI** — 作者工具 → Mark，钉一个元素，`Copy all → For AI` 把 selector + HTML 放到剪贴板。
3. **页面状态** — 右侧控件对应已声明的场景。可选：出纯净的多状态 PNG。

Mark、Direct Edit、Inspector 只属于作者会话，不进入正式 HTML。边界：[产品指南](guide.zh-CN.md#能力表)。

## 接下来

- 第一次成功之后做什么 → [产品指南](guide.zh-CN.md)
- UI 包 → [UI 包](ui-packs.zh-CN.md)
- 和其他评审方式对比 → [对比](comparison.zh-CN.md)
- 常见问题 → [FAQ](faq.zh-CN.md)

## 进阶

`<skill-root>` 是 `npx skills add` 打印的目录。

```bash
node <skill-root>/scripts/install-pack.mjs --pack=admin-desktop
node <skill-root>/runtime/server/index.mjs examples/minimal-notes-system/prototype.html --snapshot=prototype/notes.snapshot.js
```

参数、覆盖保护和 `--dest=project`：[Pack install](../skills/html-prototype-build/references/pack-install.md)。手势和 tab：[本地作者服务](../skills/html-prototype-build/references/local-authoring.md)。纯净 PNG：[截图](../skills/html-prototype-build/references/screenshots.md)。Agent 分流：[SKILL.md](../skills/html-prototype-build/SKILL.md)。
