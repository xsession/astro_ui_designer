#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { COMPONENTS, ACTION_TYPES } from '../../standalone/js/registry.js';
import { listRoundTripBackends } from '../../standalone/js/roundtrip-engine.js';
import { DOCK_PANEL_TOOLTIPS } from '../../standalone/js/tooltips.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const ref=path.join(root,'docs/reference');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(name,body)=>fs.writeFileSync(path.join(ref,name),`<!-- GENERATED FILE. Source: docs/scripts/generate-reference.mjs -->\n\n${body.trim()}\n`,'utf8');
const esc=v=>String(v??'').replace(/\|/g,'\\|').replace(/\n/g,' ');
const code=v=>`\`${String(v??'').replace(/`/g,'\\`')}\``;

// Components and action types
const compRows=Object.entries(COMPONENTS).map(([id,s])=>`| ${code(id)} | ${esc(s.label)} | ${esc(s.category)} | ${s.acceptsChildren?'yes':'no'} | ${esc(s.tag||'—')} | ${s.paletteHidden?'yes':'no'} | ${(s.fields||[]).map(f=>code(f.key||f.id||f.label||'?')).join(', ')||'—'} |`).join('\n');
const actionRows=(ACTION_TYPES||[]).map(a=>`| ${code(a.id)} | ${esc(a.label)} | ${a.target?'yes':'no'} | ${esc(a.valueLabel||'—')} |`).join('\n');
write('COMPONENT_REGISTRY.generated.md',`# Component and action registry\n\nGenerated from \`standalone/js/registry.js\`.\n\n## Components (${Object.keys(COMPONENTS).length})\n\n| Type | Label | Category | Children | DOM tag | Hidden from palette | Declared fields |\n|---|---|---|---:|---|---:|---|\n${compRows}\n\n## Action types (${(ACTION_TYPES||[]).length})\n\n| ID | Label | Target node | Value label |\n|---|---|---:|---|\n${actionRows}`);

// Round-trip backends
const backends=listRoundTripBackends();
const backendRows=backends.map(b=>`| ${code(b.id)} | ${esc(b.label)} | ${esc(b.family)} | ${(b.extensions||[]).map(code).join(' ')} | ${esc((b.supported||[]).join('; '))} | ${esc((b.partial||[]).join('; ')||'—')} | ${esc((b.unsupported||[]).join('; ')||'—')} |`).join('\n');
write('ROUNDTRIP_BACKENDS.generated.md',`# Round-trip backend matrix\n\nGenerated from \`standalone/js/roundtrip-engine.js\`.\n\n| Backend | Label | Family | Extensions | Supported | Partial/controlled | Unsupported |\n|---|---|---|---|---|---|---|\n${backendRows}\n\n## Sync/dirty-state concepts\n\nThe engine also defines reviewed source→design, design→source and bidirectional-reviewed synchronization plus explicit clean/source-dirty/design-dirty/both-dirty states.`);

