# 交付与迭代

## 适用范围

需要整理最终文件、区分评审稿与正式交付稿，或根据反馈继续迭代时使用本入口。

## 两种交付状态

### 评审稿

- 保留 `runtime/prepare-mark.mjs --inline` 生成的 html-mark 注入块。
- 可双击打开并继续打 pin。
- 正式产品说明仍来自 snapshot + Viewer，评审 pin 只存在于浏览器 localStorage。

### 正式交付稿

- 运行 `node <skill-root>/runtime/prepare-mark.mjs <prototype.html> --remove`。
- HTML 中不得存在 Author Loader、Editor、html-mark、Inspector 或源码定位 token。
- 需要正式产品说明时只交付：

```text
prototype.html
prototype-assets/
├─ notes.snapshot.js
├─ viewer.js
└─ screenshots/    # 需要交付验收截图时保留
```

- 外层只保留 HTML，其他正式配套资源均收进 `prototype-assets/`；不要再创建额外层级或在外层散落 snapshot、Viewer、截图。
- 无正式产品说明时默认只交付单文件 HTML。

## 迭代分流

- 结构、布局、菜单或业务状态大改：返回 [ui-generation.md](ui-generation.md)。
- 正式说明内容、顺序或目标变化：使用 [local-authoring.md](local-authoring.md)。
- 仅有评审文字反馈：按 [review-mark.md](review-mark.md) 的 For AI 数据修改源 HTML。
- 视觉状态变化后需要重新验收：运行 [screenshots.md](screenshots.md)。
