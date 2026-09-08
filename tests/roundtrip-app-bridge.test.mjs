import assert from 'node:assert/strict';
import { installRoundTripAppBridge } from '../standalone/js/roundtrip-app-bridge.js';
const project={pages:[],components:[],workspace:{rootPath:'',files:[],sourceMappings:[]}};const api=installRoundTripAppBridge({getProject:()=>project,getSelected:()=>null});assert.equal(typeof api.summary,'function');const summary=await api.summary();assert.equal(summary.dirtyState,'clean');assert.ok((await api.adapters()).some(x=>x.id==='astro'));await api.dispose();console.log('roundtrip-app-bridge.test.mjs passed');
