# 场景截图

## 适用范围

需要按显式场景批量生成纯页面截图，或验证 URL scene 对应组合业务状态时使用本入口。

## 前置契约

- snapshot 使用 `schemaVersion: 2`，并以 `scenarios` 对象显式声明截图清单和每个场景的组合 state。
- HTML 支持 `?scene=<id>`，由 `PrototypeViewers` 激活场景并通过业务 Adapter 恢复 DOM 状态。
- `?collapsed=1` 折叠右栏、SVG 连线、Mark 和交互闪电。
- 截图场景必须来自 `snapshot.scenarios`。
- 截图固定生成 `?scene=<id>&collapsed=1`。

## 命令

```bash
node <skill-root>/runtime/shoot.mjs <prototype.html>

# 可选参数。
node <skill-root>/runtime/shoot.mjs <prototype.html> --out=prototype-assets/screenshots --width=1440 --height=900
node <skill-root>/runtime/shoot.mjs <prototype.html> --browser="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
node <skill-root>/runtime/shoot.mjs <prototype.html> --snapshot=prototype-assets/notes.snapshot.js
```

脚本使用系统 Edge 或 Chrome，按 `scenarios` 的键串行截图到 `<原型目录>/prototype-assets/screenshots/<场景 id>.png`。

## 验收

- 每张截图展示对应业务状态，而不只是切换说明卡片。
- 截图中没有右侧说明、SVG 连线、Mark 面板或业务操作闪电。
- 场景 id 必须可安全作为文件名；若用户材料给出的名称不适合作为文件名，应先使用稳定中性标识。
- 任一组失败时保留其他已生成截图并返回失败状态，不把部分成功误报为全部完成。