// Commands
const app=read('standalone/js/app.js');
const cmdSection=(app.match(/function commandDefinitions\(\)\{([\s\S]*?)const panelCommands=/)||[])[1]||'';
const commandRe=/\{id:'([^']+)',category:'([^']+)',label:'([^']+)'(?:,description:'([^']*)')?,defaultBindings:\[([^\]]*)\]/g;
const commands=[]; let m;
while((m=commandRe.exec(cmdSection))){
  const bindings=[...m[5].matchAll(/'([^']+)'/g)].map(x=>x[1]);
  commands.push({id:m[1],category:m[2],label:m[3],description:m[4]||'',bindings});
}
const panelMatch=app.match(/const panelCommands=\[([\s\S]*?)\];\s*for\(const \[panelKey,category,label\]/);
const panels=[];
if(panelMatch){ for(const mm of panelMatch[1].matchAll(/\['([^']+)','([^']+)','([^']+)'\]/g)) panels.push({key:mm[1],category:mm[2],label:mm[3]}); }
const cmdRows=commands.map(c=>`| ${code(c.id)} | ${esc(c.category)} | ${esc(c.label)} | ${c.bindings.map(code).join(', ')||'—'} | ${esc(c.description||'—')} |`).join('\n');
const panelRows=panels.map(p=>`| ${code('panel.'+p.key.replace(':','.'))} | ${esc(p.category)} | ${esc(p.label)} | user-assignable |`).join('\n');
write('COMMANDS_AND_HOTKEYS.generated.md',`# Commands and default hotkeys\n\nGenerated from \`commandDefinitions()\` in \`standalone/js/app.js\`. User overrides are project/local preferences and are not listed here.\n\n## Core commands (${commands.length})\n\n| Command ID | Category | Label | Default bindings | Description |\n|---|---|---|---|---|\n${cmdRows}\n\n## Panel commands (${panels.length})\n\nEvery relocatable panel is also a command and can receive a custom hotkey.\n\n| Command ID | Category | Panel | Binding |\n|---|---|---|---|\n${panelRows}`);

// Docks from HTML
const html=read('standalone/index.html');
const docks=[];
for(const [zone,attr] of [['left','data-left-tab'],['right','data-right-tab'],['bottom','data-bottom-tab']]){
  const re=new RegExp(`<button[^>]*${attr}="([^"]+)"[^>]*>([\\s\\S]*?)<\\/button>`,'g');
  for(const mm of html.matchAll(re)) docks.push({zone,id:mm[1],label:mm[2].replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim()});
}
const dockRows=docks.map((d,i)=>`| ${i+1} | ${code(`${d.zone}:${d.id}`)} | ${esc(d.zone)} | ${esc(d.label)} | ${esc(DOCK_PANEL_TOOLTIPS[d.id]||'Specialist designer panel.')} | relocatable / floating |`).join('\n');
write('DOCKS_AND_WORKBENCHES.generated.md',`# Docks and workbenches\n\nGenerated from \`standalone/index.html\` and the shared tooltip metadata.\n\n| # | Dock key | Origin | Label | Purpose | Mobility |\n|---:|---|---|---|---|---|\n${dockRows}\n\nTotal: **${docks.length}** major dock panels.`);

// MCP tools
const mcp=read('integrations/hermes/mcp/server.mjs');
const toolsSection=(mcp.match(/const tools=\[([\s\S]*?)\];\s*\n\nasync function call/)||[])[1]||'';
const tools=[];
for(const mm of toolsSection.matchAll(/\{name:'([^']+)',description:'([^']+)',inputSchema:/g)) tools.push({name:mm[1],description:mm[2]});
const toolRows=tools.map(t=>`| ${code(t.name)} | ${esc(t.description)} |`).join('\n');
write('MCP_TOOLS.generated.md',`# MCP tool reference\n\nGenerated from \`integrations/hermes/mcp/server.mjs\`. Input schemas remain authoritative in source.\n\n| Tool | Purpose |\n|---|---|\n${toolRows}\n\nTotal: **${tools.length}** semantic tools.`);

// Workspace client
const wc=read('standalone/js/workspace-client.js');
const methods=[...wc.matchAll(/export async function ([A-Za-z0-9_]+)\(([^)]*)\)\{return api\('([^']+)'/g)].map(x=>({fn:x[1],args:x[2],api:x[3]}));
const wcRows=methods.map(x=>`| ${code(x.fn)} | ${code(x.args||'')} | ${code('/api/'+x.api)} |`).join('\n');
write('WORKSPACE_API.generated.md',`# Workspace client API\n\nGenerated from \`standalone/js/workspace-client.js\`. In VS Code the same logical operations are bridged through the extension request surface.\n\n| Client function | Parameters | Host endpoint |\n|---|---|---|\n${wcRows}`);

// Package scripts
const pkg=JSON.parse(read('package.json'));
const scriptRows=Object.entries(pkg.scripts||{}).map(([k,v])=>`| ${code(k)} | ${code(v)} |`).join('\n');
write('PACKAGE_SCRIPTS.generated.md',`# Package scripts\n\nGenerated from root \`package.json\` (${esc(pkg.name)} ${esc(pkg.version)}).\n\n| Script | Command |\n|---|---|\n${scriptRows}`);


// Module and test indexes
const jsDir=path.join(root,'standalone/js');
const modules=fs.readdirSync(jsDir).filter(x=>x.endsWith('.js')).sort().map(name=>{const src=fs.readFileSync(path.join(jsDir,name),'utf8');const exports=[...src.matchAll(/export\s+(?:async\s+)?(?:function|const|class)\s+([A-Za-z0-9_]+)/g)].map(x=>x[1]);return {name,lines:src.split(/\r?\n/).length,exports};});
const moduleRows=modules.map(m=>`| ${code('standalone/js/'+m.name)} | ${m.lines} | ${m.exports.map(code).join(', ')||'—'} |`).join('\n');
write('MODULE_INDEX.generated.md',`# Standalone module index\n\nGenerated from the packaged source tree.\n\n| Module | Physical lines | Named exports |\n|---|---:|---|\n${moduleRows}`);
const testDir=path.join(root,'tests');
const tests=fs.readdirSync(testDir).filter(x=>x.endsWith('.mjs')).sort().map(name=>{const src=fs.readFileSync(path.join(testDir,name),'utf8');return {name,lines:src.split(/\r?\n/).length};});
const testRows=tests.map(t=>`| ${code('tests/'+t.name)} | ${t.lines} |`).join('\n');
write('TEST_INDEX.generated.md',`# Test file index\n\nGenerated from the packaged test directory.\n\n| Test file | Physical lines |\n|---|---:|\n${testRows}\n\nTotal: **${tests.length}** test modules.`);

console.log(JSON.stringify({components:Object.keys(COMPONENTS).length,actions:(ACTION_TYPES||[]).length,backends:backends.length,commands:commands.length,panelCommands:panels.length,docks:docks.length,mcpTools:tools.length,workspaceMethods:methods.length,scripts:Object.keys(pkg.scripts||{}).length,modules:modules.length,testModules:tests.length},null,2));
