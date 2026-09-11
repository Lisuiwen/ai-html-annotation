/* Notes Viewer pure data model: scenario metadata and when matching; no DOM I/O. */
(function () {
  'use strict';

  if (window.PrototypeNotesModel) return;

  function isObject(value) {
    return !!value && Object.prototype.toString.call(value) === '[object Object]';
  }

  function listScenarioIds(definitions) {
    if (Array.isArray(definitions)) {
      return definitions.map(function (scenario) { return scenario && scenario.id; }).filter(Boolean);
    }
    return isObject(definitions) ? Object.keys(definitions) : [];
  }

  function scenarioLabel(definitions, id) {
    if (!definitions || !id) return id || '';
    var config = Array.isArray(definitions)
      ? definitions.filter(function (scenario) { return scenario && scenario.id === id; })[0]
      : definitions[id];
    return (config && config.label) || id;
  }

  function readStatePath(source, path) {
    return String(path).split('.').reduce(function (value, key) {
      return value == null ? undefined : value[key];
    }, source);
  }

  function equalStateValue(actual, expected) {
    if (Array.isArray(expected)) {
      if (!Array.isArray(actual) || actual.length !== expected.length) return false;
      return expected.every(function (item, index) { return equalStateValue(actual[index], item); });
    }
    if (isObject(expected)) {
      if (!isObject(actual)) return false;
      return Object.keys(expected).every(function (key) {
        return equalStateValue(actual[key], expected[key]);
      });
    }
    return actual === expected;
  }

  function matchesWhen(when, appState) {
    if (!isObject(when)) return true;
    return Object.keys(when).every(function (path) {
      var includesSuffix = '.includes';
      if (path.slice(-includesSuffix.length) === includesSuffix) {
        var collection = readStatePath(appState, path.slice(0, -includesSuffix.length));
        return Array.isArray(collection) && collection.indexOf(when[path]) !== -1;
      }
      return equalStateValue(readStatePath(appState, path), when[path]);
    });
  }

  function visibleCards(cards, appState) {
    if (!Array.isArray(cards)) return [];
    return cards.filter(function (card) {
      return !card.when || matchesWhen(card.when, appState);
    });
  }

  window.PrototypeNotesModel = {
    listScenarioIds: listScenarioIds,
    scenarioLabel: scenarioLabel,
    readStatePath: readStatePath,
    equalStateValue: equalStateValue,
    matchesWhen: matchesWhen,
    visibleCards: visibleCards
  };
})();
