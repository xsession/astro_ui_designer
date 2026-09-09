import assert from 'node:assert/strict';
import {createSampleProject,createNode,makeId} from '../standalone/js/model.js';
import {ensureSimulationProject,createSimulationSession,dispatchSimulationEvent,simulationNodeView,collectDelayedSimulationEvents,simulationSummary,navigateSimulation,navigateSimulationBack} from '../standalone/js/simulation.js';
const p=createSampleProject();ensureSimulationProject(p);
const home=p.pages[0],contact=p.pages[1];
const button=createNode('button',{name:'SimButton',props:{text:'Go'},bindings:{text:'state.message'},actions:[{id:makeId('act'),event:'click',type:'setState',value:'message=Changed'},{id:makeId('act'),event:'click',type:'navigate',value:'/contact'}]});
home.root.children.push(button);
const delayed=createNode('text',{design:{constraints:{horizontal:'left',vertical:'top'},effects:{fills:[],strokes:[],shadows:[],blurs:[],blendMode:'normal'},exportPresets:[],interactions:[{id:'delay1',trigger:'delay',action:'navigate',destination:contact.id,delay:100}],fixedOnScroll:false,clipContent:false,aspectLocked:false,vector:{kind:'none',path:'',booleanOperation:'none'},libraryRef:'',manualLayout:{sizingX:'fixed',sizingY:'fixed',rotation:0,minWidth:'',maxWidth:'',minHeight:'',maxHeight:''}}});home.root.children.push(delayed);
let s=createSimulationSession(p,{pageId:home.id,scope:'project'});assert.equal(simulationNodeView(button,s).props.text,'Hello from state');
const out=dispatchSimulationEvent(p,s,button.id,'click');assert.equal(out.ok,true);assert.equal(s.state.message,'Changed');assert.equal(s.pageId,contact.id);assert.equal(s.history.at(-1),home.id);
assert.equal(simulationSummary(p,s).route,'/contact');
s=createSimulationSession(p,{pageId:home.id,scope:'page'});navigateSimulation(p,s,contact.id);assert.equal(s.pageId,home.id);assert.ok(s.events.some(e=>e.type==='navigation-blocked'));
s=createSimulationSession(p,{pageId:home.id});assert.equal(collectDelayedSimulationEvents(p,s)[0].interactionId,'delay1');
button.bindings.value='state.message';dispatchSimulationEvent(p,s,button.id,'input',{value:'Typed'});assert.equal(s.state.message,'Typed');

// Delay dispatch targets the scheduled interaction only, even when a node has several delay interactions.
const delayNode=createNode('text',{name:'MultiDelay'});delayNode.design.interactions=[
  {id:'delay-a',trigger:'delay',action:'setState',value:'delayA=1',delay:10},
  {id:'delay-b',trigger:'delay',action:'setState',value:'delayB=1',delay:20},
];home.root.children.push(delayNode);
s=createSimulationSession(p,{pageId:home.id});dispatchSimulationEvent(p,s,delayNode.id,'delay',{interactionId:'delay-a'});assert.equal(s.state.delayA,1);assert.equal(s.state.delayB,undefined);
// Visibility conditions are interpreted from state without arbitrary eval.
delayNode.visibilityCondition='state.delayA === 1';assert.equal(simulationNodeView(delayNode,s).visible,true);s.state.delayA=0;assert.equal(simulationNodeView(delayNode,s).visible,false);
// Back navigation restores the prior page.
s=createSimulationSession(p,{pageId:home.id});assert.equal(navigateSimulation(p,s,contact.id),true);assert.equal(navigateSimulationBack(p,s,'test'),true);assert.equal(s.pageId,home.id);

// A plain internal link navigates in project simulation when no explicit click behavior overrides it.
const nativeLink=createNode('link',{name:'NativeContact',props:{text:'Contact',href:'/contact'}});home.root.children.push(nativeLink);s=createSimulationSession(p,{pageId:home.id,scope:'project'});dispatchSimulationEvent(p,s,nativeLink.id,'click');assert.equal(s.pageId,contact.id);
console.log('simulation.test.mjs passed');
