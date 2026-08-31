'use strict';

const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const cp = require('child_process');
const os = require('os');
const { designerHtml } = require('./lib/webview');
const workspaceTools = require('./lib/workspace');

const VIEW_TYPE = 'astroUIDesigner.visualEditor';
const PANEL_TYPE = 'astroUIDesigner.designerPanel';
const OUTPUT_NAME = 'Astro UI Designer';

let extensionContext;
let output;
let diagnostics;
let statusBar;
let workspaceTree;
let designerHost;
let previewManager;
let testController;

class PreviewManager {
  constructor() { this.byRoot = new Map(); }
  start(root) {
    root = workspaceTools.safeRoot(root);
    const existing = this.byRoot.get(root);
    if (existing && !existing.process.killed) return Promise.resolve({ url: existing.url, running: true });
    const pkg = workspaceTools.readJson(root, 'package.json') || {};
    const config = vscode.workspace.getConfiguration('astroUIDesigner');
    const configured = String(config.get('previewCommand') || '').trim();
    let command;
    let args;
    if (configured) {
      if (process.platform === 'win32') { command = process.env.ComSpec || 'cmd.exe'; args = ['/d', '/s', '/c', configured]; }
      else { command = process.env.SHELL || '/bin/sh'; args = ['-lc', configured]; }
    } else if (pkg.scripts?.dev) {
      command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
      args = ['run', 'dev', '--', '--host', '127.0.0.1'];
    } else {
      throw new Error('No preview command configured and package.json has no dev script.');
    }
    output.appendLine(`[preview] ${root}`);
    output.appendLine(`[preview] ${command} ${args.join(' ')}`);
    return new Promise((resolve, reject) => {
      const child = cp.spawn(command, args, { cwd: root, env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
      const state = { process: child, url: 'http://127.0.0.1:4321/', resolved: false };
      this.byRoot.set(root, state);
      const onData = (chunk) => {
        const text = String(chunk);
        output.append(text);
        const match = text.match(/https?:\/\/(?:127\.0\.0\.1|localhost|0\.0\.0\.0|\[[^\]]+\]|[\w.-]+):\d+\/?/i);
        if (match) {
          state.url = match[0].replace('localhost', '127.0.0.1').replace('0.0.0.0', '127.0.0.1');
          if (!state.resolved) { state.resolved = true; resolve({ url: state.url, running: true }); }
        }
      };
      child.stdout.on('data', onData);
      child.stderr.on('data', onData);
      child.on('error', (error) => {
        this.byRoot.delete(root);
        if (!state.resolved) reject(error);
      });
      child.on('exit', (code) => {
        output.appendLine(`[preview] exited with code ${code}`);
        this.byRoot.delete(root);
        if (!state.resolved) reject(new Error(`Preview process exited before startup (code ${code})`));
      });
      setTimeout(() => {
        if (!state.resolved && !child.killed) { state.resolved = true; resolve({ url: state.url, running: true }); }
      }, 1800);
    });
  }
  stop(root) {
    root = path.resolve(root || '');
    const state = this.byRoot.get(root);
    if (!state) return { running: false };
    try {
      if (process.platform === 'win32') cp.spawnSync('taskkill', ['/pid', String(state.process.pid), '/t', '/f']);
      else state.process.kill('SIGTERM');
    } catch {}
    this.byRoot.delete(root);
    return { running: false };
  }
  stopAll() { for (const root of [...this.byRoot.keys()]) this.stop(root); }
}

function workspaceRootForUri(uri) {
  const folder = uri ? vscode.workspace.getWorkspaceFolder(uri) : undefined;
  if (folder) return folder.uri.fsPath;
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
}

function isAllowedRoot(root, fallbackRoot = '') {
  const resolved = path.resolve(String(root || fallbackRoot || ''));
  if (!resolved) return '';
  const roots = (vscode.workspace.workspaceFolders || []).map((f) => path.resolve(f.uri.fsPath));
  if (fallbackRoot) roots.push(path.resolve(fallbackRoot));
  return roots.find((r) => resolved === r) || '';
}

function normalizeRelative(root, uri) {
  if (!root || !uri) return '';
  return path.relative(root, uri.fsPath).split(path.sep).join('/');
}

function parseGitStatus(text) {
  return String(text || '').split(/\r?\n/).filter(Boolean);
}

class WebviewSession {
  constructor(panel, options = {}) {
    this.panel = panel;
    this.uri = options.uri;
    this.fallbackRoot = options.fallbackRoot || (this.uri ? path.dirname(this.uri.fsPath) : '');
    this.ready = false;
    this.pending = new Map();
    this.seq = 0;
    this.disposables = [];
    this.configure();
  }
  configure() {
    const webview = this.panel.webview;
    const designerRoot = vscode.Uri.file(path.join(extensionContext.extensionPath, 'designer'));
    webview.options = { enableScripts: true, localResourceRoots: [designerRoot], enableForms: true };
    webview.html = designerHtml(extensionContext.extensionPath, webview, vscode.Uri);
    this.disposables.push(webview.onDidReceiveMessage((msg) => this.onMessage(msg)));
    this.disposables.push(this.panel.onDidDispose(() => this.dispose()));
  }
  root() { return workspaceRootForUri(this.uri) || this.fallbackRoot || ''; }
  async onMessage(msg) {
    try {
      if (msg.type === 'ready') {
        this.ready = true;
        await this.initializeDesigner();
        return;
      }
      if (msg.type === 'workspaceRequest') {
        try {
          const value = await this.workspaceRequest(msg.path, msg.body);
          this.panel.webview.postMessage({ type: 'workspaceResponse', id: msg.id, ok: true, value });
        } catch (error) {
          this.panel.webview.postMessage({ type: 'workspaceResponse', id: msg.id, ok: false, error: String(error.message || error) });
        }
        return;
      }
      if (msg.type === 'designerCallResult') {
        const pending = this.pending.get(msg.id);
        if (!pending) return;
        this.pending.delete(msg.id);
        msg.ok ? pending.resolve(msg.value) : pending.reject(new Error(msg.error || 'Designer call failed'));
        return;
      }
      if (msg.type === 'openExternal' && msg.url) {
        const uri = vscode.Uri.parse(String(msg.url));
        vscode.env.openExternal(uri);
      }
    } catch (error) {
      output.appendLine(`[webview] ${error.stack || error}`);
    }
  }
  async initializeDesigner() {
    const root = this.root();
    const config = vscode.workspace.getConfiguration('astroUIDesigner');
    let projectFile = null;
    if (this.uri && /(?:\.astro-ui\.json|designer-project\.json)$/i.test(this.uri.fsPath)) projectFile = this.uri.fsPath;
    else if (root && config.get('autoLoadDesignerProject', true)) projectFile = workspaceTools.findDesignerProject(root);
    if (projectFile) {
      try { await this.call('loadProjectObject', [JSON.parse(fs.readFileSync(projectFile, 'utf8'))], 30000); }
      catch (error) { output.appendLine(`[project] ${error.message}`); }
    }
    if (root && config.get('autoOpenWorkspace', true) && workspaceTools.isAstroWorkspace(root)) {
      try { await this.call('openWorkspacePath', [root], 30000); }
      catch (error) { output.appendLine(`[workspace] ${error.message}`); }
    }
    if (this.uri) {
      const relative = normalizeRelative(root, this.uri);
      if (relative && this.uri.fsPath.endsWith('.astro')) {
        try { await this.call('openSourceFile', [relative, 'split']); } catch {}
      }
    }
    this.refreshValidation().catch(() => {});
  }
  call(method, args = [], timeout = 15000) {
    if (!this.ready) return Promise.reject(new Error('Designer is not ready'));
    const id = `call-${++this.seq}`;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`Designer call timed out: ${method}`)); }, timeout);
      this.pending.set(id, {
        resolve: (value) => { clearTimeout(timer); resolve(value); },
        reject: (error) => { clearTimeout(timer); reject(error); },
      });
      this.panel.webview.postMessage({ type: 'designerCall', id, method, args });
    });
  }
  async refreshValidation() {
    const problems = await this.call('validate', []);
    publishDesignerDiagnostics(this.root(), problems);
    return problems;
  }
  async workspaceRequest(route, body = {}) {
    const currentRoot = this.root();
    if (route === 'workspace/info') return { rootPath: currentRoot, available: Boolean(currentRoot), vscode: true };
    if (route === 'workspace/open') {
      const requested = isAllowedRoot(body?.rootPath, currentRoot);
      if (!requested) throw new Error('VS Code extension may only open folders already present in the current VS Code workspace.');
      this.fallbackRoot = requested;
      return workspaceTools.scanWorkspace(requested);
    }
    const root = isAllowedRoot(currentRoot, this.fallbackRoot);
    if (!root) throw new Error('Open an Astro project folder in VS Code first.');
    if (route === 'workspace/rescan') return workspaceTools.scanWorkspace(root);
    if (route === 'workspace/read') return { relativePath: body.relativePath, content: workspaceTools.readFile(root, body.relativePath) };
    if (route === 'workspace/write') {
      const targetPath = workspaceTools.safeJoin(root, body.relativePath);
      const targetUri = vscode.Uri.file(targetPath);
      const openDocument = vscode.workspace.textDocuments.find((doc) => doc.uri.toString() === targetUri.toString());
      if (openDocument) {
        const edit = new vscode.WorkspaceEdit();
        const range = new vscode.Range(openDocument.positionAt(0), openDocument.positionAt(openDocument.getText().length));
        edit.replace(targetUri, range, String(body.content));
        const applied = await vscode.workspace.applyEdit(edit);
        if (!applied) throw new Error('VS Code rejected the source edit');
        await openDocument.save();
      } else {
        await vscode.workspace.fs.writeFile(targetUri, Buffer.from(String(body.content), 'utf8'));
      }
      const result = { relativePath: body.relativePath, bytes: Buffer.byteLength(String(body.content)) };
      workspaceTree?.refresh();
      return result;
    }
    if (route === 'git/status') return { lines: parseGitStatus(workspaceTools.git(root, ['status', '--porcelain=v1'])) };
    if (route === 'git/diff') return { text: workspaceTools.git(root, body.relativePath ? ['diff', '--', body.relativePath] : ['diff']) };
    if (route === 'git/stage') { workspaceTools.git(root, ['add', body.relativePath || '.']); return { ok: true }; }
    if (route === 'git/commit') { const text = workspaceTools.git(root, ['commit', '-m', String(body.message || 'Visual UI update')]); return { ok: true, text }; }
    if (route === 'preview/start') return previewManager.start(root);
    if (route === 'preview/stop') return previewManager.stop(root);
    throw new Error(`Unknown workspace request: ${route}`);
  }
  dispose() {
    for (const item of this.pending.values()) item.reject(new Error('Designer webview disposed'));
    this.pending.clear();
    while (this.disposables.length) { try { this.disposables.pop().dispose(); } catch {} }
  }
}

