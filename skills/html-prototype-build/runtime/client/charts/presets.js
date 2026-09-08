/* ECharts option 预设：shared + 各 chart leaf 调用的 builder。 */
(function () {
  'use strict';

  var presets = window.PrototypeChartPresets = window.PrototypeChartPresets || {};

  /** 读取主题色板（单次 getThemeFromTokens）。 */
  function theme() {
    return window.PrototypeChartBridge.getThemeFromTokens();
  }

  /** 共享 grid / legend / tooltip 基线。 */
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

  /** 折线 / 面积 preset。 */
  presets.line = function (state) {
    var tokens = theme();
    var categories = state.categories || ['1月', '2月', '3月', '4月', '5月', '6月'];
    var seriesInput = state.series || [
      { key: 'primary', name: '本期', data: [120, 132, 101, 134, 90, 230] },
      { key: 'success', name: '上期', data: [220, 182, 191, 234, 290, 330] }
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

  /** 柱状 / 横向条 preset。 */
  presets.bar = function (state) {
    var tokens = theme();
    var categories = state.categories || ['Q1', 'Q2', 'Q3', 'Q4'];
    var seriesInput = state.series || [
      { key: 'primary', name: '计划', data: [118, 145, 105, 162] },
      { key: 'warning', name: '完成', data: [92, 128, 84, 138] }
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

  /** 环图 / 饼图 preset。 */
  presets.donut = function (state) {
    var items = state.items || [
      { key: 'primary', name: '线上', value: 62 },
      { key: 'success', name: '线下', value: 23 },
      { key: 'warning', name: '转介绍', value: 15 }
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

  /** 柱线混合 preset（双 y 轴）。 */
  presets.mixed = function (state) {
    var categories = state.categories || ['1月', '2月', '3月', '4月', '5月', '6月'];
    var bars = state.bars || { key: 'bar', name: '任务量', data: [320, 302, 301, 334, 390, 330] };
    var lines = state.lines || { key: 'line', name: '完成率', data: [82, 93, 90, 93, 129, 133], yAxisName: '%' };
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

  /** 漏斗 preset。 */
  presets.funnel = function (state) {
    var steps = state.steps || [
      { key: 'visit', name: '访问', value: 100 },
      { key: 'intent', name: '意向', value: 80 },
      { key: 'submit', name: '提交', value: 60 },
      { key: 'approve', name: '审批', value: 40 },
      { key: 'done', name: '完成', value: 25 }
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

  /** 仪表盘 preset。 */
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

  /** 热力图 preset。 */
  presets.heatmap = function (state) {
    var xCategories = state.xCategories || ['0', '4', '8', '12', '16', '20'];
    var yCategories = state.yCategories || ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
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

  /** 地图 preset（需先 registerMap）。 */
  presets.map = function (state) {
    var mapId = state.mapId || 'china';
    var data = state.data || [
      { name: '广东', value: 120 },
      { name: '浙江', value: 90 },
      { name: '江苏', value: 85 },
      { name: '北京', value: 70 },
      { name: '四川', value: 55 }
    ];
    var vmin = state.visualMap && typeof state.visualMap.min === 'number' ? state.visualMap.min : 0;
    var vmax = state.visualMap && typeof state.visualMap.max === 'number' ? state.visualMap.max : 150;
    return Object.assign(shared({ tooltip: { trigger: 'item' } }), {
      visualMap: { min: vmin, max: vmax, left: 16, bottom: 16, text: ['高', '低'], calculable: true },
      series: [{ type: 'map', map: mapId, roam: !!state.roam, label: { show: false }, data: data }]
    });
  };
})();
