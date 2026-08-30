import assert from 'node:assert/strict';
import { createProject, createNode } from '../standalone/js/model.js';
import {
  ensureResearchModel, ensureNodeResearch, scanAstroSource, addSourceSnapshot, patchAstroNodeByUiId, registerExternalComponent,
  createVariant, createNodeState, createContainerRule, createTimelineTrack, inferFreeformLayout,
  dtcgFromTheme, importDtcgTokens, addContentCollection, addCollectionEntry, addDataSource,
  setTranslation, getTranslation, responsiveAudit, accessibilityAudit, createStory, createRecordedTest,
  addTestStep, summarizeResearchFeatures, evaluateExpression, seoAudit, performanceAudit, contrastAudit,
} from '../standalone/js/research-features.js';

const p=createProject(); ensureResearchModel(p);
assert.equal(p.schemaVersion,7);
assert.ok(p.workspace && p.content && p.locales && p.editor);
const src=`---\ninterface Props { title: string; count?: number; active?: boolean; tone?: 'info' | 'warn'; }\nimport X from './X.astro';\n---\n<section data-ui-id="hero"><slot /><slot name="actions" /></section>`;
const scanned=scanAstroSource(src,'src/components/Hero.astro');
assert.equal(scanned.kind,'component');
assert.deepEqual(scanned.props.map(x=>x.name),['title','count','active','tone']);
assert.equal(scanned.props.find(x=>x.name==='tone').type,'enum');
assert.deepEqual(scanned.slots,['default','actions']);
assert.deepEqual(scanned.uiIds,['hero']);
const patched=patchAstroNodeByUiId(src,'hero',{attributes:{id:'hero-section','aria-label':'Hero'},text:null});
assert.equal(patched.changed,true);assert.ok(patched.source.includes('id="hero-section"'));assert.ok(patched.source.includes('aria-label="Hero"'));
assert.equal(patchAstroNodeByUiId(src,'missing',{attributes:{id:'x'}}).changed,false);
addSourceSnapshot(p,'src/components/Hero.astro',src);
const ext=registerExternalComponent(p,{name:'Hero',symbol:'Hero',importPath:'../components/Hero.astro',props:scanned.props,slots:scanned.slots});
assert.ok(ext.id && p.workspace.externalComponents.length===1);

const card=createNode('card'); ensureNodeResearch(card); p.pages[0].root.children.push(card);
const st=createNodeState(card,'expanded'); st.style.width='320px';
const cq=createContainerRule(card); cq.minWidth='420px'; cq.style.display='grid';
const tr=createTimelineTrack(card,'opacity'); tr.keyframes[0].value='0'; tr.keyframes[1].value='1'; card.timeline.duration=250;
assert.equal(card.states.length,1); assert.equal(card.containerRules.length,1); assert.equal(card.timeline.tracks.length,1);
const comp={id:'c1',name:'Button',filename:'Button.astro',props:[],root:createNode('button'),variants:[],stories:[]}; p.components.push(comp);
createVariant(comp,'Primary'); createStory(comp,'Default');
assert.equal(comp.variants[0].name,'Primary'); assert.equal(comp.stories[0].name,'Default');

const free=[
  createNode('button',{style:{base:{position:'absolute',left:'0px',top:'0px',width:'100px',height:'40px'}}}),
  createNode('button',{style:{base:{position:'absolute',left:'120px',top:'2px',width:'100px',height:'40px'}}}),
  createNode('button',{style:{base:{position:'absolute',left:'240px',top:'1px',width:'100px',height:'40px'}}}),
];
assert.equal(inferFreeformLayout(free).kind,'row');

p.theme.themes.default.tokens['space-4']='16px';
const dtcg=dtcgFromTheme(p,'default'); assert.equal(dtcg.space['4'].$value.value,16);
importDtcgTokens(p,{brand:{primary:{$type:'color',$value:'#ff0000'}}});
assert.equal(p.theme.themes.default.tokens['brand-primary'],'#ff0000');

const col=addContentCollection(p,'posts'); addCollectionEntry(col,{title:'Hello'}); const ds=addDataSource(p,'rest'); ds.name='api'; ds.url='/api';
setTranslation(p,'en',card.id,'text','Card'); assert.equal(getTranslation(p,'en',card.id,'text'),'Card');
const test=createRecordedTest(p,'Open card'); addTestStep(test,'click',card.id,''); assert.equal(test.steps.length,1);
assert.equal(evaluateExpression('state.open === true',{state:{open:true}}),true);
assert.equal(evaluateExpression('globalThis.process.exit()'),false);

const img=createNode('image',{props:{src:'',alt:''}}); p.pages[0].root.children.push(img);
const fixed=createNode('text',{props:{text:'A very long piece of text that should warn on a small viewport because nowrap is enabled'},style:{base:{width:'900px',whiteSpace:'nowrap'}}});p.pages[0].root.children.push(fixed);
assert.ok(accessibilityAudit(p).some(x=>x.code==='A11Y_ALT'));
assert.ok(responsiveAudit(p,[375]).some(x=>x.code==='RESP_OVERFLOW'));
p.pages[0].seo={title:'',description:''};p.pages[0].root.props.title='';p.pages[0].root.props.description='';p.pages[0].name='';assert.ok(seoAudit(p).some(x=>x.code==='SEO_DESCRIPTION'));
const contrastNode=createNode('text',{props:{text:'Low contrast'},style:{base:{color:'#777777',background:'#888888'}}});p.pages[0].root.children.push(contrastNode);assert.ok(contrastAudit(p).some(x=>x.code==='A11Y_CONTRAST'));
p.assets.push({id:'big',filename:'big.bin',size:3000000});assert.ok(performanceAudit(p).some(x=>x.code==='PERF_ASSET_SIZE')); 
const sum=summarizeResearchFeatures(p);
assert.equal(sum.externalComponents,1); assert.equal(sum.collections,1); assert.equal(sum.dataSources,1); assert.equal(sum.states,1); assert.equal(sum.containerRules,1); assert.equal(sum.timelineTracks,1); assert.equal(sum.tests,1); assert.equal(sum.stories,1);
console.log('research-features.test: OK');
