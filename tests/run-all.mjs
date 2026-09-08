import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';import path from 'node:path';
const here=path.dirname(fileURLToPath(import.meta.url));
const tests=[
  'model.test.mjs','roundtrip-app-bridge.test.mjs','roundtrip-plugin.test.mjs','roundtrip-conversion.test.mjs','roundtrip-node.test.mjs','roundtrip-ui.test.mjs','roundtrip-history.test.mjs','roundtrip-neutral-ir.test.mjs','roundtrip-adapter-sdk.test.mjs','roundtrip-engine.test.mjs',
  'drawio-io.test.mjs','drawio-app-integration.test.mjs','runtime-modules.test.mjs','dock-layout.test.mjs','dock-ui-integration.test.mjs','tooltips.test.mjs','tooltips-app-integration.test.mjs','component-lab-integration.test.mjs','hotkeys.test.mjs','page-entities.test.mjs','tab-functionality.test.mjs','roundtrip-pwtk.test.mjs','roundtrip-qml.test.mjs','workspace-roundtrip-files.test.mjs','project-import-ui.test.mjs',
];
let failed=0;for(const file of tests){const r=spawnSync(process.execPath,[path.join(here,file)],{stdio:'inherit'});if(r.status!==0)failed++;}
if(failed){console.error(`${failed} test suite(s) failed`);process.exit(1)}console.log(`ALL TESTS PASSED (${tests.length} suites)`);
