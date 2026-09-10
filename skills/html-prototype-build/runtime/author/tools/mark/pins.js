/* Mark Pin: positioned relative to the target element; stays anchored on page zoom. */
(function () {
  'use strict';

  var repoRaf = 0;

  function positionPin(ann) {
    var target = ann.targetEl;
    if (target && target.nodeType === 1 && target.isConnected && typeof ann.relX === 'number') {
      var rect = target.getBoundingClientRect();
      if (rect.width || rect.height) {
        ann.pageX = rect.left + window.scrollX + ann.relX * rect.width;
        ann.pageY = rect.top + window.scrollY + ann.relY * rect.height;
      }
    }
    if (ann.pinEl) {
      ann.pinEl.style.left = (ann.pageX - 11) + 'px';
      ann.pinEl.style.top = (ann.pageY - 11) + 'px';
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
