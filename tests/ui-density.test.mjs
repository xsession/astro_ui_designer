import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const html=fs.readFileSync(path.join(root,'standalone/index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'standalone/styles.css'),'utf8');
const app=fs.readFileSync(path.join(root,'standalone/js/app.js'),'utf8');
const workbenches=fs.readFileSync(path.join(root,'standalone/js/functional-workbenches.js'),'utf8');

for(const name of ['edit','arrange','tools']) assert.match(html,new RegExp(`data-toolbar-menu="${name}"`),`toolbar must expose ${name} progressive-disclosure menu`);
for(const id of ['cut-btn','copy-btn','paste-btn','duplicate-btn','delete-btn','wrap-row-btn','wrap-col-btn','align-left-btn','dist-v-btn','workspace-btn','live-preview-btn','dock-layout-btn']) assert.match(html,new RegExp(`id="${id}"`),`${id} must remain reachable after toolbar refactor`);
assert.match(html,/id="import-project-btn"[^>]*>Import</,'project import stays directly discoverable');
assert.match(html,/class="tool-group mode-switch"/,'editor modes use a compact segmented switch');
assert.match(html,/2\.21 Editor UX/,'product title should be concise and release-specific');
assert.match(css,/\/\* 2\.21 Editor UX/);
assert.match(css,/\.dock-tabs button\.active::after/,'dock tabs use a quiet active indicator');
assert.match(css,/\.toolbar-menu-panel/,'toolbar menus are styled as compact overlays');
assert.match(css,/\.property-section>summary::before/,'inspector sections have compact disclosure affordance');
assert.match(app,/SECTION_DISCLOSURE_STORAGE_KEY/,'inspector disclosure state should persist');
assert.match(app,/persistSectionDisclosure/,'inspector disclosure toggles should be saved');
assert.match(app,/toolbar-menu-panel button/,'toolbar menus close after invoking a command');
for(const label of ['Identity & access','Flex / Grid','Position','Node CSS','Available sources','Strokes / Shadows / Blur','Global variants','Args / controls']){
  assert.ok(!workbenches.includes(`<details class="property-section" open><summary>${label}`),`${label} should default collapsed to reduce overload`);
}
for(const rel of ['index.html','styles.css','js/app.js','js/functional-workbenches.js']){
  assert.equal(fs.readFileSync(path.join(root,'standalone',rel),'utf8'),fs.readFileSync(path.join(root,'vscode-extension/designer',rel),'utf8'),`${rel} standalone/VS Code parity`);
}
console.log('ui-density.test.mjs passed');
