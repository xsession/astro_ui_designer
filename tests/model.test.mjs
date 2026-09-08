import assert from 'node:assert/strict';
import { createSampleProject, createNode, findNode, duplicateNode, migrateProject } from '../standalone/js/model.js';
const p=createSampleProject();assert.ok(p.pages.length>=2);const root=p.pages[0].root;const n=createNode('text',{props:{text:'Smoke'}});root.children.push(n);assert.equal(findNode(root,n.id).props.text,'Smoke');assert.ok(migrateProject(p).schemaVersion>=8);console.log('model.test.mjs passed');
