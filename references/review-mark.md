# 评审打点

## 适用范围

需要给已有 HTML 写修改意见、通过 pin 交接反馈，或导出 For AI 定位信息时使用本入口。

html-mark 是可剥离的临时评审层，不是右侧产品说明，也不写入正式 snapshot。

## 注入与移除

```bash
# 推荐：运行时内联，保持评审稿双击即开。
node <skill-root>/runtime/prepare-mark.mjs <html-file> --inline

# 批量注入目录。
node <skill-root>/runtime/prepare-mark.mjs <dir> --inline

# 移除评审层。
node <skill-root>/runtime/prepare-mark.mjs <html-file> --remove
```

生成或修改原型后默认运行 `--inline`。用户明确说“不要打点”“不用评审”或“不加 html-mark”时跳过。

## 浏览器操作

1. 按 `M` 或点击右上角 `Mark` 开启模式。
2. 按住 `Ctrl` 点击产品元素，落下 pin 并打开便签。
3. 输入反馈，`Enter` 保存；`Esc` 关闭。
4. 在右下角面板查看、定位、删除或清空标注。
5. 点击 `Copy all` 并选择 For AI。

## 回改约束

- For AI 的 selector 和 HTML snapshot 用于定位源 HTML。
- Inspector 临时 token 不得成为导出 selector。
- Agent 修改源 HTML 后可直接再次运行 `--inline`；脚本会替换旧注入块。
- DOM 大改导致旧 pin 目标失效时，在新页面清空 localStorage 标注并重新打点。

## 与其他工具的边界

- 想写文字反馈让 Agent 修改源码：使用本入口。
- 想直接在浏览器手改 DOM 并回写源文件：使用 redline，不在本 Skill 内处理。
- 想编辑右侧正式说明卡片：使用 [local-authoring.md](local-authoring.md)。
