import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const ws = require(path.join(root, 'lib', 'workspace.js'));
const { designerHtml } = require(path.join(root, 'lib', 'webview.js'));

let passed = 0;
function test(name, fn) {
  try { fn(); console.log(`PASS ${name}`); passed++; }
  catch (error) { console.error(`FAIL ${name}`); throw error; }
}

test('extension manifest exposes visual editor, view, tasks and commands', () => {
  assert.equal(pkg.main, './extension.js');
  assert.ok(pkg.engines.vscode);
  assert.ok(pkg.contributes.customEditors.some((x) => x.viewType === 'astroUIDesigner.visualEditor'));
  assert.ok(pkg.contributes.views.astroUIDesigner.some((x) => x.id === 'astroUIDesigner.workspaceView'));
  assert.ok(pkg.contributes.taskDefinitions.some((x) => x.type === 'astro-ui-designer'));
  const ids = new Set(pkg.contributes.commands.map((x) => x.command));
  for (const id of ['astroUIDesigner.openDesigner','astroUIDesigner.openActiveFile','astroUIDesigner.openComponentLab','astroUIDesigner.openAnimation','astroUIDesigner.openLayoutTools','astroUIDesigner.openInterchange','astroUIDesigner.validate','astroUIDesigner.runTests','astroUIDesigner.exportProject']) assert.ok(ids.has(id), id);
  assert.equal(pkg.capabilities.untrustedWorkspaces.supported, false);
});

test('extension JavaScript parses without build step', () => {
  execFileSync(process.execPath, ['--check', path.join(root, 'extension.js')], { stdio: 'pipe' });
  execFileSync(process.execPath, ['--check', path.join(root, 'designer', 'js', 'app.js')], { stdio: 'pipe' });
  execFileSync(process.execPath, ['--check', path.join(root, 'designer', 'js', 'workspace-client.js')], { stdio: 'pipe' });
});

test('workspace scanner discovers Astro, React, Vue and Svelte components', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aui-vscode-'));
  fs.mkdirSync(path.join(tmp, 'src', 'pages'), { recursive: true });
  fs.mkdirSync(path.join(tmp, 'src', 'components'), { recursive: true });
  fs.writeFileSync(path.join(tmp, 'package.json'), JSON.stringify({ dependencies: { astro: '^7.0.0' }, scripts: { dev: 'astro dev' } }));
  fs.writeFileSync(path.join(tmp, 'astro.config.mjs'), 'export default {}');
  fs.writeFileSync(path.join(tmp, 'src', 'pages', 'index.astro'), '<main data-ui-id="home">Home</main>');
  fs.writeFileSync(path.join(tmp, 'src', 'components', 'Card.astro'), '---\ninterface Props { title: string; active?: boolean }\n---\n<article><slot /></article>');
  fs.writeFileSync(path.join(tmp, 'src', 'components', 'Thing.tsx'), 'export function Thing(props: { size: number; mode: "a" | "b" }) { return <div/> }');
  fs.writeFileSync(path.join(tmp, 'src', 'components', 'Panel.vue'), '<script setup lang="ts">defineProps<{ title: string }>()</script><template><slot /></template>');
  fs.writeFileSync(path.join(tmp, 'src', 'components', 'Badge.svelte'), '<script lang="ts">export let label: string;</script><span>{label}</span>');
  const scan = ws.scanWorkspace(tmp);
  assert.equal(scan.astro.filter((x) => x.kind === 'page').length, 1);
  assert.ok(scan.components.some((x) => x.framework === 'astro' && x.props.some((p) => p.name === 'title')));
  assert.ok(scan.components.some((x) => x.framework === 'react'));
  assert.ok(scan.components.some((x) => x.framework === 'vue'));
  assert.ok(scan.components.some((x) => x.framework === 'svelte'));
  assert.equal(ws.isAstroWorkspace(tmp), true);
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('workspace file safety rejects path traversal', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aui-safe-'));
  assert.throws(() => ws.safeJoin(tmp, '../outside.txt'), /escapes workspace/);
  const inside = ws.safeJoin(tmp, 'src/index.astro');
  assert.ok(inside.startsWith(tmp));
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('webview HTML contains CSP, VS Code bridge and designer module', () => {
  const fakeWebview = {
    cspSource: 'vscode-webview://test',
    asWebviewUri(uri) { return { toString: () => `vscode-resource://${uri.fsPath.replaceAll('\\\\','/')}` }; },
  };
  const Uri = { file: (fsPath) => ({ fsPath }) };
  const html = designerHtml(root, fakeWebview, Uri);
  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /acquireVsCodeApi/);
  assert.match(html, /workspaceRequest/);
  assert.match(html, /designerCallResult/);
  assert.match(html, /vscode-resource:\/\//);
});

test('designer workspace client supports VS Code request bridge', () => {
  const source = fs.readFileSync(path.join(root, 'designer', 'js', 'workspace-client.js'), 'utf8');
  assert.match(source, /__ASTRO_UI_VSCODE__/);
  assert.match(source, /\.request\(path,body\)/);
});

test('designer public API exposes VS Code integration methods', () => {
  const source = fs.readFileSync(path.join(root, 'designer', 'js', 'app.js'), 'utf8');
  for (const name of ['openWorkspacePath','refreshWorkspace','openSourceFile','loadProjectObject','toggleLivePreview','runCurrentStoryTests','getStoryResult']) assert.ok(source.includes(`${name}:`), name);
});

test('all packaged designer module imports resolve', () => {
  const jsDir = path.join(root, 'designer', 'js');
  for (const file of fs.readdirSync(jsDir).filter((x) => x.endsWith('.js'))) {
    const source = fs.readFileSync(path.join(jsDir, file), 'utf8');
    for (const match of source.matchAll(/from\s+['"](\.\/.+?\.js)['"]/g)) assert.ok(fs.existsSync(path.resolve(jsDir, match[1])), `${file}: ${match[1]}`);
  }
});

console.log(`\nAstro UI Designer VS Code extension: ${passed} tests passed.`);
