import assert from 'node:assert/strict';
import { createProject, createNode, insertNode, duplicateNode, findNode, migrateProject } from '../standalone/js/model.js';

const p=createProject();
const root=p.pages[0].root;
const section=createNode('section',{name:'SectionA'});
insertNode(root,root.id,section);
assert.equal(findNode(root,section.id).name,'SectionA');
const clone=duplicateNode(root,section.id);
assert.ok(clone && clone.id!==section.id);
assert.equal(root.children.length,2);
const old={schemaVersion:1,name:'old',settings:{},pages:p.pages,assets:[]};
const migrated=migrateProject(old);
assert.equal(migrated.schemaVersion,8);
assert.ok(migrated.workspace && migrated.content && migrated.locales && migrated.editor);
assert.ok(migrated.theme?.themes?.default);
assert.ok(Array.isArray(migrated.components));
console.log('model.test: OK');
