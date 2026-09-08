# 评审打点

## 适用范围

需要给已有 HTML 写修改意见、通过 pin 交接反馈，或导出 For AI 定位信息时使用本入口。

Mark 是 `runtime/author/tools/mark/` 中的临时评审工具，与 Direct Edit 同在 Author Tools 面板的 `Mark` Tab 中；它不是右侧正式产品说明，也不写入 snapshot 或源 HTML。它通过本地作者服务动态加载。

## 操作步骤

1. 按 [本地作者服务](local-authoring.md#启动) 启动作者服务并打开页面。
2. 打开 Author Tools，切到 `Mark` Tab（或按 `M`）。
3. 按住 `Ctrl` / `⌘` 点击目标元素添加 pin。
4. 在 Mark 面板中定位、删除、清空，或使用 `Copy all → For AI` 导出意见、selector 和 HTML 快照。

Mark 数据只保存在当前页面 pathname 对应的浏览器 localStorage；不会修改 `prototype.html` 或 snapshot，因此交付前无需执行额外“移除 Mark 注入”步骤。

## Agent 边界

- 用户要求评审、打点、review pin 或导出 For AI 时，启动作者服务并进入 Mark Tab。
- Pin 数据按页面 pathname 保存到 localStorage；DOM 大改导致 selector 失效时，清空该页标注并重新打点。
- For AI 的 selector 和 HTML snapshot 用于定位源 HTML；Inspector 临时 token 不得成为导出 selector。
- Mark 不需要交付前“移除注入”，因为作者工具从未写入正式 HTML。

## 平台差异

Direct Edit 与 Mark 共用 `author/core/picker.js` 的元素选择逻辑：

- **Windows / Linux**：按住 `Ctrl` + 左键点击打点或选中；普通点击不拦截页面。
- **macOS**：优先 `⌘` + 左键；`Control`+左键触发 contextmenu 时也会处理该手势。

## 与其他工具的边界

- 写文字反馈让 Agent 修改源码：Mark。
- 直接在浏览器改样式或纯文本并写回源文件：Direct Edit。
- 编辑右侧正式说明卡片：Notes Editor。
- 查看并跳转元素源码：Inspector。
