# 分组截图

## 适用范围

需要按正式标注组批量生成纯页面截图，或验证 URL state 对应视觉状态时使用本入口。

## 前置契约

- HTML 支持 `?state=<group>` 恢复对应业务 DOM 状态。
- Viewer 使用相同组名切换正式说明。
- `?collapsed=1` 折叠右栏、SVG 连线、Mark 和交互闪电。
- snapshot 的 `cards[].group` 是截图组来源；`common` 不单独截图。

## 命令

```bash
node <skill-root>/runtime/shoot.mjs <prototype.html>

# 可选参数。
node <skill-root>/runtime/shoot.mjs <prototype.html> --out=prototype-assets/screenshots --width=1440 --height=900
node <skill-root>/runtime/shoot.mjs <prototype.html> --browser="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
node <skill-root>/runtime/shoot.mjs <prototype.html> --snapshot=prototype-assets/notes.snapshot.js
```

脚本使用系统 Edge 或 Chrome，按每个非 `common` 组串行截图到 `<原型目录>/prototype-assets/screenshots/<组>.png`。

## 验收

- 每张截图展示对应业务状态，而不只是切换说明卡片。
- 截图中没有右侧说明、SVG 连线、Mark 面板或业务操作闪电。
- 组名可安全作为文件名；若用户材料给出的状态名不适合作为文件名，应先使用稳定中性标识。
- 任一组失败时保留其他已生成截图并返回失败状态，不把部分成功误报为全部完成。
