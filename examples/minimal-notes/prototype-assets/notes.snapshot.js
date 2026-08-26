/* 原型正式标注唯一数据源；由 prototype-author 编辑器维护。 */
window.__PROTOTYPE_NOTES__ = {
  "schemaVersion": 1,
  "activeGroup": "base",
  "header": {
    "title": "功能说明",
    "subtitle": "按列表、新建、编辑与任务关联状态展示"
  },
  "overview": {
    "title": "配置项统一维护",
    "body": "在系统设置下新增配置项维护入口，支持查询、新建、编辑和删除；项目任务的新建配置项名称改为从已维护配置项中选择。"
  },
  "cards": [
    {
      "id": "filter-area",
      "group": "base",
      "title": "配置项查询",
      "body": "可按配置项名称、编码筛选；重置清空当前筛选值，查询刷新列表结果。",
      "target": {
        "selector": "#queryButton",
        "label": "查询"
      }
    },
    {
      "id": "create-action",
      "group": "base",
      "title": "新建配置项",
      "body": "点击“新建配置项”打开维护弹窗，名称和编码为必填项，描述可选。",
      "target": {
        "selector": "[data-prototype-note-target=\"create-action\"]",
        "label": "新建按钮"
      }
    },
    {
      "id": "table-area",
      "group": "base",
      "title": "维护列表",
      "body": "列表展示名称、编码、描述、创建者和创建时间，并提供编辑、删除操作。",
      "target": {
        "selector": "[data-prototype-note-target=\"table-area\"]",
        "label": "配置项列表"
      }
    },
    {
      "id": "menu-config",
      "group": "base",
      "title": "新增菜单入口",
      "body": "在系统设置下增加“配置项”菜单，进入统一维护列表。",
      "target": {
        "selector": "[data-prototype-note-target=\"menu-config\"]",
        "label": "配置项"
      }
    },
    {
      "id": "create-form",
      "group": "create",
      "title": "新建字段",
      "body": "名称、编码限制不超过 36 个字符；提交后新增配置项。",
      "target": {
        "selector": "[data-prototype-note-target=\"create-form\"]",
        "label": "新建配置项表单"
      }
    },
    {
      "id": "edit-form",
      "group": "edit",
      "title": "编辑字段",
      "body": "编辑时回显已有名称、编码和描述，确认后保存修改。",
      "target": {
        "selector": "[data-prototype-note-target=\"edit-form\"]",
        "label": "编辑配置项表单"
      }
    },
    {
      "id": "strategy-name",
      "group": "strategy",
      "title": "任务关联配置项",
      "body": "项目任务新建配置项时，名称不再自由输入，改为下拉选择配置项维护列表中的名称。",
      "target": {
        "selector": "[data-prototype-note-target=\"strategy-name\"]",
        "label": "任务配置项名称选择"
      }
    }
  ]
};