class DesignerHost {
  constructor() { this.panel = null; this.session = null; }
  async open(options = {}) {
    const column = options.beside ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active;
    if (this.panel) {
      this.panel.reveal(column, true);
      if (options.uri) { this.session.uri = options.uri; this.session.fallbackRoot = workspaceRootForUri(options.uri) || path.dirname(options.uri.fsPath); }
      await this.waitReady();
      await this.applyOpenOptions(options);
      return this.session;
    }
    this.panel = vscode.window.createWebviewPanel(PANEL_TYPE, 'Astro UI Designer', column, { enableScripts: true, retainContextWhenHidden: true, localResourceRoots: [vscode.Uri.file(path.join(extensionContext.extensionPath, 'designer'))] });
    this.panel.iconPath = vscode.Uri.file(path.join(extensionContext.extensionPath, 'media', 'icon.svg'));
    this.session = new WebviewSession(this.panel, options);
    this.panel.onDidDispose(() => { this.panel = null; this.session = null; });
    await this.waitReady();
    await this.applyOpenOptions(options);
    return this.session;
  }
  async waitReady(timeout = 8000) {
    const start = Date.now();
    while (!this.session?.ready && Date.now() - start < timeout) await new Promise((r) => setTimeout(r, 40));
    if (!this.session?.ready) throw new Error('Astro UI Designer webview did not become ready.');
  }
  async applyOpenOptions(options) {
    const root = options.uri ? workspaceRootForUri(options.uri) : workspaceRootForUri();
    if (root && options.openWorkspace !== false && workspaceTools.isAstroWorkspace(root)) {
      try { await this.session.call('openWorkspacePath', [root], 30000); } catch (error) { output.appendLine(`[workspace] ${error.message}`); }
    }
    if (options.uri?.fsPath.endsWith('.astro')) {
      const relative = normalizeRelative(root, options.uri);
      if (relative) await this.session.call('openSourceFile', [relative, options.mode || 'split']).catch(() => {});
    } else if (options.mode) {
      await this.session.call('setMode', [options.mode]).catch(() => {});
    }
    if (options.bottomTab) await this.session.call('openBottomTab', [options.bottomTab]).catch(() => {});
  }
  async call(method, args = [], options = {}) {
    if (!this.session) await this.open(options);
    await this.waitReady();
    return this.session.call(method, args, options.timeout || 15000);
  }
}

