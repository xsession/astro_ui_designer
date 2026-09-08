const fs=require('fs'),path=require('path'),cp=require('child_process');
function safeRoot(root){const p=path.resolve(String(root||''));if(!p||!fs.existsSync(p)||!fs.statSync(p).isDirectory())throw new Error('Workspace root does not exist');return p}
function safeJoin(root,rel){const r=safeRoot(root),p=path.resolve(r,String(rel||''));if(p!==r&&!p.startsWith(r+path.sep))throw new Error('Path escapes workspace');return p}
function readFile(root,rel){return fs.readFileSync(safeJoin(root,rel),'utf8')}
function writeFile(root,rel,content){const p=safeJoin(root,rel);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,String(content));return {relativePath:rel,bytes:Buffer.byteLength(String(content))}}
function scanWorkspace(root){root=safeRoot(root);const files=[];function rec(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(['node_modules','.git','dist','.astro'].includes(e.name))continue;const p=path.join(dir,e.name);if(e.isDirectory())rec(p);else if(/\.(astro|tsx?|jsx?|vue|svelte|css|scss|json|html|py|c|h)$/i.test(e.name))files.push({relativePath:path.relative(root,p).split(path.sep).join('/'),size:fs.statSync(p).size})}}rec(root);return {rootPath:root,files}}
function git(root,args){return cp.spawnSync('git',args,{cwd:safeRoot(root),encoding:'utf8'}).stdout||''}
function findDesignerProject(root){for(const n of ['designer-project.json','.astro-ui.json']){const p=path.join(root,n);if(fs.existsSync(p))return p}return null}
function isAstroWorkspace(root){return fs.existsSync(path.join(root,'astro.config.mjs'))||fs.existsSync(path.join(root,'src'))}
module.exports={safeRoot,safeJoin,readFile,writeFile,scanWorkspace,git,findDesignerProject,isAstroWorkspace};
