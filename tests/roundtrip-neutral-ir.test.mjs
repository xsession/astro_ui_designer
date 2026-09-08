import assert from 'node:assert/strict';
import { parseMarkupNeutral,parseTkinterNeutral,parseNiceGuiNeutral,parseLvglNeutral,generateNeutralBackend,importSourceToNeutral } from '../standalone/js/roundtrip-neutral-ir.js';
const html='<div data-ui-id="hero" class="hero"><h1>Hello</h1><button>Go</button></div><style>.hero{color:red;width:120px}</style>';
const doc=parseMarkupNeutral(html,{backend:'astro',filename:'index.astro'});assert.equal(doc.root.children[0].source.nodeId,'hero');assert.equal(doc.root.children[0].style.color,'red');assert.equal(doc.root.children[0].children[0].text,'Hello');
const tk=parseTkinterNeutral("import tkinter as tk\nroot=tk.Tk()\nlabel=tk.Label(root, text='Hi')\nlabel.place(x=10,y=20,width=80,height=30)\n");assert.equal(tk.root.children.find(x=>x.name==='label').text,'Hi');assert.equal(tk.root.children.find(x=>x.name==='label').style.left,'10px');
const ng=parseNiceGuiNeutral("from nicegui import ui\nwith ui.column():\n    title = ui.label('Hi')\n");assert.equal(ng.root.children[0].children[0].text,'Hi');
const lv=parseLvglNeutral('lv_obj_t * label = lv_label_create(parent);\nlv_label_set_text(label, "Hi");\nlv_obj_set_pos(label, 4, 5);');assert.equal(lv.root.children[0].text,'Hi');assert.equal(lv.root.children[0].style.top,'5px');
for(const backend of ['astro','react','vue','svelte','vanilla-js','tkinter','nicegui','lvgl','pwtk']){const files=generateNeutralBackend(doc,backend,{componentName:'Demo'});assert.ok(Object.keys(files).length>0,backend);assert.ok(Object.values(files).every(v=>typeof v==='string'));}
assert.equal(importSourceToNeutral({backend:'react',source:'export default()=> <div data-ui-id="x">X</div>',filename:'App.tsx'}).backend,'react');
console.log('roundtrip-neutral-ir.test.mjs passed');
