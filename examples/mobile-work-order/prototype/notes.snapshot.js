/* Canonical prototype annotation data source; maintained by the prototype-author editor. */
window.__PROTOTYPE_NOTES__ = {
  "schemaVersion": 2,
  "state": {
    "product": {
      "page": "list",
      "form": {
        "title": "",
        "description": "",
        "priority": "Normal",
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
      "label": "List",
      "state": {
        "product": {
          "page": "list",
          "form": {
            "title": "",
            "description": "",
            "priority": "Normal",
            "urgent": false
          }
        }
      }
    },
    "form": {
      "label": "New",
      "extends": "list",
      "state": {
        "product": {
          "page": "form"
        }
      }
    },
    "form-filled": {
      "label": "Editing",
      "extends": "form",
      "state": {
        "product": {
          "form": {
            "title": "Projector no signal",
            "description": "No signal after restart",
            "priority": "High",
            "urgent": true
          }
        }
      }
    },
    "dialog-open": {
      "label": "Confirm",
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
    "title": "Function Notes",
    "subtitle": "Mobile work order list and create flow"
  },
  "cards": [
    {
      "id": "order-list",
      "when": {
        "product.page": "list"
      },
      "title": "Work order list",
      "body": "Orders are sorted by time; status tags show Pending, In progress, or Completed.",
      "target": {
        "anchor": "orderTitle1",
        "label": "Work order list"
      }
    },
    {
      "id": "nav-new",
      "when": {
        "product.page": "list"
      },
      "title": "New entry",
      "body": "Tap New in the top-right to open the create form.",
      "target": {
        "anchor": "navNew",
        "label": "New work order entry"
      }
    },
    {
      "id": "form-title",
      "when": {
        "product.page": "form"
      },
      "title": "Title field",
      "body": "Required; submit shows an error when empty.",
      "target": {
        "anchor": "formTitle",
        "label": "Work order title input"
      }
    },
    {
      "id": "form-description",
      "when": {
        "product.page": "form"
      },
      "title": "Description field",
      "body": "Required; describe the issue before submitting.",
      "target": {
        "anchor": "formDescription",
        "label": "Description input"
      }
    },
    {
      "id": "priority-cell",
      "when": {
        "product.page": "form"
      },
      "title": "Priority",
      "body": "Tap to cycle Normal / High / Urgent; the current value appears on the right.",
      "target": {
        "anchor": "priorityCell",
        "label": "Priority selector"
      }
    },
    {
      "id": "urgent-switch",
      "when": {
        "product.page": "form"
      },
      "title": "Expedite toggle",
      "body": "When on, the order is marked for expedited handling.",
      "target": {
        "anchor": "urgentSwitch",
        "label": "Expedite switch"
      }
    },
    {
      "id": "submit-button",
      "when": {
        "product.page": "form"
      },
      "title": "Submit",
      "body": "Validates required fields, then opens a confirm dialog; confirm returns to the list.",
      "target": {
        "anchor": "submitButton",
        "label": "Submit button"
      }
    },
    {
      "id": "submit-dialog",
      "when": {
        "product.page": "form",
        "product.dialog.visible": true
      },
      "title": "Confirm dialog",
      "body": "Second confirmation before submit; Cancel closes, Confirm submits and returns to the list.",
      "target": {
        "anchor": "submitDialogTitle",
        "label": "Confirm dialog"
      }
    }
  ]
};
