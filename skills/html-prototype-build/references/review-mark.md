# 评审打点

## 适用范围

需要给已有 HTML 写修改意见、通过 pin 交接反馈，或导出 For AI 定位信息时使用本入口。

Mark 是 `runtime/author/tools/mark/` 中的临时评审工具，不是右侧正式产品说明，也不写入 snapshot 或源 HTML。它通过本地作者服务动态加载，不再使用 standalone `html-mark.js` / `prepare-mark.mjs` 注入。

操作步骤见 [README.md](../README.md#评审打点)。

## Agent 边界

- 用户要求评审、打点、review pin 或导出 For AI 时，启动作者服务并进入 Mark Tab。
- Pin 数据按页面 pathname 保存到 localStorage；DOM 大改导致 selector 失效时，清空该页标注并重新打点。
- For AI 的 selector 和 HTML snapshot 用于定位源 HTML；Inspector 临时 token 不得成为导出 selector。
- Mark 不需要交付前“移除注入”，因为作者工具从未写入正式 HTML。

## 平台差异

- **Windows / Linux**：按住 `Ctrl` + 左键点击打点；普通点击不拦截页面。
- **macOS**：优先 `⌘` + 左键；`Control`+左键触发 contextmenu 时 Mark 也会处理该手势。

## 与其他工具的边界

- 写文字反馈让 Agent 修改源码：Mark。
- 直接在浏览器改样式或纯文本并写回源文件：Direct Edit。
- 编辑右侧正式说明卡片：Notes Editor。
- 查看并跳转元素源码：Inspector。
