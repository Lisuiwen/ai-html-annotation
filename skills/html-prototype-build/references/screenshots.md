# 场景截图

## 适用范围

需要按显式场景批量生成纯页面截图，或验证 URL scene 对应组合业务状态时使用本入口。

实现位于 `runtime/cli/screenshot.mjs`。

## 命令

```bash
node <skill-root>/runtime/cli/screenshot.mjs <prototype.html> --snapshot=prototype/notes.snapshot.js
```

工具按 `snapshot.scenarios` 生成 `screenshots/<scene-id>.png`，截图 URL 自动带 `collapsed=1&product-only=1`，隐藏说明和作者 UI。

## Agent 前置契约

- snapshot 使用 `schemaVersion: 2`，并以 `scenarios` 对象显式声明截图清单和每个场景的组合 state。
- HTML 支持 `?scene=<id>`，由 `PrototypeViewers` 激活场景并通过业务 Adapter 恢复 DOM 状态。
- 截图固定附加 `collapsed=1&product-only=1`，隐藏右栏、SVG 连线、Mark 和作者 UI。
- 截图场景必须来自 `snapshot.scenarios`；场景 id 须可安全作为文件名。
- 任一组失败时保留其他已生成截图并返回失败状态，不把部分成功误报为全部完成。
