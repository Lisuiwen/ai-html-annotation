/* Avatar 局部状态投影：切换图片、文字与图标兜底，不生成头像资源。 */
(function () {
  'use strict'; var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* 归一化头像展示状态。 */
  function normalize(value) { var state = value && typeof value === 'object' ? value : {}; return { src: typeof state.src === 'string' ? state.src : '', text: typeof state.text === 'string' ? state.text : '', size: ['sm', 'default', 'lg'].indexOf(state.size) !== -1 ? state.size : 'default', shape: ['circle', 'square'].indexOf(state.shape) !== -1 ? state.shape : 'circle' }; }
  /* 同步头像尺寸、形状与内容模式。 */
  function render(root, value) { if (!root) return; var state = normalize(value); var mode = state.src ? 'image' : (state.text ? 'text' : 'icon'); root.classList.toggle('ui-avatar--sm', state.size === 'sm'); root.classList.toggle('ui-avatar--lg', state.size === 'lg'); root.classList.toggle('ui-avatar--square', state.shape === 'square'); var img = root.querySelector('img'); var text = root.querySelector('.ui-avatar-text'); var icon = root.querySelector('.ui-avatar-icon'); if (img) { if (mode === 'image') { img.src = state.src; img.hidden = false; } else { img.hidden = true; img.removeAttribute('src'); } } if (text) { text.hidden = mode !== 'text'; if (mode === 'text') text.textContent = state.text; } if (icon) icon.hidden = mode !== 'icon'; if (mode === 'image') root.removeAttribute('aria-label'); else root.setAttribute('aria-label', state.text || '用户'); }
  adapters['data.avatar'] = { normalize: normalize, render: render };
})();
