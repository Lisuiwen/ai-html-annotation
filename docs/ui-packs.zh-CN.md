# UI 包 — 给 Agent 搭的 HTML 原型一套稳定视觉

[English](ui-packs.md)

UI 包是原型生成**消费**的可复用视觉系统（Token、组件、Pattern、Preset）。它不是 Skill 本身，不是生产组件库，也不是第三方设计系统实现。

协作闭环（标注、作者工具、复制给 AI、多状态截图）在[产品指南](guide.zh-CN.md)。本页只讲安装 / 换包 / 自定义。

## 为什么要 UI 包

没有 UI 包时，Agent 每次自己编布局和颜色。产品语言没变，画面也会漂。UI 包提供共享 foundation，让笔记系统样例和下一张后台页可以像同一套系统。

官方包是**原型用的视觉模拟**。用它们尽快落到可打开的 HTML。不要把它们当生产套件塞进应用。

## 官方 UI 包

| Id | 什么时候用 |
| --- | --- |
| `admin-desktop` | 桌面后台：表单、表格、导航、看板图表。默认用于 [`examples/minimal-notes-system`](../examples/minimal-notes-system)。 |
| `mobile-vant` | 手机宽度 H5、Vant 风格模拟：触控热区、单元格、浮层。备选样例：[`examples/mobile-work-order`](../examples/mobile-work-order)。 |

`admin-desktop` 在包内带了 Apache ECharts（[NOTICE](../NOTICE)）；这仍不是对某套商业 UI 库版本的兼容承诺。

从**已安装**的包里选。UI 类型不清楚就先问 — 不要悄悄默认。

## 安装

终端用户默认装到家目录缓存 `~/.html-prototype/packs/<id>/`。让 Agent 安装 `admin-desktop` 或 `mobile-vant`。

缺包是需要用户操作的状态。不要手写一套假组件库来“先生成着”。

| 角色 | 默认位置 | Git |
| --- | --- | --- |
| 终端用户（下载或自制） | `~/.html-prototype/packs/<id>/` | 否 |
| 本仓库的项目 / 官方包 | `<repo>/.html-prototype/packs/<id>/` | 是 |

项目包优先于用户缓存。自制 id 应加命名空间（`mycompany-admin`），避免盖住 `admin-desktop` 或 `mobile-vant`。

## 何时换包，何时自定义

| 情况 | 做法 |
| --- | --- |
| 桌面后台 vs 手机 H5（或材料点名了另一个已安装包） | **换**包 id，再生成 |
| 官方模拟不是你的视觉语言，但仍要 Agent 出 HTML | **自定义**或编写 UI 包，再重新生成原型 |
| 生产 UI 套件已经定稿，你要的是应用代码 | 用那套套件 — 不要用本 Skill |

自定义 / 维护的产品文档仍在计划中：[自定义 pack](ui-pack-customize.zh-CN.md)、[维护 pack](ui-pack-maintain.zh-CN.md)。在写成之前，跟 pack 编写 Skill 走。

原型生成消费 UI 包。写包是另一套 Skill。不要用写包去生成业务页面，也不要用原型生成去发明包契约。

## 接下来

- 有 UI 包之后的第一页 → [quickstart](quickstart.zh-CN.md)
- 换包之后重新生成 → [产品指南](guide.zh-CN.md#端到端步骤)
- 对比生产组件库 → [对比](comparison.zh-CN.md)

## 进阶

```bash
node <skill-root>/scripts/install-pack.mjs --pack=admin-desktop
```

参数、覆盖保护和 `--dest=project`：[Pack install](../skills/html-prototype-build/references/pack-install.md)。消费侧目录：[catalog](../skills/html-prototype-build/ui/catalog.md)。包契约与 registry：[ui-pack-maintain](../skills/ui-pack-maintain/SKILL.md)。落地路径：[Pack 编写](../skills/ui-pack-maintain/references/pack-authoring.md)。
