/* Placeable pieces taken out of pack demos. Each atom is one control, not the whole example. */

const control = (id, componentId, label, selector, sizing, extra) => Object.assign({
  id, componentId, label, selector, sizing
}, extra);

const nav = (id, componentId, label, selector, sizing, extra) => Object.assign({
  id, componentId, label, selector, sizing
}, extra);

const block = (id, componentId, label, sizingKey) => ({
  id, componentId, label, sizingKey, selector: null
});

export const ATOMS = [
  control('button.secondary', 'action.button', '次按钮', '.ui-button-row > .ui-button:not([class*="--"])', { axis: 'x', width: null, height: 32, lockHeight: true, minWidth: 32, minHeight: 32 }, { text: '次按钮' }),
  control('button.primary', 'action.button', '主按钮', '.ui-button--primary', { axis: 'x', width: null, height: 32, lockHeight: true, minWidth: 32, minHeight: 32 }, { text: '主按钮' }),
  control('button.text', 'action.button', '文字按钮', '.ui-button--text', { axis: 'x', width: null, height: 32, lockHeight: true, minWidth: 32, minHeight: 32 }, { text: '文字按钮' }),
  control('button.icon', 'action.button', '图标按钮', '.ui-button--icon', { axis: 'x', width: null, height: 32, lockHeight: true, minWidth: 32, minHeight: 32 }),
  control('input', 'form.input', '输入框', 'input.ui-input', { axis: 'x', width: 180, minWidth: 80, minHeight: 32 }),
  control('textarea', 'form.textarea', '多行输入', 'textarea.ui-textarea', { axis: 'both', width: 240, minWidth: 80, minHeight: 64 }),
  control('select', 'form.select', '选择器', '.ui-select', { axis: 'x', width: 180, minWidth: 80, minHeight: 32 }, { strip: '.ui-select-menu' }),
  control('search', 'form.search', '搜索框', '.ui-search', { axis: 'x', width: 220, minWidth: 120, minHeight: 32 }),
  control('field', 'form.field', '行内字段', '.ui-field', { axis: 'x', width: 220, minWidth: 120, minHeight: 32 }),
  control('date', 'form.date-picker', '日期', '.ui-date-picker', { axis: 'x', width: 160, minWidth: 120, minHeight: 32 }, { strip: '.ui-date-picker-panel' }),
  control('date-range', 'form.date-range-picker', '日期范围', '.ui-date-range', { axis: 'x', width: 220, minWidth: 160, minHeight: 32 }, { strip: '.ui-date-range-panel' }),
  control('switch', 'form.switch', '开关', '.ui-switch', { axis: 'none' }),
  control('checkbox', 'form.checkbox-group', '复选框', '.ui-checkbox-group', { axis: 'none' }, { piece: 'label' }),
  control('radio', 'form.radio-group', '单选框', '.ui-radio-group', { axis: 'none' }, { piece: 'label' }),
  control('upload', 'form.upload', '上传按钮', '.ui-upload-button', { axis: 'none' }, { text: '上传' }),
  control('tag', 'data.tag', '标签', '.ui-tag', { axis: 'none' }, { text: '标签' }),
  control('avatar', 'data.avatar', '头像', '.ui-avatar', { axis: 'none' }),
  control('progress', 'feedback.progress', '进度条', '.ui-progress', { axis: 'x', width: 180, minWidth: 80, minHeight: 16 }),
  control('alert', 'feedback.alert', '提示', '.ui-alert', { axis: 'x', width: 320, minWidth: 160, minHeight: 40 }),
  control('statistic', 'data.statistic', '指标', '.ui-statistic', { axis: 'none' }),

  nav('menu-item', 'navigation.sider-menu', '菜单项', '.ui-menu-item--active', { axis: 'x', width: 180, minWidth: 96, minHeight: 40, lockHeight: true }, { text: '菜单项', textSelector: 'span:last-child' }),
  nav('tab', 'navigation.tabs', '页签', '.ui-tab[aria-selected="true"]', { axis: 'none' }, { text: '页签' }),
  nav('step', 'navigation.steps', '步骤', '.ui-step[data-status="process"]', { axis: 'none' }),
  nav('crumb', 'navigation.breadcrumb', '面包屑项', '.ui-breadcrumb-list', { axis: 'none' }, { piece: 'li:first-child' }),
  nav('tree-row', 'navigation.tree', '树节点', '.ui-tree-row', { axis: 'x', width: 180, minWidth: 96, minHeight: 24, lockHeight: true }, { text: '节点', textSelector: 'span' }),
  nav('brand', 'navigation.app-header', '品牌', '.ui-brand', { axis: 'none' }),
  nav('nav-link', 'navigation.app-header', '顶栏链接', '.ui-topnav a', { axis: 'none' }, { text: '导航' }),

  block('table', 'data.data-table', '表格', 'data.data-table'),
  block('filter', 'data.filter-bar', '筛选条', 'data.filter-bar'),
  block('card', 'data.card', '卡片', 'data.card'),
  block('modal', 'feedback.modal', '弹窗', 'feedback.modal'),
  block('drawer', 'feedback.drawer', '抽屉', 'feedback.drawer'),
  block('chart-line', 'data.chart-line', '折线图', 'data.chart-line'),
  block('chart-bar', 'data.chart-bar', '柱状图', 'data.chart-bar'),
  block('chart-donut', 'data.chart-donut', '环形图', 'data.chart-donut'),
  block('chart-mixed', 'data.chart-mixed', '组合图', 'data.chart-mixed'),
  block('chart-gauge', 'data.chart-gauge', '仪表盘', 'data.chart-gauge'),
  block('chart-funnel', 'data.chart-funnel', '漏斗图', 'data.chart-funnel'),
  block('chart-heatmap', 'data.chart-heatmap', '热力图', 'data.chart-heatmap'),
  block('chart-map', 'data.chart-map', '地图', 'data.chart-map')
];

export function findAtom(id) {
  return ATOMS.find((atom) => atom.id === id) || null;
}
