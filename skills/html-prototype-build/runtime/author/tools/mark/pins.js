/* Mark Pin: positioned relative to the target element; stays anchored on page zoom. */
(function () {
  'use strict';

  var repoRaf = 0;

  /* Pins live on document.body, so a target inside a closed popup would keep its last screen point. */
  function isTargetLaidOut(target) {
    if (!target || target.nodeType !== 1 || !target.isConnected) return false;
    if (typeof target.checkVisibility === 'function') {
      try {
        if (!target.checkVisibility({ checkOpacity: false, checkVisibilityCSS: true })) return false;
      } catch (_) {
        if (!target.checkVisibility()) return false;
      }
    } else if (typeof window.getComputedStyle === 'function') {
      var node = target;
      while (node && node.nodeType === 1) {
        var style = window.getComputedStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse') return false;
        node = node.parentElement;
      }
    }
    var rect = target.getBoundingClientRect();
    return !!(rect && (rect.width || rect.height));
  }

  function positionPin(ann) {
    var target = ann.targetEl;
    var laidOut = isTargetLaidOut(target);
    if (laidOut && typeof ann.relX === 'number') {
      var rect = target.getBoundingClientRect();
      ann.pageX = rect.left + window.scrollX + ann.relX * rect.width;
      ann.pageY = rect.top + window.scrollY + ann.relY * rect.height;
    }
    if (ann.pinEl) {
      ann.pinEl.style.left = (ann.pageX - 11) + 'px';
      ann.pinEl.style.top = (ann.pageY - 11) + 'px';
      if (ann.pinEl.classList && target && target.nodeType === 1) {
        ann.pinEl.classList.toggle('mm-pin-hidden', !laidOut);
      }
    }
  }

  function scheduleReposition(annotations) {
    if (repoRaf) return;
    repoRaf = requestAnimationFrame(function () {
      repoRaf = 0;
      annotations.forEach(positionPin);
    });
  }

  function buildPin(ann, handlers) {
    var pin = document.createElement('div');
    pin.className = 'mm-pin';
    pin.dataset.id = ann.id;
    pin.appendChild(document.createTextNode(String(ann.id)));

    var del = document.createElement('span');
    del.className = 'mm-pin-del';
    del.textContent = '×';
    del.addEventListener('click', function (event) {
      event.stopPropagation();
      if (handlers && handlers.onRemove) handlers.onRemove(parseInt(pin.dataset.id, 10));
    });
    pin.appendChild(del);

    pin.addEventListener('click', function (event) {
      event.stopPropagation();
      if (event.target === del) return;
      if (handlers && handlers.onOpen) handlers.onOpen(ann);
    });

    document.body.appendChild(pin);
    ann.pinEl = pin;
    positionPin(ann);
    return pin;
  }

  window.AuthorToolsMarkPins = {
    build: buildPin,
    position: positionPin,
    scheduleReposition: scheduleReposition
  };
})();
