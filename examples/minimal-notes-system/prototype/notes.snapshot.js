/* Canonical prototype annotation data source; maintained by the prototype-author editor. */
window.__PROTOTYPE_NOTES__ = {
  "schemaVersion": 2,
  "state": {
    "product": {
      "page": "list",
      "layers": [],
      "selects": {
        "strategyName": {
          "open": false,
          "value": ""
        },
        "strategyCondition": {
          "open": false,
          "value": ""
        }
      }
    }
  },
  "activeScenario": "base",
  "scenarios": {
    "base": {
      "label": "List",
      "state": {}
    },
    "create": {
      "label": "Create",
      "extends": "base",
      "state": {
        "product": {
          "layers": [
            "create"
          ]
        }
      }
    },
    "edit": {
      "label": "Edit",
      "extends": "base",
      "state": {
        "product": {
          "layers": [
            "edit"
          ]
        }
      }
    },
    "strategy": {
      "label": "Link",
      "extends": "base",
      "state": {
        "product": {
          "layers": [
            "strategy"
          ]
        }
      }
    }
  },
  "header": {
    "title": "Function Notes",
    "subtitle": "Shown for list, create, edit and task-linking states"
  },
  "cards": [
    {
      "id": "note-7",
      "title": "New note",
      "body": "Filter by query",
      "target": {
        "anchor": "filterCode",
        "label": "Configuration item code"
      },
      "when": {
        "product.layers": [],
        "product.page": "list"
      }
    },
    {
      "id": "filter-area",
      "when": {
        "product.page": "list",
        "product.layers": []
      },
      "title": "Configuration item search",
      "body": "Filter by configuration item name or code; Reset clears the current filters, Search refreshes the list.",
      "target": {
        "anchor": "filterArea",
        "label": "Configuration item search"
      }
    },
    {
      "id": "table-area",
      "when": {
        "product.page": "list",
        "product.layers": []
      },
      "title": "Maintenance list",
      "body": "The list shows name, code, description, creator and creation time, with edit and delete actions.",
      "target": {
        "anchor": "tableArea",
        "label": "Configuration item list"
      }
    },
    {
      "id": "create-form",
      "when": {
        "product.page": "list",
        "product.layers": [
          "create"
        ]
      },
      "title": "Create fields",
      "body": "Name and code are limited to 36 characters; submitting creates a new configuration item.",
      "target": {
        "anchor": "createForm",
        "label": "New configuration item form"
      }
    },
    {
      "id": "edit-form",
      "when": {
        "product.page": "list",
        "product.layers": [
          "edit"
        ]
      },
      "title": "Edit fields",
      "body": "Editing pre-fills the existing name, code and description; confirm to save the changes.",
      "target": {
        "anchor": "editForm",
        "label": "Edit configuration item form"
      }
    },
    {
      "id": "strategy-name",
      "when": {
        "product.page": "list",
        "product.layers": [
          "strategy"
        ]
      },
      "title": "Link configuration item to task",
      "body": "When creating a configuration item from a project task, the name is no longer free-text; it becomes a dropdown of names from the configuration item maintenance list.",
      "target": {
        "anchor": "strategyNameField",
        "label": "Task configuration item name select"
      }
    },
    {
      "id": "menu-config",
      "when": {
        "product.page": "list",
        "product.layers": []
      },
      "title": "New menu entry",
      "body": "Add a Configuration Items menu under System Settings to enter the unified maintenance list.",
      "target": {
        "anchor": "menuConfig",
        "label": "Configuration Items"
      }
    }
  ]
};