class AstroCustomEditorProvider {
  async resolveCustomTextEditor(document, webviewPanel) {
    webviewPanel.webview.options = { enableScripts: true, localResourceRoots: [vscode.Uri.file(path.join(extensionContext.extensionPath, 'designer'))] };
    const session = new WebviewSession(webviewPanel, { uri: document.uri, fallbackRoot: workspaceRootForUri(document.uri) || path.dirname(document.uri.fsPath) });
    const change = vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.document.uri.toString() !== document.uri.toString() || !session.ready) return;
      const root = session.root();
      const rel = normalizeRelative(root, document.uri);
      if (document.uri.fsPath.endsWith('.astro') && rel) session.call('openSourceFile', [rel, 'split']).catch(() => {});
      else if (/(?:\.astro-ui\.json|designer-project\.json)$/i.test(document.uri.fsPath)) {
        try { session.call('loadProjectObject', [JSON.parse(event.document.getText())]).catch(() => {}); } catch {}
      }
    });
    webviewPanel.onDidDispose(() => change.dispose());
  }
}

class WorkspaceTreeProvider {
  constructor() { this._emitter = new vscode.EventEmitter(); this.onDidChangeTreeData = this._emitter.event; this.scan = null; }
  refresh() { this.scan = null; this._emitter.fire(); }
  async getChildren(element) {
    if (!element) {
      const root = workspaceRootForUri();
      if (!root || !workspaceTools.isAstroWorkspace(root)) return [node('Open an Astro project folder', 'info')];
      try { this.scan ||= workspaceTools.scanWorkspace(root); } catch (error) { return [node(error.message, 'error')]; }
      return [group('Pages', 'pages'), group('Components', 'components'), group('Commands', 'commands')];
    }
    if (element.kind === 'pages') return (this.scan?.astro || []).filter((x) => x.kind === 'page').map((x) => fileNode(x, 'page'));
    if (element.kind === 'components') return (this.scan?.components || []).map((x) => fileNode(x, 'component'));
    if (element.kind === 'commands') return [
      commandNode('Open Designer', 'astroUIDesigner.openDesigner', 'layout'),
      commandNode('Component Lab', 'astroUIDesigner.openComponentLab', 'beaker'),
      commandNode('Live Preview', 'astroUIDesigner.openPreview', 'preview'),
      commandNode('Run UI Tests', 'astroUIDesigner.runTests', 'testing-run-icon'),
      commandNode('Validate Project', 'astroUIDesigner.validate', 'pass-filled'),
      commandNode('Export Astro Project', 'astroUIDesigner.exportProject', 'export'),
    ];
    return [];
  }
  getTreeItem(element) { return element; }
}

