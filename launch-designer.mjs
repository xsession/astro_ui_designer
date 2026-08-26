import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { safeRoot, safeJoin, scanWorkspace, readFile, writeFile, git } from './workspace-tools.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.join(here,'standalone');
const port=Number(process.env.ASTRO_UI_DESIGNER_PORT||8766);
const host=process.env.ASTRO_UI_DESIGNER_HOST||'127.0.0.1';
const url=`http://${host}:${port}`;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon'};
let workspaceRoot=''; let previewProc=null; let previewPort=4321;

function resolveStatic(raw){let pathname='/';try{pathname=decodeURIComponent(new URL(raw,url).pathname)}catch{}if(pathname==='/')pathname='/index.html';const fp=path.resolve(root,'.'+pathname);return fp.startsWith(path.resolve(root)+path.sep)||fp===path.resolve(root)?fp:null;}
function json(res,status,data){const body=JSON.stringify(data);res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Content-Length':Buffer.byteLength(body),'Cache-Control':'no-store'});res.end(body)}
function error(res,e,status=400){json(res,status,{error:e?.message||String(e)})}
async function body(req){let raw='';for await(const c of req){raw+=c;if(raw.length>10_000_000)throw new Error('Request too large')}return raw?JSON.parse(raw):{}}
function requireWorkspace(){if(!workspaceRoot)throw new Error('No workspace is open');return workspaceRoot}
function commandExists(cmd){return spawnSync(process.platform==='win32'?'where':'which',[cmd],{stdio:'ignore'}).status===0}
function packageManager(rootPath){if(fs.existsSync(path.join(rootPath,'pnpm-lock.yaml'))&&commandExists('pnpm'))return'pnpm';if(fs.existsSync(path.join(rootPath,'yarn.lock'))&&commandExists('yarn'))return'yarn';return'npm'}
function previewCommand(rootPath){const pm=packageManager(rootPath);if(pm==='npm')return{cmd:'npm',args:['run','dev','--','--host','127.0.0.1','--port',String(previewPort)]};return{cmd:pm,args:['run','dev','--host','127.0.0.1','--port',String(previewPort)]};}
function stopPreview(){if(previewProc){try{previewProc.kill('SIGTERM')}catch{}previewProc=null}}

async function handleApi(req,res,pathname){
  try{
    if(pathname==='/api/workspace/info')return json(res,200,{available:true,rootPath:workspaceRoot,preview:{running:Boolean(previewProc),url:previewProc?`http://127.0.0.1:${previewPort}`:''}});
    if(req.method!=='POST')return json(res,405,{error:'POST required'});const data=await body(req);
    if(pathname==='/api/workspace/open'){workspaceRoot=safeRoot(data.rootPath);const scan=await scanWorkspace(workspaceRoot);return json(res,200,scan)}
    const wr=requireWorkspace();
    if(pathname==='/api/workspace/read')return json(res,200,{relativePath:data.relativePath,content:readFile(wr,data.relativePath)});
    if(pathname==='/api/workspace/write')return json(res,200,writeFile(wr,data.relativePath,data.content));
    if(pathname==='/api/workspace/rescan')return json(res,200,await scanWorkspace(wr));
    if(pathname==='/api/git/status'){const text=git(wr,['status','--short','--branch']);return json(res,200,{text,lines:text.split(/\r?\n/).filter(Boolean)});}
    if(pathname==='/api/git/diff'){const args=['diff','--'];if(data.relativePath)args.push(data.relativePath);return json(res,200,{text:git(wr,args)});}
    if(pathname==='/api/git/stage'){git(wr,['add',data.relativePath||'.']);return json(res,200,{ok:true});}
    if(pathname==='/api/git/commit'){if(!String(data.message||'').trim())throw new Error('Commit message is required');const text=git(wr,['commit','-m',String(data.message)]);return json(res,200,{ok:true,text});}
    if(pathname==='/api/preview/start'){
      stopPreview(); previewPort=Number(data.port||4321); const pc=previewCommand(wr); previewProc=spawn(pc.cmd,pc.args,{cwd:wr,env:{...process.env,NO_COLOR:'1'},stdio:['ignore','pipe','pipe']}); let output='';previewProc.stdout?.on('data',d=>output+=String(d).slice(-20000));previewProc.stderr?.on('data',d=>output+=String(d).slice(-20000));previewProc.on('exit',()=>previewProc=null);return json(res,200,{running:true,url:`http://127.0.0.1:${previewPort}`,command:[pc.cmd,...pc.args].join(' '),note:'The dev server may take a moment to become reachable.',output});
    }
    if(pathname==='/api/preview/stop'){stopPreview();return json(res,200,{running:false});}
    return json(res,404,{error:'Unknown API route'});
  }catch(e){return error(res,e)}
}

const server=http.createServer(async(req,res)=>{
  const parsed=new URL(req.url||'/',url);if(parsed.pathname.startsWith('/api/'))return handleApi(req,res,parsed.pathname);
  const fp=resolveStatic(req.url||'/');if(!fp)return void res.writeHead(403).end('Forbidden');
  fs.stat(fp,(err,st)=>{if(err||!st.isFile())return void res.writeHead(404).end('Not found');res.writeHead(200,{'Content-Type':mime[path.extname(fp).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(fp).pipe(res);});
});

function openWindow(){if(process.argv.includes('--no-browser'))return;try{if(process.platform==='win32'){spawn('cmd',['/c','start','',url],{detached:true,stdio:'ignore'}).unref();return}if(process.platform==='darwin'){spawn('open',[url],{detached:true,stdio:'ignore'}).unref();return}for(const cmd of ['chromium','chromium-browser','google-chrome','google-chrome-stable'])if(commandExists(cmd)){spawn(cmd,[`--app=${url}`,'--new-window'],{detached:true,stdio:'ignore'}).unref();return}if(commandExists('xdg-open'))spawn('xdg-open',[url],{detached:true,stdio:'ignore'}).unref();}catch(e){console.warn(`Could not open browser automatically: ${e.message}`)}}
server.listen(port,host,()=>{console.log(`Astro UI Designer Research Edition is running at ${url}`);console.log('Local workspace API enabled. Press Ctrl+C to stop.');openWindow()});
for(const sig of ['SIGINT','SIGTERM'])process.on(sig,()=>{stopPreview();server.close(()=>process.exit(0))});
