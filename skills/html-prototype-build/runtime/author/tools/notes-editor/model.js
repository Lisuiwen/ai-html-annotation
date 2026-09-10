/* Notes editor pure data model: card creation, layer when rules, and visible-card ordering; no DOM I/O. */
(function () {
  'use strict';

  if (window.PrototypeNotesEditorModel) return;

  function isObject(value) {
    return !!value && Object.prototype.toString.call(value) === '[object Object]';
  }

  function createCardId(cards) {
    var list = Array.isArray(cards) ? cards : [];
    var index = list.length + 1;
    while (list.some(function (card) { return card && card.id === 'note-' + index; })) index++;
    return 'note-' + index;
  }

  function whenForCurrentLayer(appState) {
    var product = appState && appState.product;
    if (!isObject(product)) return undefined;
    var when = {};
    if (Object.prototype.hasOwnProperty.call(product, 'layer')) when['product.layer'] = product.layer;
    if (Object.prototype.hasOwnProperty.call(product, 'layers')) {
      when['product.layers'] = Array.isArray(product.layers) ? product.layers.slice() : product.layers;
    }
    if (Object.prototype.hasOwnProperty.call(product, 'page') && Object.prototype.hasOwnProperty.call(product, 'layers')) {
      when['product.page'] = product.page;
    }
    return Object.keys(when).length ? when : undefined;
  }

  function createCard(cards, appState) {
    var card = {
      id: createCardId(cards),
      title: 'New note',
      body: 'Double-click to edit note content.',
      target: { selector: '', label: '' }
    };
    var when = whenForCurrentLayer(appState);
    if (when) card.when = when;
    return card;
  }

  function removeCard(cards, id) {
    if (!Array.isArray(cards)) return [];
    return cards.filter(function (card) { return !card || card.id !== id; });
  }

  function applyVisibleOrder(cards, visibleIds) {
    if (!Array.isArray(cards)) return [];
    if (!Array.isArray(visibleIds)) return cards.slice();
    var visibleSet = {};
    visibleIds.forEach(function (id) { visibleSet[id] = true; });
    var queue = visibleIds.map(function (id) {
      return cards.find(function (card) { return card && card.id === id; });
    }).filter(Boolean);
    var qi = 0;
    return cards.map(function (card) {
      if (!card || !visibleSet[card.id]) return card;
      return queue[qi++] || card;
    });
  }

  function reorderVisibleIds(visibleIds, fromId, dropId, placeAfter) {
    if (!Array.isArray(visibleIds)) return [];
    var next = visibleIds.slice();
    var fromIdx = next.indexOf(fromId);
    if (fromIdx < 0 || next.indexOf(dropId) < 0 || fromId === dropId) return next;
    next.splice(fromIdx, 1);
    var insertAt = next.indexOf(dropId);
    if (placeAfter) insertAt += 1;
    next.splice(insertAt, 0, fromId);
    return next;
  }

  window.PrototypeNotesEditorModel = {
    createCardId: createCardId,
    whenForCurrentLayer: whenForCurrentLayer,
    createCard: createCard,
    removeCard: removeCard,
    applyVisibleOrder: applyVisibleOrder,
    reorderVisibleIds: reorderVisibleIds
  };
})();
