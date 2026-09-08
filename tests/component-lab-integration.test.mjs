import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync(new URL('../standalone/index.html',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../standalone/js/app.js',import.meta.url),'utf8');
for(const id of ['component-lab-pane','lab-component-select','lab-story-list','lab-preview-root','lab-addon-content','lab-new-story','lab-run-tests'])assert.match(html,new RegExp(`id=["']${id}["']`));
for(const token of ['function componentLabSelection','function renderComponentLab','function runComponentLabTests','materializeStoryComponent','saveVisualBaseline','compareVisualBaseline'])assert.ok(app.includes(token),`${token} missing`);
assert.match(app,/if\(state\.mode==='lab'\)renderComponentLab\(\)/);
assert.equal(app,fs.readFileSync(new URL('../vscode-extension/designer/js/app.js',import.meta.url),'utf8'),'VS Code app mirror must match');
console.log('component-lab-integration.test.mjs passed');
