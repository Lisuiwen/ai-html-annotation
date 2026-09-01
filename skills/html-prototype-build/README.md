# HTML Prototype Build

面向中文 AI 协作工作流的原生 HTML 产品原型工具包：把可组合 UI 包、正式产品说明、临时评审打点、本地作者工具和按状态截图，组合为一个渐进读取、零运行时依赖的工作流。

它既是一个 Agent Skill（入口为 [SKILL.md](SKILL.md)），也可由人直接调用 `runtime/` 下的 Node 脚本操作原型文件。

## 能做什么

- **重建 UI**：从 UI 包选择 foundation 与组件，生成单文件 `prototype.html` 与配套的 `prototype/` 目录。
- **产品说明标注**：用 `notes.snapshot.js` + `viewer.js` 生成右侧正式说明、SVG 连线与交互闪电。
- **评审打点**：向已有 HTML 注入可移除的 html-mark 评审层，按 `M` 开启、按住 `Ctrl` 点击打 pin。
- **本地作者服务**：在浏览器中编辑说明卡片、重绑目标，并用 Inspector 跳转源 HTML 对应行。
- **按场景截图**：根据 snapshot 的显式 `scenarios` 批量生成纯页面截图。

## 环境要求

- Node.js 18 及以上；运行时仅依赖 Node 内建模块。
- 截图功能需要本机 Microsoft Edge 或 Google Chrome。



## 快速开始

最省事的用法是直接对 AI 助手说，它会替你执行对应脚本并打开页面。示例：

- 「帮我把 xxx`/prototype.html` 注入评审层」→ 生成可打点的评审稿
- 「帮我启动 `xxx/prototype.html` 的作者服务」→ 启动本地编辑环境
- 「帮我对 `xxx/prototype.html` 按场景截图」→ 生成纯页面截图

作者服务启动后，浏览器访问它打印出的 `http://127.0.0.1:4178/...` 地址即可。

## agent上下文标注


| 操作                  | 说明                    |
| ------------------- | --------------------- |
| 按 `M` 或点击 标注        | 进入评审打点模式              |
| 按住 `Ctrl` 点击产品元素    | 落下 pin 并打开便签          |
| `Enter` / `Esc`     | 保存 / 关闭便签             |
| `Copy all` → For AI | 导出定位信息供 Agent 改源 HTML |




### Inspector 源码定位


| 操作                | 说明                 |
| ----------------- | ------------------ |
| `Alt+Shift` 悬停并点击 | 在作者服务中跳转源 HTML 对应行 |


Inspector 通过 IDE 打开源码，可在 `runtime/.env` 中指定编辑器（复制 `runtime/.env.example` 为 `runtime/.env` 后修改）：

```bash
# PATH 中的 CLI 名（不支持附带参数）
CODE_EDITOR=cursor

# 或可执行文件绝对路径
CODE_EDITOR=D:\Apps\CodeBuddy\CodeBuddy.exe
```

未配置时依次回退 `cursor` → `code`；`.env` 仅本机使用，不应提交。

## 目录结构

```text
SKILL.md             Agent 入口：按任务分流到 references/
references/          按任务读取的操作文档（UI 生成、标注、作者服务、评审、截图、交付）
ui/                  UI 包目录与契约（catalog.md、contract.md、packs/）
runtime/             原型运行时与作者工具（viewer.js、serve.mjs、shoot.mjs、prepare-mark.mjs 等）
scripts/             Agent 使用的确定性工具（resolve-pack.mjs）
addons/              可叠加的标注插件
```



## 了解更多

- 各任务的完整约束与分流规则见 [SKILL.md](SKILL.md)。
- UI 生成步骤见 [references/ui-generation.md](references/ui-generation.md)，产品说明规范见 [references/product-annotations.md](references/product-annotations.md)。
- 安全边界与交付状态见 [references/delivery.md](references/delivery.md)。

