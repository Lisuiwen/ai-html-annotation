import { renameSync, writeFileSync } from 'node:fs';

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validateWhenValue(value, depth = 0) {
  if (depth > 8) return false;
  if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) return true;
  if (Array.isArray(value)) return value.every((item) => validateWhenValue(item, depth + 1));
  return isObject(value) && Object.keys(value).every((key) => key && validateWhenValue(value[key], depth + 1));
}

function validateScenarios(scenarios) {
  if (Array.isArray(scenarios)) {
    return scenarios.length > 0 && scenarios.every((scenario) => (
      isObject(scenario) && typeof scenario.id === 'string' && scenario.id.length > 0
      && (scenario.state === undefined || isObject(scenario.state))
    ));
  }
  return isObject(scenarios) && Object.keys(scenarios).length > 0
    && Object.entries(scenarios).every(([id, scenario]) => (
      id.length > 0 && isObject(scenario) && (scenario.state === undefined || isObject(scenario.state))
    ));
}

export function validateSnapshot(data) {
  if (!isObject(data) || data.schemaVersion !== 2) return false;
  if (!isObject(data.header) || typeof data.header.title !== 'string' || !Array.isArray(data.cards)) return false;
  if (data.scenarios === undefined || !validateScenarios(data.scenarios)) return false;
  return data.cards.every((card) => {
    if (!isObject(card) || typeof card.id !== 'string' || !isObject(card.target)) return false;
    const hasSelector = typeof card.target.selector === 'string';
    const hasAnchor = typeof card.target.anchor === 'string' && card.target.anchor.length > 0;
    if (!hasAnchor && !hasSelector) return false;
    return card.when === undefined || (isObject(card.when) && validateWhenValue(card.when));
  });
}

export function serializeSnapshot(data) {
  return `/* 原型正式标注唯一数据源；由 prototype-author 编辑器维护。 */\nwindow.__PROTOTYPE_NOTES__ = ${JSON.stringify(data, null, 2)};\n`;
}

export function writeSnapshot(filePath, data) {
  const temp = `${filePath}.tmp`;
  writeFileSync(temp, serializeSnapshot(data), 'utf8');
  renameSync(temp, filePath);
}
