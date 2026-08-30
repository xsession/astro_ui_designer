import assert from 'node:assert/strict';
import { createProject, createNode } from '../standalone/js/model.js';
import { ensureCompositionModel, registerCodeComponentContract, addGlobalVariantGroup, setGlobalVariant, addNodeGlobalVariantStyle, addMixin, applyMixin, effectiveCompositionStyle, addGlobalContext, addGlobalAction, addQuery, evaluateQuery, bindNodeQuery, createTemplate, instantiateTemplate, findUsages, replaceComponentUsages, exportCompositionManifest, generateQueryModule } from '../standalone/js/plasmic-cleanroom.js';

const p=createProject();ensureCompositionModel(p);
assert.equal(p.schemaVersion,7);
const ext=registerCodeComponentContract(p,{name:'DataCard',symbol:'DataCard',importPath:'src/components/DataCard.tsx',framework:'react',contract:{description:'Rich code component',props:[{name:'title',type:'richText',default:'Hello'},{name:'items',type:'list',default:[]}],slots:['default'],states:[{name:'selected',type:'writable'}],globalActions:[{name:'refresh',parameters:[]}],providesData:['record']}});
assert.equal(ext.contract.props[1].type,'list');assert.equal(ext.contract.globalActions[0].name,'refresh');
const g=addGlobalVariantGroup(p,'Theme',['light','dark']);assert.equal(setGlobalVariant(p,g.id,'dark'),true);
const n=createNode('card');p.pages[0].root.children.push(n);addNodeGlobalVariantStyle(n,g.id,'dark',{color:'#fff'});
const mix=addMixin(p,'Elevated',{boxShadow:'0 4px 10px #0003'});applyMixin(n,mix.id);
const style=effectiveCompositionStyle(p,n,{background:'#111'});assert.equal(style.color,'#fff');assert.equal(style.boxShadow,'0 4px 10px #0003');
const ctx=addGlobalContext(p,'Session');ctx.values.user='Ada';addGlobalAction(ctx,'logout',[]);assert.equal(ctx.actions.length,1);
const q=addQuery(p,'items','static');q.mockData=[{id:1}];assert.deepEqual(evaluateQuery(p,q).data,[{id:1}]);bindNodeQuery(n,'items',q.id,'');assert.equal(findUsages(p,{kind:'query',id:q.id}).length,1);
const t=createTemplate(p,{name:'Card Template',root:n});const copy=instantiateTemplate(t);assert.notEqual(copy.id,n.id);assert.equal(copy.type,'card');
const c1={id:'c1',name:'Old',filename:'Old.astro',props:[],root:createNode('container')},c2={id:'c2',name:'New',filename:'New.astro',props:[],root:createNode('container')};p.components.push(c1,c2);const inst=createNode('componentInstance',{props:{definitionId:'c1',propValues:{title:'x'}}});p.pages[0].root.children.push(inst);assert.equal(findUsages(p,{kind:'component',id:'c1'}).length,1);assert.equal(replaceComponentUsages(p,'c1','c2'),1);assert.equal(inst.props.definitionId,'c2');assert.equal(inst.props.propValues.title,'x');
const manifest=exportCompositionManifest(p);assert.equal(manifest.globalVariants.length,1);assert.equal(manifest.externalComponents.length,1);
const src=generateQueryModule(p);assert.match(src,/uiQueries/);assert.match(src,/"items"/);
console.log('plasmic-cleanroom.test: OK');
