#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const args=process.argv.slice(2);
const project=readArg('--project')||path.resolve(process.cwd(),'designer-project.json');
const apply=args.includes('--apply');
const replace=args.includes('--replace');
const skillOnly=args.includes('--skill-only');
const mcpOnly=args.includes('--mcp-only');
const serverName=readArg('--server-name')||'astro-ui-designer';
const server=path.join(here,'mcp','server.mjs');
const skillSource=path.join(here,'skill-src','astro-ui-designer');
const skillTarget=path.join(os.homedir(),'.hermes','skills','astro-ui-designer');

if(!fs.existsSync(project)){console.error(`designer-project.json not found: ${project}`);process.exit(2)}
if(!mcpOnly){
  fs.mkdirSync(path.dirname(skillTarget),{recursive:true});
  fs.rmSync(skillTarget,{recursive:true,force:true});
  fs.cpSync(skillSource,skillTarget,{recursive:true});
  console.log(`Installed Hermes skill: ${skillTarget}`);
}
const cmd=['mcp','add',serverName,'--command','node','--connect-timeout','30','--args',server,'--project',path.resolve(project)];
if(!skillOnly){
  console.log(`Hermes MCP command:\n  hermes ${shellJoin(cmd)}`);
  if(apply){
    if(replace)spawnSync('hermes',['mcp','remove',serverName],{stdio:'inherit'});
    const r=spawnSync('hermes',cmd,{stdio:'inherit'});
    if(r.error?.code==='ENOENT'){console.error('Hermes CLI was not found on PATH. Skill installation succeeded; run the printed MCP command after installing Hermes.');process.exit(3)}
    if(r.status!==0)process.exit(r.status||1);
    const test=spawnSync('hermes',['mcp','test',serverName],{stdio:'inherit'});if(test.status!==0)process.exit(test.status||1);
  }
}
console.log('Done. Start a new Hermes session so skill/tool discovery refreshes.');
function readArg(name){const i=args.indexOf(name);return i>=0?args[i+1]:''}
function shellJoin(parts){return parts.map(x=>/^[A-Za-z0-9_./:-]+$/.test(x)?x:JSON.stringify(x)).join(' ')}
