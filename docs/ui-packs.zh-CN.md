# UI packs — 给 Agent 搭的 HTML 原型一套稳定视觉

[English](ui-packs.md)

UI pack 是 `html-prototype-build` **消费**的可复用视觉系统（Token、组件、Pattern、Preset）。它不是 Skill 本身，不是生产组件库，也不是第三方设计系统实现。

这是能力线 **B**（安装 / 自定义 / 维护）。线 **A** 是原型协作闭环（[features](features.zh-CN.md)，[工作流](workflows.zh-CN.md)）。

## 为什么要 pack

没有 pack 时，Agent 每次自己编布局和颜色。产品语言没变，画面也会漂。Pack 提供共享 foundation，让笔记系统样例和下一张后台页可以像同一套系统。

官方 pack 是**原型用的视觉模拟**。用它们尽快落到可打开的 HTML。不要把它们当生产套件塞进应用。

## 官方 pack

本仓库 `.html-prototype/packs/` 里提供：

| Id | 什么时候用 |
| --- | --- |
| `admin-desktop` | 桌面后台：表单、表格、导航、看板图表。默认用于 [`examples/minimal-notes-system`](../examples/minimal-notes-system)。 |
| `mobile-vant` | 手机宽度 H5、Vant 风格模拟：触控热区、单元格、浮层。备选样例：[`examples/mobile-work-order`](../examples/mobile-work-order)。 |

摘要来自各 pack 的 `PACK.md` / registry。`admin-desktop` 在 pack 内带了 Apache ECharts（[NOTICE](../NOTICE)）；这仍不是对某套商业 UI 库版本的兼容承诺。

从**已安装**的 pack 里选（`resolve-pack --list`）。UI 类型不清楚就先问 — 不要悄悄默认（[目录](../skills/html-prototype-build/ui/catalog.md)）。

## 安装

终端用户默认装到家目录缓存：

```bash
node <skill-root>/scripts/install-pack.mjs --pack=admin-desktop
```

`--list-remote`、`--dest=project`、`--dry-run`、覆盖保护和环境变量见 [pack 安装](../skills/html-prototype-build/references/pack-install.md)。`html-prototype-build` 里只有 `install-pack.mjs` 会访问网络。

缺 pack 是需要用户操作的状态。不要手写一套假组件库来“先生成着”。

## 和 `.html-prototype/packs` 的关系

| 角色 | 默认位置 | Git |
| --- | --- | --- |
| 终端用户（下载或自制） | `~/.html-prototype/packs/<id>/` | 否 |
| 本仓库的项目 / 官方 pack | `<repo>/.html-prototype/packs/<id>/` | 是；`registry.json` 的源 |

解析顺序优先项目 pack，再用户缓存，以及其他覆盖项，见[目录](../skills/html-prototype-build/ui/catalog.md)。下载的 pack 会写 `.pack-source.json`。手写 pack 不要加这个文件；pack 根目录要有 `manifest.json`。

自制 id 应加命名空间（`mycompany-admin`），避免盖住 `admin-desktop` 或 `mobile-vant`。

## 何时换 pack，何时自定义

| 情况 | 做法 |
| --- | --- |
| 桌面后台 vs 手机 H5（或材料点名了另一个已安装 pack） | **换** pack id，再生成 |
| 官方模拟不是你的视觉语言，但仍要 Agent 出 HTML | **自定义**或编写 pack，再重新生成原型 |
| 生产 UI 套件已经定稿，你要的是应用代码 | 用那套套件 — 不要用本 Skill |

自定义 / 维护的产品文档仍在计划中：[自定义 pack](ui-pack-customize.zh-CN.md)、[维护 pack](ui-pack-maintain.zh-CN.md)。在写成之前，跟下面的 pack Skill 走。

## 分工

| `html-prototype-build` 负责 | `ui-pack-maintain` 负责 |
| --- | --- |
| 查找链、`install-pack.mjs`、`deliver[]` 拷出、生成原型 | Pack 契约、`schemaVersion`、`validate-pack.mjs`、生成 registry |
| 消费侧 `resolve-pack.mjs`（`--list` / `--select`） | Pack 内 `resolve-pack.mjs`（`--pack=<dir> --entry=`） |
| 页面协作闭环（Viewer、Mark、Direct Edit、Inspector、scenarios） | Pack 生命周期：创建 → 校验 → 版本 → 发布 |

不要用 `ui-pack-maintain` 生成业务原型或给终端用户装 pack。不要用 `html-prototype-build` 发明 pack 契约或 registry 格式。

编写 Skill：[`skills/ui-pack-maintain/SKILL.md`](../skills/ui-pack-maintain/SKILL.md)。落地路径：[pack 编写](../skills/ui-pack-maintain/references/pack-authoring.md)。

## 接下来

- 消费侧安装协议 → [pack 安装](../skills/html-prototype-build/references/pack-install.md)
- 有 pack 之后的第一页 → [quickstart](quickstart.zh-CN.md)
- 换 pack 之后重新生成 → [工作流](workflows.zh-CN.md#5-可选自定义-pack-再重新生成)
- 对比生产组件库 → [对比](comparison.zh-CN.md)
