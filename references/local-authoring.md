# 本地作者服务

## 适用范围

需要在浏览器中编辑正式说明、增删或排序卡片、重新绑定目标，或者使用 Inspector 跳转源码时使用本入口。

作者服务只绑定本机并动态加载工具，不修改原型源 HTML。

## 启动命令

```bash
# 只读运行作者工具，不启用 snapshot 写回。
node <skill-root>/runtime/serve.mjs <prototype.html> [--port=4178]

# 启用正式说明数据写回。
node <skill-root>/runtime/serve.mjs <prototype.html> --snapshot=prototype.notes.snapshot.js
```

打开 `http://127.0.0.1:4178/<prototype.html>`。

## 工具边界

- `author-loader.js`：协调 Editor、html-mark 和 Inspector 的互斥模式。
- `editor.js`：编辑 snapshot 中的说明卡片和稳定 selector；未配置 `--snapshot` 时保存会被拒绝。
- `html-mark.js`：临时评审 pin，保存到 localStorage，不写入 snapshot。
- `inspector.js`：`Alt+Shift` 悬停并点击源码目标。
- `author-chrome.js`：统一作者 overlay 和纯页面截图态边界。

## Inspector

`serve.mjs` 仅在响应 HTML 时动态注入短 token `data-insp-target="iXX"`。token 只用于当前作者会话的源码行号映射，禁止保存为正式 selector 或 For-AI selector。

复制 `../runtime/.env.example` 为同目录 `.env` 可指定 IDE：

```bash
CODE_EDITOR=cursor
# CODE_EDITOR=D:\Apps\CodeBuddy\CodeBuddy.exe
```

未配置时依次回退 `cursor` → `code`；`.env` 仅本机使用，不提交或分发。

## 浏览器操作

1. 按住 `Alt+Shift` 进入 Inspector。
2. 悬停查看标签、CSS 路径和短 token。
3. 点击后，服务实时重读源文件并重算 token 对应行号。
4. IDE 打开对应文件和行号；源文件编辑后无需维护静态行号。
