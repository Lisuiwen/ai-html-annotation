/*
 * 车型维护原型的正式标注唯一数据源。
 * 场景仅表达截图已确认的列表、新增与编辑状态。
 */
window.__PROTOTYPE_NOTES__ = {
  "schemaVersion": 2,
  "state": {
    "product": { "layer": "list" }
  },
  "activeScenario": "list",
  "scenarios": {
    "list": { "state": {} },
    "create": { "extends": "list", "state": { "product": { "layer": "create" } } },
    "edit": { "extends": "list", "state": { "product": { "layer": "edit" } } }
  },
  "header": {
    "title": "功能说明",
    "subtitle": "车系车型维护：列表、新增与编辑场景"
  },
  "cards": [
    {
      "id": "car-tree",
      "when": { "product.layer": "list" },
      "title": "车系车型树",
      "body": "左侧展示车系及其 LEVEL 层级；当前原型仅呈现截图中的展开结构。",
      "target": { "anchor": "carTree", "label": "车系车型树" }
    },
    {
      "id": "model-query",
      "when": { "product.layer": "list" },
      "title": "配置筛选",
      "body": "可按配置名称与配置编码筛选；查询与重置操作保持当前列表视图。",
      "target": { "anchor": "modelQuery", "label": "查询条件" }
    },
    {
      "id": "model-create",
      "when": { "product.layer": "list" },
      "title": "新增车型",
      "body": "点击新建打开车型维护弹窗；本次迭代的业务入口以闪电标识。",
      "target": { "anchor": "createModel", "label": "新建" }
    },
    {
      "id": "model-table",
      "when": { "product.layer": "list" },
      "title": "配置清单",
      "body": "清单展示配置名称、编码、状态、协议、所属 LEVEL 与设备数量，并提供编辑、删除、移动入口。",
      "target": { "anchor": "modelTable", "label": "配置清单" }
    },
    {
      "id": "create-fields",
      "when": { "product.layer": "create" },
      "title": "新增车型字段",
      "body": "维护车系架构、座舱芯片、智驾方案与芯片型号、前后悬架类型，以及续航、能耗和扬声器数量。",
      "target": { "anchor": "vehicleForm", "label": "车型信息表单" }
    },
    {
      "id": "form-hint",
      "when": { "product.layer": "create" },
      "title": "LEVEL 配置说明",
      "body": "默认继承 LEVEL 的配置；也可自行设置，设置后以设置值为准；更新后以 LEVEL 最新值为准。",
      "target": { "anchor": "levelHint", "label": "配置说明" }
    },
    {
      "id": "edit-fields",
      "when": { "product.layer": "edit" },
      "title": "编辑车型",
      "body": "编辑场景回显当前车型信息，提交后返回列表；仅演示界面与场景切换，不连接真实数据。",
      "target": { "anchor": "vehicleForm", "label": "编辑车型表单" }
    }
  ]
};
