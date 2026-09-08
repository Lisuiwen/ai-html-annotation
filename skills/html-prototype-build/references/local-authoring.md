# 本地作者服务

## 适用范围

需要在浏览器中直接修改原型样式/文本、编辑正式说明、增删或排序卡片、重新绑定目标，或者使用 Inspector 跳转源码时使用本入口。

作者服务只绑定 `127.0.0.1`，动态注入 `runtime/author/` 工具，不修改原型源 HTML 的加载结构。

## 启动

```bash
node <skill-root>/runtime/server/index.mjs <prototype.html> --snapshot=prototype/notes.snapshot.js
```

打开终端返回的 `http://127.0.0.1:4178/...`。未传 `--snapshot` 时仍可使用 Direct Edit、Mark 与 Inspector，但不能保存正式说明卡片。

IDE 跳转配置放在 `<skill-root>/.env`，模板为 [.env.example](../.env.example)。

## 页面内作者工具

Author Tools 浮层中，`Edit` 与 `Mark` 为同一面板的两个 Tab；右侧正式说明与 Inspector 分别独立。

| 目标 | 页面操作 |
|---|---|
| Direct Edit | 打开 Author Tools → `Edit`，按住 `Ctrl`（macOS 为 `⌘`）点击页面元素；修改后保存写回源 HTML。 |
| Mark 评审 | 打开 Author Tools → `Mark`，或按 `M`；按住 `Ctrl`（macOS 为 `⌘`）点击元素添加 pin。 |
| 编辑正式说明 | 双击说明标题、正文或页头文案；标题/页头 `Enter` 保存，正文 `Ctrl + Enter` 保存，`Esc` 取消。 |
| 管理正式说明 | 使用 `+`、编辑、目标绑定、删除和拖拽排序。 |
| Inspector | 按住 `Alt + Shift` 悬停并点击目标，跳转 IDE 源码位置。 |
| 切换页面场景 | 使用右侧场景按钮，或 `?scene=<场景-id>`。 |

## Agent 边界

- 服务入口为 `runtime/server/index.mjs`；IDE 配置位于 `<skill-root>/.env`。
- `file://` 双击只用于只读预览正式说明；改卡片须启动作者服务且配置 `--snapshot`。
- 直接修改样式/纯文本 → `author/tools/direct-edit/`，经 `/__prototype-author/edit` 写回源 HTML。
- 正式说明 → `author/tools/notes-editor/`，写回 snapshot。
- 临时评审 pin → `author/tools/mark/`，只写 localStorage。
- 源码定位 → `author/tools/inspector/`。
- Inspector 动态注入的 `data-insp-target` 仅用于当前作者会话行号映射，禁止保存为正式 selector 或 For-AI selector。
- `<skill-root>/.env` 仅本机使用，不提交或分发。
