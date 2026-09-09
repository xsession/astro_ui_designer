#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const docs=path.join(root,'docs');
const all=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else all.push(p)}}
walk(docs);
const md=all.filter(p=>p.endsWith('.md'));
const issues=[];
const checkedLinks=[];
for(const file of md){
  const text=fs.readFileSync(file,'utf8');
  if(!/^#\s+/m.test(text))issues.push(`${path.relative(root,file)}: missing H1`);
  for(const m of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
    let target=m[1].trim();
    if(!target||target.startsWith('#')||/^[a-z][a-z0-9+.-]*:/i.test(target))continue;
    target=target.split('#')[0].split('?')[0];
    if(!target)continue;
    let resolved=path.resolve(path.dirname(file),decodeURIComponent(target));
    checkedLinks.push([file,resolved]);
    if(!fs.existsSync(resolved))issues.push(`${path.relative(root,file)}: broken link -> ${target}`);
  }
}
for(const g of ['COMPONENT_REGISTRY.generated.md','COMMANDS_AND_HOTKEYS.generated.md','DOCKS_AND_WORKBENCHES.generated.md','ROUNDTRIP_BACKENDS.generated.md','MCP_TOOLS.generated.md','WORKSPACE_API.generated.md','PACKAGE_SCRIPTS.generated.md','MODULE_INDEX.generated.md','TEST_INDEX.generated.md']){
  const p=path.join(docs,'reference',g); if(!fs.existsSync(p))issues.push(`missing generated reference ${path.relative(root,p)}`);
  else if(!fs.readFileSync(p,'utf8').startsWith('<!-- GENERATED FILE.'))issues.push(`${path.relative(root,p)}: generated marker missing`);
}
const drawio=path.join(docs,'c4/diagrams/astro-ui-designer-master.drawio');
if(!fs.existsSync(drawio))issues.push('master Draw.io diagram missing');
else { const x=fs.readFileSync(drawio,'utf8'); if(!x.includes('<mxfile')||!x.includes('<diagram'))issues.push('master Draw.io diagram is not recognizable diagrams.net XML'); }
const previews=['system-context','containers','roundtrip','simulation','mcp','data-model','workbench'];
for(const n of previews)for(const ext of ['svg','png'])if(!fs.existsSync(path.join(docs,'c4/diagrams',`${n}.${ext}`)))issues.push(`missing diagram preview ${n}.${ext}`);

const result={markdownFiles:md.length,checkedRelativeLinks:checkedLinks.length,allDocFiles:all.length,issues};
console.log(JSON.stringify(result,null,2));
if(issues.length)process.exit(1);
