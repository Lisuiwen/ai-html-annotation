# 本地作者服务

## 适用范围

需要在浏览器中编辑正式说明、增删或排序卡片、重新绑定目标，或者使用 Inspector 跳转源码时使用本入口。

作者服务只绑定本机并动态加载工具，不修改原型源 HTML。

## 启动命令

```bash
# 只读运行作者工具，不启用 snapshot 写回。
node <skill-root>/runtime/serve.mjs <prototype.html> [--port=4178]

# 启用正式说明数据写回。
node <skill-root>/runtime/serve.mjs <prototype.html> --snapshot=prototype-assets/notes.snapshot.js
```

打开 `http://127.0.0.1:4178/<prototype.html>`。

## 工具边界

- 编辑说明卡片 / 稳定 selector → 使用 Editor；未配置 `--snapshot` 时保存会被拒绝。
- 临时评审 pin → 使用 html-mark，保存到 localStorage，不写入 snapshot。
- 跳转源码 → 使用 Inspector（`Alt+Shift` 悬停并点击）。

## Inspector

`serve.mjs` 仅在响应 HTML 时动态注入短 token `data-insp-target="iXX"`。token 只用于当前作者会话的源码行号映射，禁止保存为正式 selector 或 For-AI selector。

复制 `../runtime/.env.example` 为同目录 `.env` 可指定 IDE：

```bash
CODE_EDITOR=cursor
# CODE_EDITOR=D:\Apps\CodeBuddy\CodeBuddy.exe
```

未配置时依次回退 `cursor` → `code`；`.env` 仅本机使用，不提交或分发。

