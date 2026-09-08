import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { scanWorkspace } from '../workspace-tools.mjs';

const root=fs.mkdtempSync(path.join(os.tmpdir(),'astro-ui-workspace-'));
try{
  fs.mkdirSync(path.join(root,'web'),{recursive:true});
  fs.writeFileSync(path.join(root,'main.py'),"from pwtk import App\nclass Demo(App):\n    pass\n");
  fs.writeFileSync(path.join(root,'blocks.py'),"import pwtk\nclass InfoGuiBlock(pwtk.Block):\n    pass\n");
  fs.writeFileSync(path.join(root,'layout.json'),'{}');
  fs.writeFileSync(path.join(root,'web','index.html'),'<div id="app"></div>');
  fs.writeFileSync(path.join(root,'ui.c'),'#include <lvgl.h>\nvoid x(){lv_obj_t *o=lv_obj_create(NULL);}\n');
  fs.writeFileSync(path.join(root,'ui.h'),'#pragma once\n');
  fs.writeFileSync(path.join(root,'style.scss'),'.x{color:red}');
  fs.writeFileSync(path.join(root,'Main.qml'),'import QtQuick\nItem { id: root; width: 100; height: 100 }\n');
  fs.writeFileSync(path.join(root,'CMakeLists.txt'),'cmake_minimum_required(VERSION 3.21)\nproject(QmlDemo LANGUAGES CXX)\n');
  fs.writeFileSync(path.join(root,'qmldir'),'module QmlDemo\n');
  fs.writeFileSync(path.join(root,'Demo.qmlproject'),'Project { mainFile: \"Main.qml\" }\n');
  const scan=await scanWorkspace(root);
  for(const rel of ['main.py','blocks.py','layout.json','web/index.html','ui.c','ui.h','style.scss','Main.qml','CMakeLists.txt','qmldir','Demo.qmlproject'])assert.ok(scan.files.includes(rel),`workspace scanner dropped ${rel}`);
} finally { fs.rmSync(root,{recursive:true,force:true}); }
console.log('workspace-roundtrip-files.test.mjs passed');
