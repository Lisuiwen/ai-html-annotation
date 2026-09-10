/* Author-tool platform detection: macOS modifier labels and picker/save gesture rules. */
(function () {
  'use strict';

  if (window.AuthorToolsPlatform) return;

  var IS_MAC = /Mac|iPhone|iPad|iPod/.test(navigator.platform || '') ||
    (navigator.userAgentData && navigator.userAgentData.platform === 'macOS');

  function modifierActive(event, macAcceptsCtrl) {
    if (!event) return false;
    if (IS_MAC) return !!(event.metaKey || (macAcceptsCtrl && event.ctrlKey));
    return !!event.ctrlKey;
  }

  window.AuthorToolsPlatform = {
    isMac: function () { return IS_MAC; },
    clickModifierLabel: function () { return IS_MAC ? '⌘' : 'Ctrl'; },
    pickerModifierActive: function (event) {
      return modifierActive(event, true);
    },
    pickerClickModifier: function (event) {
      if (!event) return false;
      if (IS_MAC) return !!event.metaKey;
      return !!event.ctrlKey;
    },
    saveModifierActive: function (event) {
      return modifierActive(event, true);
    }
  };
})();
