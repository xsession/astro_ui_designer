import assert from 'node:assert/strict';
import { createProject, createNode } from '../standalone/js/model.js';
import { generateAstroProject } from '../standalone/js/astro-exporter.js';

const project=createProject();
const root=project.pages[0].root;
const row=createNode('row',{name:'AlignmentRow'});
row.style.base.textAlign='justify';
row.style.base.justifyContent='flex-end';
row.style.base.alignItems='center';
root.children.push(row);
const grid=createNode('grid',{name:'AlignmentGrid'});
grid.style.base.justifyItems='end';
grid.style.base.alignItems='center';
root.children.push(grid);

const files=generateAstroProject(project);
const css=files['src/styles/global.css'];
assert.match(css,/text-align:\s*justify;/,'text alignment exported');
assert.match(css,/justify-content:\s*flex-end;/,'flex horizontal content alignment exported');
assert.match(css,/align-items:\s*center;/,'vertical content alignment exported');
assert.match(css,/justify-items:\s*end;/,'grid horizontal content alignment exported');
console.log('alignment-controls.test: OK');
