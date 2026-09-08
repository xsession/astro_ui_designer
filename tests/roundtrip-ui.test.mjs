import assert from 'node:assert/strict';
import { lineDiff } from '../standalone/js/roundtrip-ui.js';
const d=lineDiff('a\nb\nc','a\nB\nc\nd');assert.ok(d.some(x=>x.type==='del'&&x.text==='b'));assert.ok(d.some(x=>x.type==='add'&&x.text==='B'));assert.ok(d.some(x=>x.type==='add'&&x.text==='d'));console.log('roundtrip-ui.test.mjs passed');
