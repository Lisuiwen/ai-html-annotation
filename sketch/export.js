/* Rasterize the board only. Toolbar stays outside .board and is not cloned. */

import { FRAME } from './sizing.js';

async function inlineStyles() {
  const chunks = [];
  const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  for (const link of links) {
    const response = await fetch(link.href);
    if (response.ok) chunks.push(await response.text());
  }
  document.querySelectorAll('style[data-pack]').forEach((style) => {
    chunks.push(style.textContent);
  });
  return chunks.join('\n').replaceAll(':root', ':root, .export-root');
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not rasterize the board'));
    image.src = src;
  });
}

export async function downloadBoardPng(board) {
  const underlay = board.querySelector('.board-underlay');
  const underlaySrc = underlay && !underlay.hidden ? underlay.src : '';
  const css = await inlineStyles();
  const clone = board.cloneNode(true);
  const liveCanvases = board.querySelectorAll('canvas');
  clone.querySelectorAll('canvas').forEach((node, index) => {
    const source = liveCanvases[index];
    if (!source || !source.width) return;
    const image = document.createElement('img');
    image.src = source.toDataURL('image/png');
    image.width = source.width;
    image.height = source.height;
    image.style.width = '100%';
    image.style.height = '100%';
    node.replaceWith(image);
  });
  clone.querySelectorAll('.handle, .stamp-hit').forEach((node) => node.remove());
  clone.querySelectorAll('.is-selected').forEach((node) => node.classList.remove('is-selected'));
  const clonedUnderlay = clone.querySelector('.board-underlay');
  if (clonedUnderlay) clonedUnderlay.remove();
  clone.style.background = 'transparent';
  clone.style.overflow = 'hidden';
  clone.style.margin = '0';
  clone.style.transform = 'none';
  const frameWidth = board.offsetWidth || FRAME.width;
  const frameHeight = board.offsetHeight || FRAME.height;
  clone.style.width = frameWidth + 'px';
  clone.style.height = frameHeight + 'px';

  const wrapper = document.createElement('div');
  wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  wrapper.className = 'export-root';
  wrapper.style.cssText = 'width:' + frameWidth + 'px;height:' + frameHeight + 'px;margin:0;overflow:hidden;background:transparent';
  const style = document.createElement('style');
  style.textContent = css;
  wrapper.append(style, clone);

  const serialized = new XMLSerializer().serializeToString(wrapper).replaceAll('&nbsp;', '&#160;');
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + frameWidth + '" height="' + frameHeight + '">'
    + '<foreignObject x="0" y="0" width="' + frameWidth + '" height="' + frameHeight + '">'
    + serialized
    + '</foreignObject></svg>';

  const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  const image = await loadImage(svgUrl);
  const canvas = document.createElement('canvas');
  canvas.width = frameWidth;
  canvas.height = frameHeight;
  const ctx = canvas.getContext('2d');
  const page = getComputedStyle(board).backgroundColor;
  ctx.fillStyle = page && page !== 'rgba(0, 0, 0, 0)' ? page : '#f3f4f7';
  ctx.fillRect(0, 0, frameWidth, frameHeight);
  if (underlaySrc) {
    const photo = await loadImage(underlaySrc);
    ctx.drawImage(photo, 0, 0, frameWidth, frameHeight);
  }
  ctx.drawImage(image, 0, 0, frameWidth, frameHeight);

  const blob = await new Promise((resolve, reject) => {
    try {
      canvas.toBlob((value) => {
        if (value) resolve(value);
        else reject(new Error('Could not encode the screenshot'));
      }, 'image/png');
    } catch (error) {
      reject(error);
    }
  });

  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  const name = 'sketch-' + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate())
    + '-' + pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds()) + '.png';
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}
