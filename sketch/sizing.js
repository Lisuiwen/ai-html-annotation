/* Turn a pack atom's resize declaration into the stamp spec the board lays out. */

export const FRAME = { width: 1440, height: 900 };

const AXES = new Set(['none', 'x', 'y', 'both']);

export function resolveSizing(atom) {
  const source = atom || {};
  const axis = AXES.has(source.resize) ? source.resize : 'none';
  if (axis === 'none') {
    return { axis, width: null, height: null, minWidth: 1, minHeight: 1, lockWidth: false, lockHeight: false };
  }
  return {
    axis,
    width: source.width ?? null,
    height: source.height ?? null,
    minWidth: source.minWidth ?? null,
    minHeight: source.minHeight ?? null,
    lockWidth: axis === 'y',
    lockHeight: axis === 'x' && source.height != null
  };
}
