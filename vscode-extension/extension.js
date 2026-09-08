'use strict';
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const cp = require('child_process');
const os = require('os');
const { pathToFileURL } = require('url');
const { designerHtml } = require('./lib/webview');
const workspaceTools = require('./lib/workspace');
let extensionContext;let output;let testController;
let roundTripRuntime;
async function getRoundTripRuntime() {
  if (!roundTripRuntime) {
    const mod = await import(pathToFileURL(path.join(extensionContext.extensionPath, 'lib', 'roundtrip-node.mjs')).href);
    roundTripRuntime = mod.createRoundTripNodeRuntime();
  }
  return roundTripRuntime;
}

class PreviewManager{constructor(){this.byRoot=new Map()}start(root){root=workspaceTools.safeRoot(root);const c=vscode.workspace.getConfiguration('astroUIDesigner').get('previewCommand')||'npm run dev -- --host 127.0.0.1';const child=cp.spawn(process.platform==='win32'?process.env.ComSpec||'cmd.exe':process.env.SHELL||'/bin/sh',process.platform==='win32'?['/d','/s','/c',c]:['-lc',c],{cwd:root,stdio:'ignore'});this.byRoot.set(root,child);return {running:true,url:'http://127.0.0.1:4321/'}}stop(root){const c=this.byRoot.get(path.resolve(root||''));if(c)try{c.kill('SIGTERM')}catch{}this.byRoot.delete(path.resolve(root||''));return {running:false}}}
const previewManager=new PreviewManager();
function workspaceRootForUri(uri){return vscode.workspace.getWorkspaceFolder(uri)?.uri.fsPath||vscode.workspace.workspaceFolders?.[0]?.uri.fsPath||''}
function isAllowedRoot(root,fallbackRoot=''){const resolved=path.resolve(String(root||fallbackRoot||''));const roots=(vscode.workspace.workspaceFolders||[]).map(f=>path.resolve(f.uri.fsPath));if(fallbackRoot)roots.push(path.resolve(fallbackRoot));return roots.find(r=>resolved===r)||''}
class WebviewSession{constructor(panel,uri){this.panel=panel;this.uri=uri;this.fallbackRoot=uri?path.dirname(uri.fsPath):workspaceRootForUri();this.browsedRoot='';panel.webview.options={enableScripts:true,localResourceRoots:[vscode.Uri.file(path.join(extensionContext.extensionPath,'designer'))]};panel.webview.html=designerHtml(extensionContext.extensionPath,panel.webview,vscode.Uri);panel.webview.onDidReceiveMessage(m=>this.onMessage(m))}root(){return this.browsedRoot||workspaceRootForUri(this.uri)||this.fallbackRoot||''}async onMessage(msg){if(msg.type!=='workspaceRequest')return;try{const value=await this.workspaceRequest(msg.path,msg.body||{});this.panel.webview.postMessage({type:'workspaceResponse',id:msg.id,ok:true,value})}catch(e){this.panel.webview.postMessage({type:'workspaceResponse',id:msg.id,ok:false,error:e.message||String(e)})}}async workspaceRequest(route,body={}){const currentRoot=this.root();if(route==='workspace/info')return {rootPath:currentRoot,available:Boolean(currentRoot),vscode:true};if(route==='workspace/open'){const requested=isAllowedRoot(body.rootPath,currentRoot);if(!requested)throw new Error('VS Code extension may only open folders already present in the current VS Code workspace.');this.fallbackRoot=requested;return workspaceTools.scanWorkspace(requested)}if(route==='workspace/browse'){const picked=await vscode.window.showOpenDialog({canSelectFiles:false,canSelectFolders:true,canSelectMany:false,openLabel:'Import Project'});if(!picked?.[0])return {canceled:true};this.browsedRoot=picked[0].fsPath;this.fallbackRoot=this.browsedRoot;return {...workspaceTools.scanWorkspace(this.browsedRoot),rootPath:this.browsedRoot,browsed:true}}
    if (route === 'roundtrip/health') { const rt = await getRoundTripRuntime(); return rt.handle(route, body, currentRoot || this.fallbackRoot || ''); }
    const root = isAllowedRoot(currentRoot, this.fallbackRoot);
    if (!root) throw new Error('Open or browse a project folder first.');
    if (route.startsWith('roundtrip/')) {
      const rt = await getRoundTripRuntime();
      if (route === 'roundtrip/apply') {
        const targetUri = vscode.Uri.file(workspaceTools.safeJoin(root, body.relativePath));
        const openDocument = vscode.workspace.textDocuments.find((doc) => doc.uri.toString() === targetUri.toString());
        if (openDocument?.isDirty) throw new Error('Save the open source file before applying a visual round-trip patch.');
        const inspected = await rt.handle('roundtrip/inspect', { backend: body.backend || 'astro', relativePath: body.relativePath }, root);
        if (body.baselineFingerprint && inspected.fingerprint !== body.baselineFingerprint) throw new Error('Stale source: the file changed after the patch preview was created.');
        return this.workspaceRequest('workspace/write', { relativePath: body.relativePath, content: body.nextSource });
      }
      return rt.handle(route, body, root);
    }
    if(route==='workspace/rescan')return workspaceTools.scanWorkspace(root);if(route==='workspace/read')return {relativePath:body.relativePath,content:workspaceTools.readFile(root,body.relativePath)};if(route==='workspace/write')return workspaceTools.writeFile(root,body.relativePath,body.content);if(route==='git/status')return {text:workspaceTools.git(root,['status','--short','--branch'])};if(route==='git/diff')return {text:workspaceTools.git(root,body.relativePath?['diff','--',body.relativePath]:['diff'])};if(route==='git/stage'){workspaceTools.git(root,['add',body.relativePath||'.']);return {ok:true}}if(route==='git/commit')return {ok:true,text:workspaceTools.git(root,['commit','-m',String(body.message||'Visual UI update')])};if(route==='preview/start')return previewManager.start(root);if(route==='preview/stop')return previewManager.stop(root);throw new Error(`Unknown workspace request: ${route}`)}}
function openDesigner(uri){const panel=vscode.window.createWebviewPanel('astroUIDesigner','Astro UI Designer',vscode.ViewColumn.Active,{enableScripts:true,retainContextWhenHidden:true});new WebviewSession(panel,uri);return panel}
function activate(context){extensionContext=context;output=vscode.window.createOutputChannel('Astro UI Designer');context.subscriptions.push(output,vscode.commands.registerCommand('astroUIDesigner.open',()=>openDesigner()),vscode.commands.registerCommand('astroUIDesigner.openFile',()=>openDesigner(vscode.window.activeTextEditor?.document.uri)))}
function deactivate(){for(const r of previewManager.byRoot.keys())previewManager.stop(r)}
module.exports={activate,deactivate};
