import assert from 'node:assert/strict';
import '../standalone/plugins/bootstrap.js';
import { getDesignerPlugins, getDesignerContributions, DESIGNER_CONTRIBUTION_KINDS } from '../standalone/js/plugin-api.js';
const ids=getDesignerPlugins().map(p=>p.id);assert.ok(ids.includes('core.research-integrations'));assert.ok(DESIGNER_CONTRIBUTION_KINDS.includes('assistants'));
const all=getDesignerContributions();assert.ok(all.assistants.some(x=>x.id==='responsive-layout-advisor'));assert.ok(all.importers.some(x=>x.id==='dtcg-penpot'));assert.ok(all.sourceAdapters.some(x=>x.id==='astro-ui-id'));
const advisor=all.assistants.find(x=>x.id==='responsive-layout-advisor');const result=await advisor.run({selection:[]});assert.equal(result.changed,false);assert.ok(result.message.includes('Select at least two'));
console.log('plugin-api.test: OK');