function node(label, kind) { const item = new vscode.TreeItem(label); item.contextValue = kind; return item; }
function group(label, kind) { const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.Expanded); item.kind = kind; item.contextValue = kind; item.iconPath = new vscode.ThemeIcon(kind === 'pages' ? 'files' : kind === 'components' ? 'symbol-class' : 'tools'); return item; }
function fileNode(info, kind) {
  const item = new vscode.TreeItem(info.name || info.relativePath, vscode.TreeItemCollapsibleState.None);
  item.kind = 'file'; item.contextValue = kind; item.description = info.relativePath; item.tooltip = `${info.framework || 'astro'} · ${(info.props || []).length} props · ${(info.slots || []).length} slots`;
  item.iconPath = new vscode.ThemeIcon(kind === 'page' ? 'file-code' : 'symbol-structure');
  item.command = { command: 'astroUIDesigner.openSource', title: 'Open in Astro UI Designer', arguments: [info.relativePath] };
  return item;
}
function commandNode(label, command, icon) { const item = new vscode.TreeItem(label); item.kind = 'command'; item.contextValue = 'command'; item.command = { command, title: label }; item.iconPath = new vscode.ThemeIcon(icon); return item; }

class AstroTaskProvider {
  provideTasks() {
    const root = workspaceRootForUri();
    if (!root) return [];
    const pkg = workspaceTools.readJson(root, 'package.json');
    if (!pkg?.scripts) return [];
    const tasks = [];
    for (const script of ['dev', 'build', 'test', 'preview']) {
      if (!pkg.scripts[script]) continue;
      const execution = new vscode.ShellExecution(`npm run ${script}`);
      const task = new vscode.Task({ type: 'astro-ui-designer', script }, vscode.TaskScope.Workspace, `Astro UI: ${script}`, 'Astro UI Designer', execution, []);
      if (script === 'build') task.group = vscode.TaskGroup.Build;
      if (script === 'test') task.group = vscode.TaskGroup.Test;
      tasks.push(task);
    }
    return tasks;
  }
  resolveTask(task) {
    if (!task.definition?.script) return undefined;
    return new vscode.Task(task.definition, vscode.TaskScope.Workspace, task.name, 'Astro UI Designer', new vscode.ShellExecution(`npm run ${task.definition.script}`), []);
  }
}

