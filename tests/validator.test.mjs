import assert from 'node:assert/strict';
import { createProject, createNode } from '../standalone/js/model.js';
import { validateProject } from '../standalone/js/validator.js';

const p=createProject();
p.pages[0].root.children.push(createNode('image',{props:{src:'/x.png',alt:''}}));
p.pages.push({...structuredClone(p.pages[0]),id:'page-2',route:'/',name:'Duplicate'});
let issues=validateProject(p);
assert.ok(issues.some(x=>x.code==='A11Y01'));
assert.ok(issues.some(x=>x.code==='P010'));
console.log('validator.test: OK');
