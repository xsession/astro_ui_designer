import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';import path from 'node:path';
const here=path.dirname(fileURLToPath(import.meta.url));
const tests=[
  'model.test.mjs','roundtrip-app-bridge.test.mjs','roundtrip-plugin.test.mjs','roundtrip-conversion.test.mjs','roundtrip-node.test.mjs','roundtrip-ui.test.mjs','roundtrip-history.test.mjs','roundtrip-neutral-ir.test.mjs','roundtrip-adapter-sdk.test.mjs','roundtrip-engine.test.mjs',
  'runtime-modules.test.mjs',
];
let failed=0;for(const file of tests){const r=spawnSync(process.execPath,[path.join(here,file)],{stdio:'inherit'});if(r.status!==0)failed++;}
if(failed){console.error(`${failed} test suite(s) failed`);process.exit(1)}console.log(`ALL TESTS PASSED (${tests.length} suites)`);
