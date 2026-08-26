# CA Prototype

用于生成、评审和交付原生 HTML 产品原型的 Agent Skill。它将可组合 UI 包、正式功能说明、临时评审打点、本地作者工具和按状态截图组合为一个可渐进读取的工作流。

## 当前状态

本仓库当前为私有调整阶段，接口和目录仍可能变化。运行时只依赖 Node.js 内建模块；截图功能还需要本机 Edge 或 Chrome。

## 能力

- 按 UI Token 重建单文件 HTML 原型。
- 通过 `snapshot.js + viewer.js` 生成正式右侧说明与 SVG 连线。
- 向现有 HTML 注入可移除的 html-mark 评审层。
- 在 `127.0.0.1` 本地作者服务中编辑说明并使用 Inspector 定位源码。
- 根据 `?state=<group>&collapsed=1` 按状态批量截图。

## 快速开始

将本目录安装到你的 Agent Skill 路径，或在 Agent 会话中读取 `SKILL.md`。脚本均可从任意位置调用：

```powershell
# 为 HTML 注入可双击打开的评审层。
node <skill-root>/runtime/prepare-mark.mjs <prototype.html> --inline

# 启动本地作者服务。
node <skill-root>/runtime/serve.mjs <prototype.html> --snapshot=prototype.notes.snapshot.js

# 按正式说明分组生成纯页面截图。
node <skill-root>/runtime/shoot.mjs <prototype.html>
```

完整约束与按任务分流见 [SKILL.md](SKILL.md)。可运行的三文件正式标注样例位于 [examples/minimal-notes](examples/minimal-notes)。

## 目录

```text
addons/       可选正式标注能力
references/   按任务渐进读取的工作流与生成契约
runtime/      无依赖 Node.js 工具和浏览器运行时
ui/           可组合 UI 包、Token 与组件片段
examples/     可直接打开的最小原型
```

## 安全边界

- `serve.mjs` 仅监听 `127.0.0.1`，不会暴露到局域网。
- 说明写回仅允许目标 HTML 所在目录内的 snapshot 文件。
- `.env` 仅供本机 Inspector 指定 IDE 使用，不应提交。
- 原型中不应包含真实凭据、生产数据、个人信息或未授权品牌资源。

## 许可证

[MIT](LICENSE)
