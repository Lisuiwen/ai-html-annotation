# HTML Prototype Build 使用手册

用于操作已有 HTML 原型：编辑正式说明、发起页面评审、生成场景截图和整理交付稿。项目价值、演示和适用范围见[仓库 README](../../README.md)。

## 开始前

- 需要 Node.js 18+；所有脚本只依赖 Node 内建模块。
- 批量截图需要本机 Microsoft Edge 或 Google Chrome。
- 下文的 `<skill-root>` 指本目录 `skills/html-prototype-build`。

若需要新建或重建页面，请让 Agent 按 [SKILL.md](SKILL.md) 选择 UI 包并生成原型；本手册从已有 `prototype.html` 开始。

## 直接交给 AI

推荐顺序：编辑正式说明 → 收集页面评审 → 按场景输出截图 → 清理评审层后交付。

| 你可以这样说 | AI 会完成什么 |
|---|---|
| “启动 `xxx/prototype.html` 的作者服务，我要修改右侧说明。” | 启动本地服务，加载 snapshot，并支持编辑说明、重绑元素和跳转源码。 |
| “给 `xxx/prototype.html` 注入评审层，我要在页面上打点。” | 生成可双击打开的评审稿；你可在页面中添加 pin，并复制 For AI 修改上下文。 |
| “按 `xxx/prototype.html` 的场景生成交付截图。” | 读取 `scenarios`，输出 `screenshots/<scene-id>.png`。 |
| “清理 `xxx/prototype.html` 的评审层，准备正式交付。” | 移除 html-mark，保留干净的原型与截图。 |

作者服务启动后，打开 AI 返回的 `http://127.0.0.1:4178/...` 地址。未传 `--snapshot` 时只能查看，不能保存正式说明。

手动执行时，分别使用 `serve.mjs`、`prepare-mark.mjs` 和 `shoot.mjs`；命令参数见对应的[深入说明](#按任务查看详情)。

## 页面内手动操作

以下操作在浏览器打开原型后完成；正式说明编辑和 Inspector 需要通过作者服务打开页面。

| 目标 | 页面操作 |
|---|---|
| 切换页面状态 | 点击右侧工具栏中的当前场景名称，按 `scenarios` 声明顺序循环切换；也可使用 `?scene=<场景-id>` 直达指定状态。 |
| 收起或展开说明栏 | 点击右侧工具栏的 `››` / `‹‹` 按钮。 |
| 编辑正式说明 | 双击说明标题、正文或页头文案进行原位编辑；标题和页头按 `Enter` 保存，正文按 `Ctrl + Enter` 保存，`Esc` 取消。 |
| 管理正式说明 | 使用右侧卡片的 `+` 新增、铅笔编辑正文、目标绑定按钮重新绑定元素、垃圾桶删除、拖拽手柄调整顺序。 |
| 添加评审标注 | 按 `M` 进入 Mark 模式，按住 `Ctrl` 点击页面元素；填写意见后按 `Enter` 保存、`Esc` 关闭。 |
| 管理评审标注 | 在右下角 Mark 面板中定位、删除、清空或使用 `Copy all → For AI`；Mark 模式下按 `Backspace` 可删除最后一条标注。 |
| 跳转到元素源码 | 按住 `Alt + Shift`，悬停查看元素范围和选择器后单击；浏览器会请求本机 IDE 打开对应源码位置。（需要在 runtime/.env配置你的编辑器） |

Inspector 仅在作者服务页面中生效。松开 `Alt` 或 `Shift` 即退出检查模式；若没有配置 IDE，页面仍可定位元素，但无法自动打开源码文件。

## 评审并交给 AI

1. 对原型执行 `prepare-mark.mjs ... --inline`。
2. 打开页面后按 `M` 进入打点模式，按住 `Ctrl` 点击目标元素添加 pin。
3. 在右下角面板中使用 `Copy all → For AI`，复制意见、selector 和元素 HTML 快照。
4. 评审结束后移除临时评审层：

```bash
node <skill-root>/runtime/prepare-mark.mjs <prototype.html> --remove
```

## 原型与交付物

```text
prototype.html                 原型入口
prototype/
├─ prototype.css
├─ prototype.js
├─ notes.snapshot.js           正式说明与场景定义
└─ viewer.js
screenshots/                   按场景输出的纯页面 PNG
assets/                        按需存放图片、字体等静态资源
```

- `notes.snapshot.js` 是正式说明唯一数据源，`scenarios` 是多状态截图唯一依据。
- `screenshots/` 应包含新建、编辑、空态、关联等需要交付的页面状态；它不是页面运行依赖。

## 交付检查

- 正式说明只通过作者服务写入 snapshot。
- html-mark 的 pin 只保存在浏览器 localStorage，不写入 snapshot。
- 交付前移除 html-mark；Editor、Inspector 和源码定位 token 不得进入原型文件。
- 最终截图不应包含右侧说明、SVG 连线、Mark 或作者工具。
- 作者服务仅监听 `127.0.0.1`；仅对可信 HTML 和 snapshot 使用，原型中不要放真实凭据或生产数据。

## 按任务查看详情

- [UI 生成](references/ui-generation.md)
- [产品说明标注](references/product-annotations.md)
- [本地作者服务](references/local-authoring.md)
- [评审打点](references/review-mark.md)
- [场景截图](references/screenshots.md)
- [交付与迭代](references/delivery.md)
