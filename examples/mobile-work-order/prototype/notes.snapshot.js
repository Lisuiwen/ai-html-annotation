/* Canonical prototype annotation data source; maintained by the prototype-author editor. */
window.__PROTOTYPE_NOTES__ = {
  "schemaVersion": 2,
  "state": {
    "product": {
      "page": "list",
      "form": {
        "title": "",
        "description": "",
        "priority": "普通",
        "urgent": false,
        "errors": {
          "title": "",
          "description": ""
        }
      },
      "dialog": {
        "visible": false,
        "confirm": false
      },
      "toast": {
        "visible": false,
        "message": "",
        "type": "text"
      }
    }
  },
  "activeScenario": "list",
  "scenarios": {
    "list": {
      "label": "工单列表",
      "state": {
        "product": {
          "page": "list",
          "form": {
            "title": "",
            "description": "",
            "priority": "普通",
            "urgent": false
          }
        }
      }
    },
    "form": {
      "label": "新建工单",
      "extends": "list",
      "state": {
        "product": {
          "page": "form"
        }
      }
    },
    "form-filled": {
      "label": "填写中",
      "extends": "form",
      "state": {
        "product": {
          "form": {
            "title": "会议室投影仪故障",
            "description": "连接后无信号，已尝试重启",
            "priority": "紧急",
            "urgent": true
          }
        }
      }
    },
    "dialog-open": {
      "label": "确认弹窗",
      "extends": "form-filled",
      "state": {
        "product": {
          "dialog": {
            "visible": true,
            "confirm": false
          }
        }
      }
    }
  },
  "header": {
    "title": "功能说明",
    "subtitle": "移动端工单列表与新建工单流程"
  },
  "cards": [
    {
      "id": "order-list",
      "when": {
        "product.page": "list"
      },
      "title": "工单列表",
      "body": "列表按时间倒序展示工单，右侧标签标识处理状态（待处理/处理中/已完成）。",
      "target": {
        "anchor": "orderTitle1",
        "label": "工单列表"
      }
    },
    {
      "id": "nav-new",
      "when": {
        "product.page": "list"
      },
      "title": "新建入口",
      "body": "点击右上角「新建」进入新建工单页。",
      "target": {
        "anchor": "navNew",
        "label": "新建工单入口"
      }
    },
    {
      "id": "form-title",
      "when": {
        "product.page": "form"
      },
      "title": "工单标题",
      "body": "必填项，用于描述工单主题；留空提交时会提示错误。",
      "target": {
        "anchor": "formTitle",
        "label": "工单标题输入"
      }
    },
    {
      "id": "form-description",
      "when": {
        "product.page": "form"
      },
      "title": "问题描述",
      "body": "选填，补充问题现象；留空时仅提交标题。",
      "target": {
        "anchor": "formDescription",
        "label": "问题描述输入"
      }
    },
    {
      "id": "priority-cell",
      "when": {
        "product.page": "form"
      },
      "title": "紧急程度",
      "body": "点击循环切换 普通 / 紧急 / 加急，当前值显示在行右侧。",
      "target": {
        "anchor": "priorityCell",
        "label": "紧急程度切换"
      }
    },
    {
      "id": "urgent-switch",
      "when": {
        "product.page": "form"
      },
      "title": "加急开关",
      "body": "开启后该工单将标记为加急，优先处理。",
      "target": {
        "anchor": "urgentSwitch",
        "label": "加急处理开关"
      }
    },
    {
      "id": "submit-button",
      "when": {
        "product.page": "form"
      },
      "title": "提交工单",
      "body": "校验必填项；通过后弹出确认对话框，确认即提交并返回列表。",
      "target": {
        "anchor": "submitButton",
        "label": "提交工单按钮"
      }
    },
    {
      "id": "submit-dialog",
      "when": {
        "product.page": "form",
        "product.dialog.visible": true
      },
      "title": "提交确认",
      "body": "确认对话框用于二次确认；确认后提交并返回列表，取消则关闭。",
      "target": {
        "anchor": "submitDialogTitle",
        "label": "提交确认对话框"
      }
    }
  ]
};
