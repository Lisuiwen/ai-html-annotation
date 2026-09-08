# 交付与迭代

## 适用范围

需要整理最终文件、区分作者会话与正式交付稿，或根据反馈继续迭代时使用本入口。

## 作者 / 评审 vs 正式交付稿

| 范围 | 规则 |
|------|------|
| 作者 / 评审会话 | Author Tools 由 `runtime/server/index.mjs` 动态注入；Direct Edit、Mark、Notes Editor、Inspector 均不写入正式 HTML。Direct Edit 经服务端写回源 HTML；Mark pin 只存在于浏览器 localStorage。 |
| 正式交付稿 | HTML 不得含 Author Bootstrap、Direct Edit、Notes Editor、Inspector、源码定位 token 或内联标注编辑脚本。正式说明只来自 snapshot + Client Runtime。 |

正式文件结构与 runtime 复制规则见 [generation-contract.md §7](generation-contract.md#7-交付文件)。交付前按 [交付复检清单](delivery-checklist.md) 逐项核对。

## 迭代分流

- 结构、布局、菜单或业务状态大改：[ui-generation.md](ui-generation.md)。
- 正式说明内容、顺序或目标变化：[local-authoring.md](local-authoring.md)。
- 样式或文案微调并写回源 HTML：Direct Edit（[local-authoring.md](local-authoring.md)）。
- 评审文字反馈：[review-mark.md](review-mark.md) 导出 For AI 后修改源 HTML。
- 视觉状态变化后重新验收：[screenshots.md](screenshots.md)。
