import assert from 'node:assert/strict';
import { COMPONENTS, STYLE_GROUPS, ACTION_TYPES } from '../standalone/js/registry.js';
import { createProject, createNode } from '../standalone/js/model.js';
import { generateAstroProject } from '../standalone/js/astro-exporter.js';

const ids = new Set();
for (const [type, spec] of Object.entries(COMPONENTS)) {
  assert.ok(spec.label, `${type}: label`);
  assert.ok(spec.category, `${type}: category`);
  assert.equal(typeof spec.acceptsChildren, 'boolean', `${type}: acceptsChildren`);
  const node = createNode(type);
  assert.equal(node.type, type);
  assert.ok(node.id && !ids.has(node.id), `${type}: unique id`);
  ids.add(node.id);
  assert.ok(node.style.base, `${type}: base style`);
  for (const field of spec.fields || []) {
    assert.ok(field.key && field.label && field.kind, `${type}: valid field`);
    assert.ok(Object.prototype.hasOwnProperty.call(node.props, field.key), `${type}.${field.key}: default prop exists`);
    if (field.kind === 'select') assert.ok(field.options.length > 0, `${type}.${field.key}: select options`);
  }
}

const styleKeys = new Set();
for (const group of STYLE_GROUPS) {
  assert.ok(group.name && group.fields.length);
  for (const field of group.fields) {
    assert.ok(!styleKeys.has(field.key), `duplicate style field ${field.key}`);
    styleKeys.add(field.key);
  }
}

const actionIds = new Set();
for (const action of ACTION_TYPES) {
  assert.ok(action.id && action.label);
  assert.ok(!actionIds.has(action.id), `duplicate action ${action.id}`);
  actionIds.add(action.id);
}

// Every palette-visible primitive must survive Astro generation with a stable data-ui-id.
for (const [type, spec] of Object.entries(COMPONENTS)) {
  if (spec.paletteHidden || spec.componentDefinitionOnly || type === 'page') continue;
  const p = createProject();
  const node = createNode(type);
  p.pages[0].root.children.push(node);
  const files = generateAstroProject(p);
  const source = files['src/pages/index.astro'];
  assert.equal(typeof source, 'string', `${type}: page output`);
  assert.ok(source.includes(node.id) || type === 'island', `${type}: generated output references node`);
}

console.log(`gui-elements.test: OK (${Object.keys(COMPONENTS).length} component types, ${styleKeys.size} style fields, ${ACTION_TYPES.length} actions)`);
