/* Direct Edit 面板：回显 computed / inline / dirty，只改用户动过的字段。 */
(function () {
  'use strict';

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function sourceLabel(row) {
    var kind = row.sourceKind || (row.dirty ? 'dirty' : row.overridden ? 'inline' : 'class');
    var text = row.sourceLabel || (kind === 'inline' ? 'Inline' : 'Stylesheet');
    var title = row.sourceTitle ? ' title="' + esc(row.sourceTitle) + '"' : '';
    var cls = 'at-src';
    if (kind === 'dirty') cls += ' is-dirty';
    else if (kind === 'inline') cls += ' is-inline';
    else if (kind === 'class') cls += ' is-class';
    return '<span class="' + cls + '"' + title + '>' + esc(text) + '</span>';
  }

  function lengthControl(prop, row) {
    var value = (row && row.displayValue) || '';
    var unit = row && row.unit ? row.unit : '';
    return '<div class="at-length-wrap">' +
      '<input data-prop="' + prop + '" inputmode="decimal" value="' + esc(value) + '">' +
      (unit ? '<span class="at-unit">' + esc(unit) + '</span>' : '') +
      '</div>';
  }

  function colorControl(prop, row) {
    var value = (row && row.displayValue) || '';
    var hex = /^#([0-9a-f]{6})$/i.test(value) ? value : '#000000';
    return '<div class="at-color-wrap">' +
      '<input type="color" data-prop="' + prop + '" value="' + esc(hex) + '">' +
      '<input data-prop="' + prop + '" value="' + esc(value) + '">' +
      '</div>';
  }

  function boxGrid(field, session) {
    return '<div class="at-box-grid">' + field.sides.map(function (side) {
      return '<label class="at-box-cell">' +
        '<span>' + esc(side.label) + '</span>' +
        lengthControl(side.key, session.rows[side.key]) +
        '</label>';
    }).join('') + '</div>';
  }

  function groupSource(field, session) {
    var props = field.sides.map(function (side) { return side.key; });
    if (field.color) props.push(field.color);
    if (field.style) props.push(field.style);
    var dirty = props.map(function (prop) { return session.rows[prop]; }).filter(function (row) {
      return row && row.dirty;
    });
    if (dirty.length) return sourceLabel(dirty[0]);
    var first = session.rows[props[0]];
    var mixed = props.some(function (prop) {
      var row = session.rows[prop];
      return row && first && (row.sourceKind !== first.sourceKind || row.sourceLabel !== first.sourceLabel);
    });
    if (mixed && first) {
      return sourceLabel({
        sourceKind: first.sourceKind,
        sourceLabel: 'Mixed',
        sourceTitle: props.map(function (prop) {
          var row = session.rows[prop];
          return prop + ': ' + ((row && row.sourceLabel) || '');
        }).join('\n')
      });
    }
    return sourceLabel(first || {});
  }

  function fieldControl(field, row, session) {
    var value = field.kind === 'text' ? (session.getText() || '') : (row.displayValue || '');
    if (field.kind === 'align') {
      return '<select data-prop="' + field.key + '">' +
        ['', 'left', 'center', 'right', 'justify'].map(function (opt) {
          return '<option value="' + opt + '"' + (value === opt ? ' selected' : '') + '>' + (opt || 'Default') + '</option>';
        }).join('') +
        '</select>';
    }
    if (field.kind === 'color') return colorControl(field.key, row);
    if (field.kind === 'length') return lengthControl(field.key, row);
    return '<input data-prop="' + field.key + '" value="' + esc(value) + '"' +
      (field.kind === 'text' && !session.canEditText ? ' disabled placeholder="Has child nodes, use Mark"' : '') + '>';
  }

  function borderMeta(field, session) {
    var styleRow = session.rows[field.style];
    var styleValue = (styleRow && styleRow.displayValue) || '';
    var options = ['none', 'solid', 'dashed'];
    if (styleValue && options.indexOf(styleValue) < 0) options.unshift(styleValue);
    return '<div class="at-border-meta">' +
      '<label class="at-border-extra">Color' + colorControl(field.color, session.rows[field.color]) + '</label>' +
      '<label class="at-border-extra">Style<select data-prop="' + field.style + '">' +
      options.map(function (opt) {
        return '<option value="' + esc(opt) + '"' + (styleValue === opt ? ' selected' : '') + '>' + esc(opt) + '</option>';
      }).join('') +
      '</select></label>' +
      '</div>';
  }

  function clickModifierLabel() {
    return window.AuthorToolsPlatform ? window.AuthorToolsPlatform.clickModifierLabel() : 'Ctrl';
  }

  function render(container, session, meta) {
    if (!session) {
      container.innerHTML =
        '<div class="at-edit-body">' +
        '  <div class="at-edit-empty">Hold <kbd>' + esc(clickModifierLabel()) + '</kbd> and click a page element to select it.<br>Normal clicks keep the page interactive.</div>' +
        '</div>' +
        '<div class="at-edit-foot">' +
        '  <button type="button" class="at-btn" data-act="cancel" disabled>Cancel</button>' +
        '  <button type="button" class="at-btn" data-act="reset" disabled>Reset element</button>' +
        '  <button type="button" class="at-btn primary" data-act="save" disabled>Save</button>' +
        '</div>';
      return;
    }

    var groups = [];
    var current = '';
    session.fields.forEach(function (field) {
      if (field.group !== current) {
        current = field.group;
        groups.push({ name: current, fields: [] });
      }
      groups[groups.length - 1].fields.push(field);
    });

    var identity =
      '<div class="at-edit-identity">' +
      '  <strong>' + esc(meta.tag) + (meta.id ? '  ' + esc(meta.id) : '') + '</strong>' +
      '  ' + esc(meta.classes || '') +
      '</div>';

    var fieldsHtml = '<div class="at-edit-fields">' + groups.map(function (group) {
      return '<div class="at-edit-section"><h4>' + esc(group.name) + '</h4>' +
        group.fields.map(function (field) {
          if (field.kind === 'text') {
            return '<div class="at-edit-row">' +
              '<label>' + esc(field.label) + '</label>' +
              fieldControl(field, null, session) +
              '<span class="at-src">' + (session.canEditText ? 'Text' : 'Disabled') + '</span>' +
              '<span></span></div>';
          }
          if (field.kind === 'box' || field.kind === 'border') {
            return '<div class="at-edit-row at-edit-row-box">' +
              '<label>' + esc(field.label) + '</label>' +
              boxGrid(field, session) +
              groupSource(field, session) +
              '<button type="button" class="at-reset-prop" data-reset="' + field.key + '" title="Reset">↺</button>' +
              (field.kind === 'border' ? borderMeta(field, session) : '') +
              '</div>';
          }
          var row = session.rows[field.key];
          return '<div class="at-edit-row">' +
            '<label>' + esc(field.label) + '</label>' +
            fieldControl(field, row, session) +
            sourceLabel(row) +
            '<button type="button" class="at-reset-prop" data-reset="' + field.key + '" title="Reset">↺</button>' +
            '</div>';
        }).join('') +
        '</div>';
    }).join('') + '</div>';

    var dirty = session.isDirty();
    container.innerHTML =
      '<div class="at-edit-body">' + identity + fieldsHtml + '</div>' +
      '<div class="at-edit-foot">' +
      '  <button type="button" class="at-btn" data-act="cancel"' + (dirty ? '' : ' disabled') + '>Cancel</button>' +
      '  <button type="button" class="at-btn" data-act="reset">Reset element</button>' +
      '  <button type="button" class="at-btn primary" data-act="save"' + (dirty ? '' : ' disabled') + '>Save</button>' +
      '</div>';
  }

  window.AuthorToolsEditPanel = { render: render };
})();
