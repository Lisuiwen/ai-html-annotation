# 评审打点

## 适用范围

需要给已有 HTML 写修改意见、通过 pin 交接反馈，或导出 For AI 定位信息时使用本入口。

html-mark 是可剥离的临时评审层，不是右侧产品说明，也不写入正式 snapshot。

**注入/移除命令与浏览器打点步骤见 [README.md](../README.md#评审打点html-mark)。**

## Agent 边界

- 默认不注入 html-mark；仅当用户要求评审、打点、review pin 或导出 For AI 时运行 `--inline`。
- For AI 的 selector 和 HTML snapshot 用于定位源 HTML；Inspector 临时 token 不得成为导出 selector。
- 修改源 HTML 后可再次 `--inline`；脚本会替换旧注入块。
- DOM 大改导致旧 pin 失效时，清空该页 localStorage 标注并重新打点。

## 与其他工具的边界

- 想写文字反馈让 Agent 修改源码：使用本入口。
- 想直接在浏览器手改 DOM 并回写源文件：使用 redline，不在本 Skill 内处理。
- 想编辑右侧正式说明卡片：使用 [local-authoring.md](local-authoring.md)。
