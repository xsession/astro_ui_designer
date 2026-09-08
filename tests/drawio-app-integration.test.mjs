import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync('standalone/js/app.js','utf8');
const html=fs.readFileSync('standalone/index.html','utf8');
const platform=fs.readFileSync('standalone/js/platform-io.js','utf8');
const mirror=fs.readFileSync('vscode-extension/designer/js/app.js','utf8');

assert.match(html,/data-bottom-tab="interchange"/);
assert.match(app,/renderInterchangePanel/);
assert.match(app,/Import \.drawio/);
assert.match(app,/Export \.drawio/);
assert.match(app,/importDrawioText/);
assert.match(app,/exportDrawioText/);
assert.match(platform,/Draw\.io \/ diagrams\.net/);
assert.match(platform,/DRAWIO_EXTENSIONS/);
assert.match(mirror,/renderInterchangePanel/);
assert.match(mirror,/exportDrawioText/);
console.log('drawio-app-integration.test.mjs passed');
