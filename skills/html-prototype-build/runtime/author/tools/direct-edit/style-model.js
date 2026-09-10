/* Direct Edit style model: computed values are display-only; only dirty fields are written inline. */
(function () {
  'use strict';

  var COLOR_PROPS = { color: true, 'background-color': true, 'border-color': true };
  var BOX_SIDES = [
    { suffix: 'top', label: 'Top' },
    { suffix: 'right', label: 'Right' },
    { suffix: 'bottom', label: 'Bottom' },
    { suffix: 'left', label: 'Left' }
  ];
  function boxSides(prefix) {
    return BOX_SIDES.map(function (side) {
      return { key: prefix + '-' + side.suffix, label: side.label };
    });
  }
  var FIELDS = [
    { group: 'Content', key: 'text', label: 'Text', kind: 'text' },
    { group: 'Size', key: 'width', label: 'Width', kind: 'length' },
    { group: 'Size', key: 'height', label: 'Height', kind: 'length' },
    { group: 'Spacing', key: 'padding', label: 'Padding', kind: 'box', sides: boxSides('padding') },
    { group: 'Spacing', key: 'margin', label: 'Margin', kind: 'box', sides: boxSides('margin') },
    { group: 'Spacing', key: 'gap', label: 'Gap', kind: 'length' },
    { group: 'Typography', key: 'font-size', label: 'Font size', kind: 'length' },
    { group: 'Typography', key: 'font-weight', label: 'Font weight', kind: 'css' },
    { group: 'Typography', key: 'color', label: 'Color', kind: 'color' },
    { group: 'Typography', key: 'text-align', label: 'Align', kind: 'align' },
    { group: 'Appearance', key: 'background-color', label: 'Background', kind: 'color' },
    {
      group: 'Appearance',
      key: 'border',
      label: 'Border',
      kind: 'border',
      sides: BOX_SIDES.map(function (side) {
        return { key: 'border-' + side.suffix + '-width', label: side.label };
      }),
      color: 'border-color',
      style: 'border-style'
    },
    {
      group: 'Appearance',
      key: 'border-radius',
      label: 'Border radius',
      kind: 'box',
      sides: [
        { key: 'border-top-left-radius', label: 'Top left' },
        { key: 'border-top-right-radius', label: 'Top right' },
        { key: 'border-bottom-right-radius', label: 'Bottom right' },
        { key: 'border-bottom-left-radius', label: 'Bottom left' }
      ]
    }
  ];
  var LENGTH_PROPS = {
    width: true, height: true, gap: true, 'font-size': true,
    'padding-top': true, 'padding-right': true, 'padding-bottom': true, 'padding-left': true,
    'margin-top': true, 'margin-right': true, 'margin-bottom': true, 'margin-left': true,
    'border-top-width': true, 'border-right-width': true, 'border-bottom-width': true, 'border-left-width': true,
    'border-top-left-radius': true, 'border-top-right-radius': true,
    'border-bottom-right-radius': true, 'border-bottom-left-radius': true
  };
  var SKIP_PX = { 'font-weight': true, 'text-align': true, 'border-style': true };

  function rgbToHex(value) {
    if (!value) return '';
    var m = String(value).match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i);
    if (!m) return value;
    if (m[4] !== undefined && Number(m[4]) === 0) return 'transparent';
    function hex(n) {
      return ('0' + Number(n).toString(16)).slice(-2);
    }
    return '#' + hex(m[1]) + hex(m[2]) + hex(m[3]);
  }

  function isSimpleText(el) {
    if (!el) return false;
    var nodes = [];
    for (var i = 0; i < el.childNodes.length; i++) {
      var node = el.childNodes[i];
      if (node.nodeType === 3 && !String(node.textContent || '').trim()) continue;
      nodes.push(node);
    }
    return nodes.length === 1 && nodes[0].nodeType === 3;
  }

  function readInline(el, prop) {
    return (el.style && el.style.getPropertyValue(prop)) || '';
  }

  var RELATED = {
    width: ['width', 'min-width', 'max-width'],
    height: ['height', 'min-height', 'max-height'],
    padding: ['padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
    margin: ['margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
    gap: ['gap', 'row-gap', 'column-gap'],
    'font-size': ['font-size', 'font'],
    'font-weight': ['font-weight', 'font'],
    color: ['color'],
    'text-align': ['text-align'],
    'background-color': ['background-color', 'background'],
    'padding-top': ['padding-top', 'padding'],
    'padding-right': ['padding-right', 'padding'],
    'padding-bottom': ['padding-bottom', 'padding'],
    'padding-left': ['padding-left', 'padding'],
    'margin-top': ['margin-top', 'margin'],
    'margin-right': ['margin-right', 'margin'],
    'margin-bottom': ['margin-bottom', 'margin'],
    'margin-left': ['margin-left', 'margin'],
    border: [
      'border', 'border-width', 'border-style', 'border-color',
      'border-top', 'border-right', 'border-bottom', 'border-left',
      'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
      'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
      'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color'
    ],
    'border-top-width': ['border-top-width', 'border-width', 'border-top', 'border'],
    'border-right-width': ['border-right-width', 'border-width', 'border-right', 'border'],
    'border-bottom-width': ['border-bottom-width', 'border-width', 'border-bottom', 'border'],
    'border-left-width': ['border-left-width', 'border-width', 'border-left', 'border'],
    'border-color': ['border-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'border'],
    'border-style': ['border-style', 'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style', 'border'],
    'border-radius': ['border-radius', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'],
    'border-top-left-radius': ['border-top-left-radius', 'border-radius'],
    'border-top-right-radius': ['border-top-right-radius', 'border-radius'],
    'border-bottom-right-radius': ['border-bottom-right-radius', 'border-radius'],
    'border-bottom-left-radius': ['border-bottom-left-radius', 'border-radius']
  };

  function fieldByKey(key) {
    var i;
    for (i = 0; i < FIELDS.length; i++) {
      if (FIELDS[i].key === key) return FIELDS[i];
    }
    return null;
  }

  function isGroupField(field) {
    return field && (field.kind === 'box' || field.kind === 'border');
  }

  function trackedProps(field) {
    var props = [];
    if (!field || field.kind === 'text') return props;
    if (isGroupField(field)) {
      field.sides.forEach(function (side) { props.push(side.key); });
      if (field.color) props.push(field.color);
      if (field.style) props.push(field.style);
      return props;
    }
    props.push(field.key);
    return props;
  }

  function resetList(prop) {
    var field = fieldByKey(prop);
    if (isGroupField(field)) return (RELATED[prop] || []).slice();
    return [prop];
  }
  var INHERITED = { color: true, 'font-size': true, 'font-weight': true, 'text-align': true };

  function ruleHasProp(style, props) {
    var i;
    for (i = 0; i < props.length; i++) {
      if (style.getPropertyValue(props[i])) return true;
    }
    return false;
  }

  function ruleHasImportant(style, props) {
    if (!style || typeof style.getPropertyPriority !== 'function') return false;
    return props.some(function (prop) { return style.getPropertyPriority(prop) === 'important'; });
  }

  function specificity(selector) {
    var id = (selector.match(/#[\w-]+/g) || []).length;
    var cls = (selector.match(/(\.[\w-]+)|(\[[^\]]+\])|(::?[\w-]+)/g) || []).length;
    var tagged = selector
      .replace(/#[\w-]+/g, '')
      .replace(/\.[\w-]+/g, '')
      .replace(/\[[^\]]+\]/g, '')
      .replace(/::?[\w-]+/g, '')
      .match(/[a-z][\w-]*/gi);
    return id * 10000 + cls * 100 + (tagged ? tagged.length : 0);
  }

  function labelFromSelector(el, selector) {
    var owned = [];
    var re = /\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g;
    var match;
    while ((match = re.exec(selector))) {
      if (el.classList && el.classList.contains(match[1]) && owned.indexOf('.' + match[1]) < 0) {
        owned.push('.' + match[1]);
      }
    }
    if (owned.length) return owned.join('');
    if (el.id && selector.indexOf('#' + el.id) !== -1) return '#' + el.id;
    var first = selector.match(/\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/);
    if (first) return '.' + first[1];
    return selector.replace(/\s+/g, ' ').trim().slice(0, 48) || 'Stylesheet';
  }

  function collectRules(list, out) {
    var i;
    var rule;
    if (!list) return;
    for (i = 0; i < list.length; i++) {
      rule = list[i];
      if (rule.type === 1 && rule.style && rule.selectorText) out.push(rule);
      else if (rule.cssRules) {
        if (rule.type === 4 && rule.conditionText && window.matchMedia && !window.matchMedia(rule.conditionText).matches) continue;
        collectRules(rule.cssRules, out);
      }
    }
  }

  function findOnElement(el, prop) {
    var props = RELATED[prop] || [prop];
    var best = null;
    var sheets = document.styleSheets;
    var order = 0;
    var s;
    var rules;
    var r;
    var parts;
    var p;
    var sel;
    var spec;
    var important;
    for (s = 0; s < sheets.length; s++) {
      rules = [];
      try { collectRules(sheets[s].cssRules, rules); } catch (_) { continue; }
      for (r = 0; r < rules.length; r++) {
        order += 1;
        if (!ruleHasProp(rules[r].style, props)) continue;
        important = ruleHasImportant(rules[r].style, props);
        parts = rules[r].selectorText.split(',');
        for (p = 0; p < parts.length; p++) {
          sel = parts[p].trim();
          if (!sel) continue;
          try { if (!el.matches(sel)) continue; } catch (_) { continue; }
          spec = specificity(sel);
          if (!best || (important && !best.important) || (important === best.important && (spec > best.spec || (spec === best.spec && order >= best.order)))) {
            best = { spec: spec, order: order, selector: sel, label: labelFromSelector(el, sel), important: important };
          }
        }
      }
    }
    return best;
  }

  function findStyleSource(el, prop) {
    var found = findOnElement(el, prop);
    var cur;
    var inlineValue = readInline(el, prop);
    var inlineImportant = !!(el.style && typeof el.style.getPropertyPriority === 'function' && el.style.getPropertyPriority(prop) === 'important');
    if (inlineValue && !(found && found.important && !inlineImportant)) {
      return { kind: 'inline', label: 'Inline', title: 'Element style attribute' };
    }
    if (found) return { kind: 'class', label: found.label, title: found.selector + (found.important ? ' !important' : '') };
    if (INHERITED[prop]) {
      cur = el.parentElement;
      while (cur && cur !== document.documentElement) {
        if (readInline(cur, prop)) return { kind: 'inherit', label: 'Inherited Inline', title: 'Inherited from parent element inline style' };
        found = findOnElement(cur, prop);
        if (found) return { kind: 'inherit', label: 'Inherited ' + found.label, title: found.selector };
        cur = cur.parentElement;
      }
    }
    return { kind: 'ua', label: 'Browser default', title: 'User Agent / no matching style rule' };
  }

  function readComputed(el, prop) {
    var value = window.getComputedStyle(el).getPropertyValue(prop);
    if (COLOR_PROPS[prop]) return rgbToHex(value.trim()) || value.trim();
    return (value || '').trim();
  }

  function splitCssLength(value) {
    var text = String(value || '').trim();
    var match = text.match(/^(-?\d*\.?\d+)([a-z%]+)$/i);
    if (match) return { num: match[1], unit: match[2] };
    return { num: text, unit: '' };
  }

  function cssFromLengthInput(row, raw) {
    var text = String(raw || '').trim();
    if (!text) return '';
    var split = splitCssLength(text);
    if (split.unit) {
      row.unit = split.unit;
      return split.num + split.unit;
    }
    if (/^-?\d*\.?\d+$/.test(text) && row.unit) return text + row.unit;
    return text;
  }

  function displayFromCss(prop, cssValue) {
    if (!LENGTH_PROPS[prop]) return { displayValue: cssValue, unit: '' };
    var split = splitCssLength(cssValue);
    return { displayValue: split.num, unit: split.unit };
  }

  function normalizeInput(prop, raw) {
    var value = String(raw || '').trim();
    if (!value) return '';
    if (SKIP_PX[prop] || COLOR_PROPS[prop]) return value;
    if (/^-?\d+(\.\d+)?$/.test(value)) return value + 'px';
    return value;
  }

  function createSession(el) {
    var originalInline = el.getAttribute('style') || '';
    var originalText = isSimpleText(el) ? el.textContent : null;
    var rows = {};
    var textDirty = false;
    var textValue = originalText;
    var groupCleared = {};
    var originalByProp = {};

    function initRow(prop) {
      var inlineValue = readInline(el, prop);
      var computedValue = readComputed(el, prop);
      var source = findStyleSource(el, prop);
      /* Inputs always reflect the browser's effective value; inline is only the source and save baseline. */
      var shown = displayFromCss(prop, computedValue);
      originalByProp[prop] = inlineValue;
      rows[prop] = {
        property: prop,
        inlineValue: inlineValue,
        computedValue: computedValue,
        displayValue: shown.displayValue,
        baselineDisplay: shown.displayValue,
        unit: shown.unit,
        overridden: !!inlineValue,
        dirty: false,
        originalInline: inlineValue,
        sourceKind: source.kind,
        sourceLabel: source.label,
        sourceTitle: source.title
      };
    }

    FIELDS.forEach(function (field) {
      trackedProps(field).forEach(initRow);
      if (isGroupField(field)) {
        (RELATED[field.key] || []).forEach(function (prop) {
          if (!Object.prototype.hasOwnProperty.call(originalByProp, prop)) {
            originalByProp[prop] = readInline(el, prop);
          }
        });
      }
    });

    function snapshotRow(prop) {
      var inlineValue = readInline(el, prop);
      var computedValue = readComputed(el, prop);
      var row = rows[prop];
      row.inlineValue = inlineValue;
      row.computedValue = computedValue;
      row.overridden = !!inlineValue;
      if (!row.dirty) {
        var shown = displayFromCss(prop, computedValue);
        row.displayValue = shown.displayValue;
        row.unit = shown.unit || row.unit;
        var source = findStyleSource(el, prop);
        row.sourceKind = source.kind;
        row.sourceLabel = source.label;
        row.sourceTitle = source.title;
      }
    }

    function previewStyle(prop, value) {
      var row = rows[prop];
      var typed = String(value == null ? '' : value);
      var pending = LENGTH_PROPS[prop] && (/^-?$/.test(typed.trim()) || typed.trim() === '.' || /^-?\d+\.$/.test(typed.trim()));
      if (pending) {
        row.displayValue = typed;
        row.dirty = typed !== row.baselineDisplay || !!row.originalInline;
        row.sourceKind = 'dirty';
        row.sourceLabel = 'Unsaved';
        row.sourceTitle = 'Preview only; not written to the source file yet';
        return;
      }
      var cssValue = LENGTH_PROPS[prop] ? cssFromLengthInput(row, typed) : typed;
      var next = normalizeInput(prop, cssValue);
      if (!next) el.style.removeProperty(prop);
      else el.style.setProperty(prop, next);
      var current = readInline(el, prop);
      snapshotRow(prop);
      row.displayValue = typed;
      row.dirty = current !== row.originalInline || typed !== row.baselineDisplay;
      if (row.dirty) {
        row.sourceKind = 'dirty';
        row.sourceLabel = 'Unsaved';
        row.sourceTitle = 'Preview only; not written to the source file yet';
      }
    }

    function markRowDirtyFromReset(prop) {
      var row = rows[prop];
      if (!row) return;
      row.dirty = !!row.originalInline;
      snapshotRow(prop);
      row.dirty = !!row.originalInline;
      if (row.dirty) {
        var shown = displayFromCss(prop, readComputed(el, prop));
        row.displayValue = shown.displayValue;
        row.unit = shown.unit;
        row.sourceKind = 'dirty';
        row.sourceLabel = 'Unsaved';
        row.sourceTitle = 'Preview only; not written to the source file yet';
      }
    }

    function resetProperty(prop) {
      var list = resetList(prop);
      var field = fieldByKey(prop);
      list.forEach(function (name) { el.style.removeProperty(name); });
      if (isGroupField(field)) {
        groupCleared[prop] = list.some(function (name) { return !!originalByProp[name]; });
        trackedProps(field).forEach(markRowDirtyFromReset);
        return;
      }
      markRowDirtyFromReset(prop);
    }

    function setText(value) {
      if (originalText === null) return;
      textValue = value;
      el.textContent = value;
      textDirty = value !== originalText;
    }

    function discard() {
      groupCleared = {};
      el.setAttribute('style', originalInline);
      if (!originalInline) el.removeAttribute('style');
      if (originalText !== null) el.textContent = originalText;
      textDirty = false;
      textValue = originalText;
      Object.keys(rows).forEach(function (prop) {
        rows[prop].dirty = false;
        rows[prop].originalInline = readInline(el, prop);
        snapshotRow(prop);
      });
    }

    function resetElement() {
      FIELDS.forEach(function (field) {
        if (field.kind === 'text') return;
        resetProperty(field.key);
      });
    }

    function isDirty() {
      if (textDirty) return true;
      if (Object.keys(groupCleared).some(function (key) { return groupCleared[key]; })) return true;
      return Object.keys(rows).some(function (prop) { return rows[prop].dirty; });
    }

    function pushPatch(styles, removeStyles, prop) {
      var current = readInline(el, prop);
      if (current) {
        styles[prop] = current;
        var idx = removeStyles.indexOf(prop);
        if (idx >= 0) removeStyles.splice(idx, 1);
      } else if (removeStyles.indexOf(prop) < 0 && !styles[prop]) {
        removeStyles.push(prop);
      }
    }

    function toPatch() {
      var styles = {};
      var removeStyles = [];
      Object.keys(rows).forEach(function (prop) {
        if (!rows[prop].dirty) return;
        pushPatch(styles, removeStyles, prop);
      });
      Object.keys(groupCleared).forEach(function (key) {
        if (!groupCleared[key]) return;
        (RELATED[key] || []).forEach(function (prop) {
          if (styles[prop]) return;
          pushPatch(styles, removeStyles, prop);
        });
      });
      var patch = { styles: styles, removeStyles: removeStyles };
      if (textDirty && originalText !== null) patch.text = textValue;
      return patch;
    }

    return {
      element: el,
      fields: FIELDS,
      rows: rows,
      canEditText: originalText !== null,
      getText: function () { return textValue; },
      setText: setText,
      previewStyle: previewStyle,
      resetProperty: resetProperty,
      resetElement: resetElement,
      discard: discard,
      isDirty: isDirty,
      toPatch: toPatch
    };
  }

  window.AuthorToolsStyleModel = {
    createSession: createSession
  };
})();