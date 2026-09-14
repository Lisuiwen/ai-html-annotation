/* ECharts option presets: shared baseline plus builders used by chart leaves. */
(function () {
  'use strict';

  var presets = window.PrototypeChartPresets = window.PrototypeChartPresets || {};

  /** Read theme palette (single getThemeFromTokens call). */
  function theme() {
    return window.PrototypeChartBridge.getThemeFromTokens();
  }

  /** Shared grid / legend / tooltip baseline. */
  function shared(extra) {
    var tokens = theme();
    var base = {
      color: tokens.color,
      textStyle: tokens.textStyle,
      grid: { left: 48, right: 24, top: 40, bottom: 32, containLabel: true },
      legend: { top: 0, textStyle: { color: tokens.textStyle.color } },
      tooltip: { trigger: 'axis' }
    };
    if (!extra) return base;
    return Object.assign({}, base, extra);
  }

  /** Line / area preset. */
  presets.line = function (state) {
    var tokens = theme();
    var categories = state.categories || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    var seriesInput = state.series || [
      { key: 'primary', name: 'Current', data: [120, 132, 101, 134, 90, 230] },
      { key: 'success', name: 'Previous', data: [220, 182, 191, 234, 290, 330] }
    ];
    var visible = state.visibleSeries || seriesInput.map(function (s) { return s.key; });
    var isArea = state.variant === 'area';
    var palette = tokens.color;
    var series = seriesInput.map(function (item, index) {
      return {
        id: item.key,
        name: item.name,
        type: 'line',
        smooth: true,
        areaStyle: isArea ? {} : undefined,
        data: item.data,
        show: visible.indexOf(item.key) !== -1,
        color: palette[index % palette.length]
      };
    });
    return Object.assign(shared(), {
      xAxis: { type: 'category', data: categories, axisLine: { lineStyle: { color: tokens.axisLine } } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: tokens.splitLine } } },
      series: series
    });
  };

  /** Bar / horizontal bar preset. */
  presets.bar = function (state) {
    var tokens = theme();
    var categories = state.categories || ['Q1', 'Q2', 'Q3', 'Q4'];
    var seriesInput = state.series || [
      { key: 'primary', name: 'Planned', data: [118, 145, 105, 162] },
      { key: 'warning', name: 'Completed', data: [92, 128, 84, 138] }
    ];
    var visible = state.visibleSeries || seriesInput.map(function (s) { return s.key; });
    var horizontal = state.layout === 'horizontal';
    var palette = tokens.color;
    var series = seriesInput.map(function (item, index) {
      return {
        id: item.key,
        name: item.name,
        type: 'bar',
        stack: item.stack,
        data: item.data,
        show: visible.indexOf(item.key) !== -1,
        color: palette[index % palette.length]
      };
    });
    var catAxis = { type: 'category', data: categories, axisLine: { lineStyle: { color: tokens.axisLine } } };
    var valAxis = { type: 'value', splitLine: { lineStyle: { color: tokens.splitLine } } };
    return Object.assign(shared(), {
      xAxis: horizontal ? valAxis : catAxis,
      yAxis: horizontal ? catAxis : valAxis,
      series: series
    });
  };

  /** Donut / pie preset. */
  presets.donut = function (state) {
    var items = state.items || [
      { key: 'primary', name: 'Online', value: 62 },
      { key: 'success', name: 'Offline', value: 23 },
      { key: 'warning', name: 'Referral', value: 15 }
    ];
    var visible = state.visibleKeys || items.map(function (i) { return i.key; });
    var radius = state.radius || ['40%', '70%'];
    var data = items.filter(function (item) { return visible.indexOf(item.key) !== -1; }).map(function (item) {
      return { name: item.name, value: item.value, id: item.key };
    });
    return Object.assign(shared({ tooltip: { trigger: 'item' }, legend: { orient: 'vertical', right: 0, top: 'center' } }), {
      series: [{ type: 'pie', radius: radius, center: ['40%', '50%'], data: data, emphasis: { scale: true } }]
    });
  };

  /** Mixed bar-line preset (dual y-axis). */
  presets.mixed = function (state) {
    var categories = state.categories || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    var bars = state.bars || { key: 'bar', name: 'Tasks', data: [320, 302, 301, 334, 390, 330] };
    var lines = state.lines || { key: 'line', name: 'Completion %', data: [82, 93, 90, 93, 129, 133], yAxisName: '%' };
    return Object.assign(shared(), {
      legend: { data: [bars.name, lines.name] },
      xAxis: { type: 'category', data: categories },
      yAxis: [
        { type: 'value', name: state.leftAxisName || '' },
        { type: 'value', name: state.rightAxisName || lines.yAxisName || '', splitLine: { show: false } }
      ],
      series: [
        { id: bars.key, name: bars.name, type: 'bar', data: bars.data, yAxisIndex: 0 },
        { id: lines.key, name: lines.name, type: 'line', smooth: true, data: lines.data, yAxisIndex: 1 }
      ]
    });
  };

  /** Funnel preset. */
  presets.funnel = function (state) {
    var steps = state.steps || [
      { key: 'visit', name: 'access', value: 100 },
      { key: 'intent', name: 'Intent', value: 80 },
      { key: 'submit', name: 'Submit', value: 60 },
      { key: 'approve', name: 'approval', value: 40 },
      { key: 'done', name: 'Completed', value: 25 }
    ];
    return Object.assign(shared({ tooltip: { trigger: 'item' } }), {
      series: [{
        type: 'funnel',
        left: '10%',
        width: '80%',
        sort: 'descending',
        label: { show: true, position: 'inside' },
        data: steps.map(function (s) { return { name: s.name, value: s.value, id: s.key }; })
      }]
    });
  };

  /** Gauge preset. */
  presets.gauge = function (state) {
    var palette = theme().color;
    var value = typeof state.value === 'number' ? state.value : 72;
    var min = typeof state.min === 'number' ? state.min : 0;
    var max = typeof state.max === 'number' ? state.max : 100;
    var unit = state.unit || '%';
    var thresholds = state.thresholds || [
      { value: 0.6, color: palette[1] },
      { value: 0.85, color: palette[2] },
      { value: 1, color: palette[3] }
    ];
    var axisLineColor = thresholds.map(function (t, i) {
      return [t.value, t.color || palette[i % palette.length]];
    });
    return {
      series: [{
        type: 'gauge',
        min: min,
        max: max,
        progress: { show: true, width: 12 },
        axisLine: { lineStyle: { width: 12, color: axisLineColor.length ? axisLineColor : [[1, palette[0]]] } },
        detail: { formatter: '{value}' + unit, fontSize: 20 },
        data: [{ value: value }]
      }]
    };
  };

  /** Heatmap preset. */
  presets.heatmap = function (state) {
    var xCategories = state.xCategories || ['0', '4', '8', '12', '16', '20'];
    var yCategories = state.yCategories || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    var data = state.data || [[0, 0, 5], [1, 0, 1], [2, 1, 8], [3, 2, 3], [4, 3, 6], [5, 4, 2]];
    var vmin = state.visualMap && typeof state.visualMap.min === 'number' ? state.visualMap.min : 0;
    var vmax = state.visualMap && typeof state.visualMap.max === 'number' ? state.visualMap.max : 10;
    return Object.assign(shared({ tooltip: { position: 'top' } }), {
      grid: { left: 64, right: 24, top: 24, bottom: 32 },
      xAxis: { type: 'category', data: xCategories, splitArea: { show: true } },
      yAxis: { type: 'category', data: yCategories, splitArea: { show: true } },
      visualMap: { min: vmin, max: vmax, calculable: true, orient: 'horizontal', left: 'center', bottom: 0 },
      series: [{ type: 'heatmap', data: data, label: { show: false } }]
    });
  };

  /** Map preset (requires registerMap first). */
  presets.map = function (state) {
    var mapId = state.mapId || 'china';
    var data = state.data || [
      { name: 'Guangdong', value: 120 },
      { name: 'Zhejiang', value: 90 },
      { name: 'Jiangsu', value: 85 },
      { name: 'Beijing', value: 70 },
      { name: 'Sichuan', value: 55 }
    ];
    var vmin = state.visualMap && typeof state.visualMap.min === 'number' ? state.visualMap.min : 0;
    var vmax = state.visualMap && typeof state.visualMap.max === 'number' ? state.visualMap.max : 150;
    return Object.assign(shared({ tooltip: { trigger: 'item' } }), {
      visualMap: { min: vmin, max: vmax, left: 16, bottom: 16, text: ['High', 'Low'], calculable: true },
      series: [{ type: 'map', map: mapId, roam: !!state.roam, label: { show: false }, data: data }]
    });
  };
})();
