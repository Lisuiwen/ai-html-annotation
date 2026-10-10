/* Axis and seed size for admin-desktop stamps. Unlisted components use DEFAULT. */

export const FRAME = { width: 1440, height: 900 };

const DEFAULT = {
  axis: 'both',
  width: 240,
  height: null,
  minWidth: 80,
  minHeight: 40
};

function chart(height, minHeight = 160) {
  return { axis: 'both', width: 480, height, minWidth: 160, minHeight, chart: true };
}

/** @type {Record<string, object>} */
export const SIZING = {
  'action.button': { axis: 'none' },
  'data.tag': { axis: 'none' },
  'data.avatar': { axis: 'none' },
  'form.switch': { axis: 'none' },
  'form.radio-group': { axis: 'none' },
  'form.checkbox-group': { axis: 'none' },

  'form.input': { axis: 'x', width: 240, minWidth: 240, minHeight: 32 },
  'form.field': { axis: 'x', width: 240, minWidth: 240, minHeight: 32 },
  'form.select': { axis: 'x', width: 214, minWidth: 214, minHeight: 32 },
  'form.search': { axis: 'x', width: 269, minWidth: 269, minHeight: 32 },
  'form.date-picker': { axis: 'x', width: 160, minWidth: 160, minHeight: 32 },
  'form.date-range-picker': { axis: 'x', width: 260, minWidth: 260, minHeight: 32 },
  'feedback.progress': { axis: 'x', width: 240, minWidth: 240, minHeight: 16 },
  'navigation.tabs': { axis: 'x', width: 360, minWidth: 360, minHeight: 40 },
  'navigation.breadcrumb': { axis: 'x', width: 360, minWidth: 360, minHeight: 22 },
  'navigation.steps': { axis: 'x', width: 480, minWidth: 480, minHeight: 24 },
  'navigation.app-header': { axis: 'x', width: 'frame', height: 64, minWidth: 320, minHeight: 64, lockHeight: true },
  'data.toolbar': { axis: 'x', width: 'frame', height: 44, minWidth: 240, minHeight: 44, lockHeight: true },

  'navigation.sider-menu': { axis: 'y', width: 224, height: null, minWidth: 224, minHeight: 80, lockWidth: true },
  'feedback.drawer': { axis: 'y', width: 420, height: 480, minWidth: 420, minHeight: 160, lockWidth: true },

  'data.filter-bar': { axis: 'x', width: 720, height: 102, minWidth: 240, minHeight: 102, lockHeight: true },
  'data.card': { axis: 'both', width: 320, height: null, minWidth: 160, minHeight: 80 },
  'data.data-table': { axis: 'both', width: 680, height: 160, minWidth: 680, minHeight: 160 },
  'feedback.modal': { axis: 'both', width: 520, height: null, minWidth: 280, minHeight: 120 },
  'data.chart-line': chart(240),
  'data.chart-bar': chart(240),
  'data.chart-donut': chart(240),
  'data.chart-mixed': chart(240),
  'data.chart-gauge': chart(240),
  'data.chart-funnel': chart(280),
  'data.chart-heatmap': chart(280),
  'data.chart-map': chart(360, 200)
};

export function resolveSizing(source) {
  let extra = {};
  if (typeof source === 'string') extra = SIZING[source] || {};
  else if (source && source.sizing) extra = source.sizing;
  else if (source && source.sizingKey) extra = SIZING[source.sizingKey] || {};
  const spec = Object.assign({}, DEFAULT, extra);
  if (spec.width === 'frame') spec.width = FRAME.width;
  if (spec.axis === 'none') {
    spec.width = null;
    spec.height = null;
    spec.minWidth = 1;
    spec.minHeight = 1;
  }
  return spec;
}
