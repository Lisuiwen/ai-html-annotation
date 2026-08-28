/*
 * 原型正式标注唯一数据源；由 prototype-author 编辑器维护。
 * schema v2 的顶层 state 是业务唯一状态源，scenarios 保存可恢复差异，cards 使用 when 与稳定 id 锚点。
 * 赋值右侧保持严格 JSON，便于作者服务、截图器和测试安全解析。
 */
window.__PROTOTYPE_NOTES__ = {
  "schemaVersion": 2,
  "state": {
    "product": {
      "layer": "base",
      "selects": {
        "strategyName": { "open": false, "value": "" },
        "strategyCondition": { "open": false, "value": "" }
      }
    }
  },
  "activeScenario": "base",
  "scenarios": {
    "base": { "state": {} },
    "create": {
      "extends": "base",
      "state": { "product": { "layer": "create" } }
    },
    "edit": {
      "extends": "base",
      "state": { "product": { "layer": "edit" } }
    },
    "strategy": {
      "extends": "base",
      "state": { "product": { "layer": "strategy" } }
    }
  },
  "header": {
    "title": "功能说明",
    "subtitle": "按列表、新建、编辑与任务关联状态展示"
  },
  "cards": [
    {
      "id": "filter-area",
      "when": { "product.layer": "base" },
      "title": "配置项查询",
      "body": "可按配置项名称、编码筛选；重置清空当前筛选值，查询刷新列表结果。",
      "target": {
        "anchor": "queryButton",
        "label": "查询"
      }
    },
    {
      "id": "create-action",
      "when": { "product.layer": "base" },
      "title": "新建配置项",
      "body": "点击“新建配置项”打开维护弹窗，名称和编码为必填项，描述可选。",
      "target": {
        "anchor": "createButton",
        "label": "新建按钮"
      }
    },
    {
      "id": "table-area",
      "when": { "product.layer": "base" },
      "title": "维护列表",
      "body": "列表展示名称、编码、描述、创建者和创建时间，并提供编辑、删除操作。",
      "target": {
        "anchor": "tableArea",
        "label": "配置项列表"
      }
    },
    {
      "id": "menu-config",
      "when": { "product.layer": "base" },
      "title": "新增菜单入口",
      "body": "在系统设置下增加“配置项”菜单，进入统一维护列表。",
      "target": {
        "anchor": "menuConfig",
        "label": "配置项"
      }
    },
    {
      "id": "create-form",
      "when": { "product.layer": "create" },
      "title": "新建字段",
      "body": "名称、编码限制不超过 36 个字符；提交后新增配置项。",
      "target": {
        "anchor": "createForm",
        "label": "新建配置项表单"
      }
    },
    {
      "id": "edit-form",
      "when": { "product.layer": "edit" },
      "title": "编辑字段",
      "body": "编辑时回显已有名称、编码和描述，确认后保存修改。",
      "target": {
        "anchor": "editForm",
        "label": "编辑配置项表单"
      }
    },
    {
      "id": "strategy-name",
      "when": { "product.layer": "strategy" },
      "title": "任务关联配置项",
      "body": "项目任务新建配置项时，名称不再自由输入，改为下拉选择配置项维护列表中的名称。",
      "target": {
        "anchor": "strategyNameField",
        "label": "任务配置项名称选择"
      }
    }
  ]
};