function publishDesignerDiagnostics(root, problems) {
  diagnostics.clear();
  if (!root || !Array.isArray(problems) || problems.length === 0) { updateStatus(problems?.length || 0); return; }
  const projectFile = workspaceTools.findDesignerProject(root) || path.join(root, 'designer-project.json');
  const uri = vscode.Uri.file(projectFile);
  const list = problems.slice(0, 500).map((problem) => {
    const severity = String(problem.severity || '').toLowerCase();
    const diag = new vscode.Diagnostic(new vscode.Range(0, 0, 0, 1), String(problem.message || problem.code || 'Designer validation issue'), severity === 'error' ? vscode.DiagnosticSeverity.Error : severity === 'warning' ? vscode.DiagnosticSeverity.Warning : vscode.DiagnosticSeverity.Information);
    diag.source = 'Astro UI Designer';
    diag.code = problem.code || 'UI';
    return diag;
  });
  diagnostics.set(uri, list);
  updateStatus(list.length);
}

function updateStatus(problemCount = 0) {
  statusBar.text = problemCount ? `$(layout) Astro UI $(warning) ${problemCount}` : '$(layout) Astro UI';
  statusBar.tooltip = problemCount ? `${problemCount} designer validation issue(s)` : 'Open Astro UI Designer';
}

async function exportGeneratedProject() {
  const root = workspaceRootForUri();
  if (!root) return vscode.window.showWarningMessage('Open an Astro workspace first.');
  const target = await vscode.window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false, canSelectMany: false, openLabel: 'Export Astro project here' });
  if (!target?.[0]) return;
  const files = await designerHost.call('generate', [], { timeout: 30000 });
  const base = target[0].fsPath;
  let count = 0;
  for (const [relative, content] of Object.entries(files || {})) {
    const out = path.join(base, relative);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    if (typeof content === 'string') fs.writeFileSync(out, content, 'utf8');
    else if (content?.data && Array.isArray(content.data)) fs.writeFileSync(out, Buffer.from(content.data));
    else if (ArrayBuffer.isView(content)) fs.writeFileSync(out, Buffer.from(content.buffer, content.byteOffset, content.byteLength));
    else fs.writeFileSync(out, Buffer.from(content || []));
    count++;
  }
  vscode.window.showInformationMessage(`Astro UI Designer exported ${count} files to ${base}`);
}

async function openSource(relativePath) {
  const root = workspaceRootForUri();
  if (!root) return;
  const uri = vscode.Uri.file(path.join(root, relativePath));
  await designerHost.open({ uri, mode: 'split' });
}

