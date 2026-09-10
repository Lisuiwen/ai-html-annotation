---
id: data.data-table
category: data
requires: []
optional: [action.button, data.tag]
states:
  confirmed: [data]
  provisional: [hover, empty, loading, row-selection]
---

# Data Table

Table with data, empty state, loading state, and optional row selection. Data, empty, and loading states belong to the same component lifecycle and must not be split into separate components; columns, data, and state triggers must come from the current requirements.

## State Adapter

`state-adapter.js` exposes `window.PrototypeUiAdapters['data.data-table']`; local state is `{ status: 'data' | 'empty' | 'loading', selection?: { selectedKeys: string[], allSelected: boolean, indeterminate: boolean } }`, and a status value may also be passed directly. The final prototype submits business state; the component Adapter only switches visible regions, projects the given selection column, and notifies connectors to redraw.

<!-- ponytail: Current selection support only projects the page-supplied selected set; cross-page selection, select-all computation, batch actions, and event binding must be implemented by the business state Adapter. -->
