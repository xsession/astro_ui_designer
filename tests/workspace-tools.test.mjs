import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { scanWorkspace, safeRoot, safeJoin, readFile, writeFile } from '../workspace-tools.mjs';

const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'astro-designer-workspace-'));
try{
  fs.mkdirSync(path.join(tmp,'src/pages'),{recursive:true});
  fs.mkdirSync(path.join(tmp,'src/components'),{recursive:true});
  fs.writeFileSync(path.join(tmp,'package.json'),JSON.stringify({name:'fixture',scripts:{dev:'astro dev'}}));
  fs.writeFileSync(path.join(tmp,'src/pages/index.astro'),'<main data-ui-id="root">Home</main>');
  fs.writeFileSync(path.join(tmp,'src/components/Card.astro'),`---\ninterface Props { title: string; active?: boolean; }\n---\n<article data-ui-id="card"><slot /></article>`);
  fs.writeFileSync(path.join(tmp,'src/components/ReactCard.tsx'),`interface Props { title: string; count?: number; children?: any }
export default function ReactCard(props: Props){ return <article>{props.title}{props.children}</article> }`);
  fs.writeFileSync(path.join(tmp,'src/components/VueCard.vue'),`<script setup lang="ts">const props=defineProps<{ title: string; active?: boolean }>()</script><template><article><slot /></article></template>`);
  fs.writeFileSync(path.join(tmp,'src/components/SvelteCard.svelte'),`<script lang="ts">export let title: string; export let count: number = 0;</script><article><slot /></article>`);
  const root=safeRoot(tmp); const scan=await scanWorkspace(root);
  assert.ok(scan.files.includes('src/pages/index.astro'));
  const card=scan.astro.find(x=>x.relativePath==='src/components/Card.astro');
  assert.equal(card.kind,'component'); assert.deepEqual(card.props.map(x=>x.name),['title','active']); assert.deepEqual(card.slots,['default']); assert.deepEqual(card.uiIds,['card']);
  const react=scan.components.find(x=>x.relativePath==='src/components/ReactCard.tsx');assert.equal(react.framework,'react');assert.deepEqual(react.props.map(x=>x.name),['title','count','children']);assert.deepEqual(react.slots,['default']);
  const vue=scan.components.find(x=>x.relativePath==='src/components/VueCard.vue');assert.equal(vue.framework,'vue');assert.deepEqual(vue.props.map(x=>x.name),['title','active']);assert.deepEqual(vue.slots,['default']);
  const svelte=scan.components.find(x=>x.relativePath==='src/components/SvelteCard.svelte');assert.equal(svelte.framework,'svelte');assert.deepEqual(svelte.props.map(x=>x.name),['title','count']);assert.deepEqual(svelte.slots,['default']);
  assert.throws(()=>safeJoin(root,'../escape.txt'));
  writeFile(root,'src/pages/about.astro','<main>About</main>');
  assert.equal(readFile(root,'src/pages/about.astro'),'<main>About</main>');
} finally { fs.rmSync(tmp,{recursive:true,force:true}); }
console.log('workspace-tools.test: OK');