async function runWorkspaceTestsViaTask() {
  const root = workspaceRootForUri();
  if (!root) throw new Error('No workspace open');
  const pkg = workspaceTools.readJson(root, 'package.json');
  if (pkg?.scripts?.test) {
    return new Promise((resolve) => {
      const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
      const child = cp.spawn(command, ['test'], { cwd: root, env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
      child.stdout.on('data', (d) => output.append(String(d)));
      child.stderr.on('data', (d) => output.append(String(d)));
      child.on('exit', (code) => resolve(code === 0));
      child.on('error', () => resolve(false));
    });
  }
  const runner = path.join(root, 'tests', 'run-all.mjs');
  if (fs.existsSync(runner)) {
    return new Promise((resolve) => {
      const child = cp.spawn(process.execPath, [runner], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
      child.stdout.on('data', (d) => output.append(String(d)));
      child.stderr.on('data', (d) => output.append(String(d)));
      child.on('exit', (code) => resolve(code === 0));
      child.on('error', () => resolve(false));
    });
  }
  return false;
}

function discoverTests() {
  testController.items.replace([]);
  const root = workspaceRootForUri();
  if (!root) return;
  let data = null;
  const artifacts = [path.join(root, 'tests', 'ui-designer.tests.json'), path.join(root, 'designer-project.json')];
  for (const file of artifacts) {
    try { if (fs.existsSync(file)) { data = JSON.parse(fs.readFileSync(file, 'utf8')); break; } } catch {}
  }
  if (!data) return;
  const stories = data.stories || (data.components || []).flatMap((component) => (component.stories || []).map((story) => ({ ...story, componentId: component.id, componentName: component.name })));
  const storyGroup = testController.createTestItem('stories', 'Component Lab Stories', vscode.Uri.file(root));
  testController.items.add(storyGroup);
  for (const story of stories || []) {
    const id = `story:${story.componentId || 'component'}:${story.id || story.name}`;
    const item = testController.createTestItem(id, `${story.componentName || 'Component'} / ${story.name || story.title || story.id}`, vscode.Uri.file(root));
    item.tags = [new vscode.TestTag('component-lab')];
    storyGroup.children.add(item);
  }
  const recorded = data.tests || data.recordedTests || [];
  if (recorded.length) {
    const group = testController.createTestItem('recorded', 'Recorded UI Tests', vscode.Uri.file(root));
    testController.items.add(group);
    for (const test of recorded) group.children.add(testController.createTestItem(`recorded:${test.id || test.name}`, test.name || test.id || 'UI test', vscode.Uri.file(root)));
  }
}

async function runTestRequest(request, token) {
  const run = testController.createTestRun(request);
  const selected = [];
  function collect(item) { if (item.children.size) item.children.forEach(collect); else selected.push(item); }
  if (request.include?.length) request.include.forEach(collect); else testController.items.forEach(collect);
  for (const item of selected) { if (token.isCancellationRequested) break; run.started(item); }
  const ok = await runWorkspaceTestsViaTask();
  for (const item of selected) {
    if (token.isCancellationRequested) run.skipped(item);
    else if (ok) run.passed(item);
    else run.failed(item, new vscode.TestMessage('Workspace UI test command failed. See Astro UI Designer output.'));
  }
  run.end();
}

function registerTesting(context) {
  testController = vscode.tests.createTestController('astroUIDesigner.tests', 'Astro UI Designer');
  context.subscriptions.push(testController);
  testController.resolveHandler = async () => discoverTests();
  testController.createRunProfile('Run Astro UI tests', vscode.TestRunProfileKind.Run, runTestRequest, true);
  const watcher = vscode.workspace.createFileSystemWatcher('**/{designer-project.json,ui-designer.tests.json}');
  watcher.onDidChange(discoverTests); watcher.onDidCreate(discoverTests); watcher.onDidDelete(discoverTests);
  context.subscriptions.push(watcher);
  discoverTests();
}

function registerCommands(context) {
  const reg = (id, fn) => context.subscriptions.push(vscode.commands.registerCommand(id, fn));
  reg('astroUIDesigner.openDesigner', () => designerHost.open({ mode: 'design' }));
  reg('astroUIDesigner.openDesignerToSide', () => designerHost.open({ mode: 'design', beside: true }));
  reg('astroUIDesigner.openActiveFile', async (resourceUri) => {
    const uri = resourceUri?.fsPath ? resourceUri : vscode.window.activeTextEditor?.document?.uri;
    if (!uri || !uri.fsPath.endsWith('.astro')) return vscode.window.showInformationMessage('Open an .astro file first.');
    return designerHost.open({ uri, mode: 'split', beside: true });
  });
  reg('astroUIDesigner.openSource', (relativePath) => openSource(relativePath));
  reg('astroUIDesigner.openComponentLab', () => designerHost.open({ mode: 'lab' }));
  reg('astroUIDesigner.openPreview', async () => {
    try { await designerHost.open({ mode: 'design' }); await designerHost.call('toggleLivePreview', [], { timeout: 30000 }); }
    catch (error) { vscode.window.showErrorMessage(`Astro preview: ${error.message}`); }
  });
  reg('astroUIDesigner.startDevServer', async () => {
    const root = workspaceRootForUri(); if (!root) return;
    try { const result = await previewManager.start(root); vscode.window.showInformationMessage(`Astro preview: ${result.url}`); }
    catch (error) { vscode.window.showErrorMessage(error.message); }
  });
  reg('astroUIDesigner.stopDevServer', () => { const root = workspaceRootForUri(); if (root) previewManager.stop(root); });
  reg('astroUIDesigner.openAnimation', async () => { await designerHost.open({ mode: 'design' }); await designerHost.call('openBottomTab', ['animation']); });
  reg('astroUIDesigner.openLayoutTools', async () => { await designerHost.open({ mode: 'design' }); await designerHost.call('openBottomTab', ['manual']); });
  reg('astroUIDesigner.openCssTools', async () => { await designerHost.open({ mode: 'design' }); await designerHost.call('openBottomTab', ['css']); });
  reg('astroUIDesigner.openInterchange', async () => { await designerHost.open({ mode: 'design' }); await designerHost.call('openBottomTab', ['interchange']); });
  reg('astroUIDesigner.validate', async () => {
    try {
      const session = await designerHost.open({ mode: 'design' });
      const problems = await session.refreshValidation();
      vscode.window.showInformationMessage(problems.length ? `Astro UI Designer: ${problems.length} validation issue(s)` : 'Astro UI Designer: no validation issues');
    } catch (error) { vscode.window.showErrorMessage(error.message); }
  });
  reg('astroUIDesigner.runTests', async () => {
    const ok = await runWorkspaceTestsViaTask();
    vscode.window.showInformationMessage(ok ? 'Astro UI Designer tests passed.' : 'Astro UI Designer tests failed or no test command is configured.');
    discoverTests();
  });
  reg('astroUIDesigner.exportProject', exportGeneratedProject);
  reg('astroUIDesigner.refreshExplorer', () => workspaceTree.refresh());
  reg('astroUIDesigner.showOutput', () => output.show(true));
}

async function activate(context) {
  extensionContext = context;
  output = vscode.window.createOutputChannel(OUTPUT_NAME);
  diagnostics = vscode.languages.createDiagnosticCollection('astroUIDesigner');
  statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 45);
  statusBar.command = 'astroUIDesigner.openDesigner';
  statusBar.show();
  updateStatus(0);
  previewManager = new PreviewManager();
  designerHost = new DesignerHost();
  workspaceTree = new WorkspaceTreeProvider();
  context.subscriptions.push(output, diagnostics, statusBar, vscode.window.registerTreeDataProvider('astroUIDesigner.workspaceView', workspaceTree));
  context.subscriptions.push(vscode.window.registerCustomEditorProvider(VIEW_TYPE, new AstroCustomEditorProvider(), { webviewOptions: { retainContextWhenHidden: true }, supportsMultipleEditorsPerDocument: false }));
  context.subscriptions.push(vscode.tasks.registerTaskProvider('astro-ui-designer', new AstroTaskProvider()));
  registerCommands(context);
  registerTesting(context);

  const sourceWatcher = vscode.workspace.createFileSystemWatcher('**/*.{astro,tsx,jsx,vue,svelte}');
  const refresh = () => { workspaceTree.refresh(); if (vscode.workspace.getConfiguration('astroUIDesigner').get('diagnosticsOnSave', true) && designerHost.session?.ready) designerHost.session.refreshValidation().catch(() => {}); };
  sourceWatcher.onDidCreate(refresh); sourceWatcher.onDidChange(refresh); sourceWatcher.onDidDelete(refresh);
  context.subscriptions.push(sourceWatcher);
  context.subscriptions.push(vscode.workspace.onDidSaveTextDocument((doc) => {
    if (/\.(astro|tsx?|jsx?|vue|svelte)$/.test(doc.uri.fsPath)) refresh();
  }));
  context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (!editor || !vscode.workspace.getConfiguration('astroUIDesigner').get('syncActiveAstro', true) || !designerHost.session?.ready) return;
    if (!editor.document.uri.fsPath.endsWith('.astro')) return;
    const root = workspaceRootForUri(editor.document.uri);
    const relative = normalizeRelative(root, editor.document.uri);
    if (relative) designerHost.session.call('openSourceFile', [relative, 'split']).catch(() => {});
  }));
  output.appendLine('Astro UI Designer VS Code extension activated.');
}

function deactivate() { previewManager?.stopAll(); }

module.exports = { activate, deactivate, PreviewManager, WorkspaceTreeProvider };
