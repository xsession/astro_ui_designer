import { spawnSync } from 'node:child_process';
const tests=[
  'model.test.mjs','animation.test.mjs','validator.test.mjs','exporter.test.mjs','research-features.test.mjs','workspace-tools.test.mjs','plugin-api.test.mjs','export-research.test.mjs','gui-elements.test.mjs',
  'shell-controls.test.mjs','ux-regression.test.mjs','editor-panels.test.mjs','interaction-parity.test.mjs','gui-browser.test.mjs','research-browser.test.mjs','animation-browser.test.mjs','visual-smoke.mjs','generate-example.mjs'
];
for(const file of tests){
  const r=spawnSync(process.execPath,[new URL(file,import.meta.url).pathname],{stdio:'inherit'});
  if(r.status!==0)process.exit(r.status||1);
}
console.log(`\nALL TESTS PASSED (${tests.length} suites)`);
