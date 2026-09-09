// Deterministic page/project simulation for Astro UI Designer.
// It intentionally interprets the designer's declarative action/prototype model
// without executing arbitrary user code.
import { deepClone, allNodes, findNode } from './model.js';

const now=()=>new Date().toISOString();
const clone=v=>deepClone(v);
const bool=v=>v===true||String(v).toLowerCase()==='true';

export function ensureSimulationProject(project){
  project.simulation ||= {};
  project.simulation.version ||= 1;
  project.simulation.settings={scope:'project',viewport:'desktop',showHotspots:true,showState:true,reducedMotion:false,autoDelays:true,...project.simulation.settings};
  project.simulation.fixtures ||= [];
  return project.simulation;
}

export function resolveSimulationPage(project,ref=''){
  const pages=project?.pages||[];
  if(!ref)return pages[0]||null;
  const s=String(ref);
  return pages.find(p=>p.id===s||p.route===s||p.filename===s||p.name===s)||null;
}

export function createSimulationState(project){
  const out={};
  for(const v of project?.variables||[])out[v.name]=clone(v.initial);
  return out;
}

function flowStart(project,flowId=''){
  const flows=project?.design?.flows||[],f=flows.find(x=>x.id===flowId)||null;
  return f?.startPageId||'';
}

export function createSimulationSession(project,{pageId='',flowId='',scope='project',viewport='desktop',fixtureId=''}={}){
  ensureSimulationProject(project);
  const start=resolveSimulationPage(project,flowStart(project,flowId)||pageId)||project.pages?.[0]||null;
  if(!start)throw new Error('Simulation requires at least one page.');
  const state=createSimulationState(project),fixture=(project.simulation.fixtures||[]).find(x=>x.id===fixtureId||x.name===fixtureId);if(fixture?.state&&typeof fixture.state==='object')Object.assign(state,clone(fixture.state));
  return {
    version:1,id:`sim-${Date.now().toString(36)}`,scope:scope==='page'?'page':'project',flowId:String(flowId||''),viewport,fixtureId:fixture?.id||'',
    pageId:start.id,route:start.route||'/',history:[],state,nodeOverrides:{},overlays:[],events:[],externalUrls:[],emitted:[],animationState:{},startedAt:now(),updatedAt:now(),sequence:0
  };
}

function eventLog(session,type,detail={}){
  const item={seq:++session.sequence,time:now(),type,...clone(detail)};
  session.events.push(item);if(session.events.length>500)session.events.splice(0,session.events.length-500);session.updatedAt=item.time;return item;
}

function valueAtPath(base,path=''){
  let cur=base;for(const part of String(path).split('.').filter(Boolean)){if(cur==null)return undefined;cur=cur[part]}return cur;
}

export function resolveSimulationExpression(expression,session,context={}){
  if(expression==null)return expression;
  if(typeof expression!=='string')return clone(expression);
  const raw=expression.trim();
  const sources={state:session?.state||{},props:context.props||{},query:context.query||{},context:context.context||{}};
  if(/^(state|props|query|context)\.[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/.test(raw)){
    const [scope,...parts]=raw.split('.');return valueAtPath(sources[scope],parts.join('.'));
  }
  return expression.replace(/\{\{\s*((?:state|props|query|context)\.[\w$.]+)\s*\}\}/g,(_,expr)=>{
    const [scope,...parts]=expr.split('.'),v=valueAtPath(sources[scope],parts.join('.'));return v==null?'':String(v);
  });
}


export function evaluateSimulationCondition(condition,session,context={}){
  if(condition==null||condition==='')return true;
  if(typeof condition==='boolean')return condition;
  const raw=String(condition).trim();if(!raw)return true;
  if(raw.startsWith('!')&&!/[=!<>]/.test(raw.slice(1)))return !Boolean(resolveSimulationExpression(raw.slice(1).trim(),session,context));
  const m=raw.match(/^((?:state|props|query|context)\.[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*(===|==|!==|!=|>=|<=|>|<)\s*(.+)$/);
  if(m){const left=resolveSimulationExpression(m[1],session,context),right=parseSimulationLiteral(m[3],session,context);switch(m[2]){case'===':return left===right;case'==':return left==right;case'!==':return left!==right;case'!=':return left!=right;case'>=':return Number(left)>=Number(right);case'<=':return Number(left)<=Number(right);case'>':return Number(left)>Number(right);case'<':return Number(left)<Number(right)}}
  const resolved=resolveSimulationExpression(raw,session,context);return typeof resolved==='string'?resolved.trim()!==''&&resolved!=='false'&&resolved!=='0':Boolean(resolved);
}
export function parseSimulationLiteral(value,session,context={}){
  if(typeof value!=='string')return clone(value);
  const resolved=resolveSimulationExpression(value,session,context);
  if(typeof resolved!=='string')return resolved;
  const s=resolved.trim();if(s==='true')return true;if(s==='false')return false;if(s==='null')return null;if(s==='undefined')return undefined;
  if(/^-?(?:\d+\.?\d*|\.\d+)$/.test(s))return Number(s);
  if((s.startsWith('{')&&s.endsWith('}'))||(s.startsWith('[')&&s.endsWith(']')))try{return JSON.parse(s)}catch{}
  return resolved;
}

export function simulationNodeView(node,session){
  const ov=session?.nodeOverrides?.[node.id]||{},props=clone(node.props||{}),bindings=node.bindings||{};
  for(const [key,expr] of Object.entries(bindings)){const value=resolveSimulationExpression(expr,session,{props});if(value!==undefined)props[key]=value}
  for(const [key,value] of Object.entries(ov.props||{}))props[key]=value;
  const conditionVisible=evaluateSimulationCondition(node.visibilityCondition,session,{props});
  const visible=ov.hidden===true?false:ov.hidden===false?true:!node.meta?.hidden&&conditionVisible;
  return {props,visible,classNames:[...new Set([...(String(node.meta?.className||'').split(/\s+/).filter(Boolean)),...(ov.classNames||[])])],componentState:ov.componentState??node.componentState??'default'};
}

function projectNode(project,id){for(const owner of [...(project.pages||[]),...(project.components||[])]){const n=findNode(owner.root,id);if(n)return {node:n,owner}}return null}
function override(session,id){session.nodeOverrides[id]??={props:{},classNames:[]};session.nodeOverrides[id].props??={};session.nodeOverrides[id].classNames??=[];return session.nodeOverrides[id]}

export function navigateSimulation(project,session,destination,{replace=false,source='action'}={}){
  const page=resolveSimulationPage(project,destination);if(!page){eventLog(session,'navigation-miss',{destination,source});return false}
  if(session.scope==='page'&&page.id!==session.pageId){eventLog(session,'navigation-blocked',{destination:page.id,scope:'page',source});return false}
  if(!replace)session.history.push(session.pageId);
  session.pageId=page.id;session.route=page.route||'/';session.overlays=[];eventLog(session,'navigate',{pageId:page.id,route:session.route,source});return true;
}

export function navigateSimulationBack(project,session,source='action'){
  const prev=session.history.pop();if(!prev){eventLog(session,'previous-empty',{source});return false}
  const p=resolveSimulationPage(project,prev);if(!p)return false;session.pageId=p.id;session.route=p.route||'/';session.overlays=[];eventLog(session,'previous',{pageId:p.id,route:session.route,source});return true;
}

function setStateFromAction(session,value){
  const s=String(value||''),i=s.indexOf('=');if(i<1)return false;const name=s.slice(0,i).trim();if(!name)return false;session.state[name]=parseSimulationLiteral(s.slice(i+1),session);return name;
}
function pushOverlay(session,ref,source){if(!ref)return false;if(!session.overlays.some(x=>x.ref===ref))session.overlays.push({ref,source,openedAt:now()});eventLog(session,'overlay-open',{ref,source});return true}
function closeOverlay(session,ref='',source='action'){if(!session.overlays.length)return false;if(ref){const i=session.overlays.findIndex(x=>x.ref===ref);if(i>=0)session.overlays.splice(i,1)}else session.overlays.pop();eventLog(session,'overlay-close',{ref,source});return true}

export function executeSimulationAction(project,session,action,{node=null,event='click',prototype=false}={}){
  const type=String(action?.type||action?.action||''),sourceNode=node?.id||'',target=action?.target||action?.destination||'',value=action?.value??action?.url??'';
  const meta={actionId:action?.id||'',type,nodeId:sourceNode,event,prototype};
  if(!evaluateSimulationCondition(action?.condition,session,{props:node?.props||{}})){eventLog(session,'action-skipped',{...meta,reason:'condition'});return {...meta,skipped:true};}
  switch(type){
    case'navigate':navigateSimulation(project,session,target||value,{source:sourceNode||'action'});break;
    case'previous':navigateSimulationBack(project,session,sourceNode||'action');break;
    case'openOverlay':pushOverlay(session,target||value,sourceNode);break;
    case'toggleOverlay':{const ref=target||value;if(session.overlays.some(x=>x.ref===ref))closeOverlay(session,ref,sourceNode);else pushOverlay(session,ref,sourceNode);break}
    case'closeOverlay':closeOverlay(session,target||'',sourceNode);break;
    case'openUrl':session.externalUrls.push(String(value||target));eventLog(session,'open-url',{url:String(value||target),nodeId:sourceNode});break;
    case'setState':{const name=setStateFromAction(session,value);eventLog(session,'state-set',{name,value:name?clone(session.state[name]):value,nodeId:sourceNode});break}
    case'toggleState':{const name=String(value||target||'').trim();if(name)session.state[name]=!bool(session.state[name]);eventLog(session,'state-toggle',{name,value:clone(session.state[name]),nodeId:sourceNode});break}
    case'show':if(target){override(session,target).hidden=false;eventLog(session,'show',{target,nodeId:sourceNode})}break;
    case'hide':if(target){override(session,target).hidden=true;eventLog(session,'hide',{target,nodeId:sourceNode})}break;
    case'toggleClass':if(target){const o=override(session,target),klass=String(value||'').trim(),i=o.classNames.indexOf(klass);if(klass){if(i>=0)o.classNames.splice(i,1);else o.classNames.push(klass)}eventLog(session,'class-toggle',{target,className:klass,nodeId:sourceNode})}break;
    case'setText':if(target){override(session,target).props.text=resolveSimulationExpression(value,session);eventLog(session,'text-set',{target,value:override(session,target).props.text,nodeId:sourceNode})}break;
    case'setComponentState':if(target){override(session,target).componentState=String(value||'default');eventLog(session,'component-state',{target,value:String(value||'default'),nodeId:sourceNode})}break;
    case'emit':session.emitted.push({name:String(value||''),nodeId:sourceNode,time:now()});eventLog(session,'emit',{name:String(value||''),nodeId:sourceNode});break;
    case'scrollTo':eventLog(session,'scroll-to',{target,nodeId:sourceNode});break;
    case'submit':eventLog(session,'submit',{nodeId:sourceNode});break;
    case'playAnimation':case'startTimeline':if(target||sourceNode)session.animationState[target||sourceNode]='playing';eventLog(session,'animation',{target:target||sourceNode,state:'playing'});break;
    case'pauseAnimation':if(target||sourceNode)session.animationState[target||sourceNode]='paused';eventLog(session,'animation',{target:target||sourceNode,state:'paused'});break;
    case'stopAnimation':case'stopTimeline':if(target||sourceNode)session.animationState[target||sourceNode]='stopped';eventLog(session,'animation',{target:target||sourceNode,state:'stopped'});break;
    case'reverseAnimation':if(target||sourceNode)session.animationState[target||sourceNode]='reverse';eventLog(session,'animation',{target:target||sourceNode,state:'reverse'});break;
    case'seekAnimation':eventLog(session,'animation-seek',{target:target||sourceNode,progress:Number(value)||0});break;
    case'invokeGlobalAction':eventLog(session,'global-action',{name:String(value||''),nodeId:sourceNode});break;
    case'':break;
    default:eventLog(session,'unsupported-action',{...meta});break;
  }
  return meta;
}

function triggerName(event='click'){return ({click:'click',mouseenter:'mouseenter',mouseleave:'mouseleave',delay:'delay',input:'input',change:'change',focus:'focus',blur:'blur',submit:'submit',reset:'reset'}[event]||event)}

export function dispatchSimulationEvent(project,session,nodeId,event='click',context={}){
  const hit=projectNode(project,nodeId);if(!hit){eventLog(session,'missing-node',{nodeId,event});return {ok:false,reason:'node-not-found'}};
  const node=hit.node,ev=triggerName(event);eventLog(session,'event',{nodeId,event:ev});
  // Two-way form binding for direct state.foo bindings.
  if(['input','change'].includes(ev)&&context.value!==undefined){for(const key of ['value','checked']){const expr=node.bindings?.[key];if(typeof expr==='string'&&/^state\.[A-Za-z_$][\w$]*$/.test(expr)){const name=expr.slice(6);session.state[name]=key==='checked'?Boolean(context.value):context.value;eventLog(session,'binding-write',{nodeId,key,state:name,value:clone(session.state[name])})}}}
  const actions=(node.actions||[]).filter(a=>String(a.event||'click')===ev);
  for(const a of actions)executeSimulationAction(project,session,a,{node,event:ev});
  const interactions=(node.design?.interactions||[]).filter(i=>triggerName(i.trigger||'click')===ev&&(!context.interactionId||i.id===context.interactionId));
  for(const i of interactions)executeSimulationAction(project,session,i,{node,event:ev,prototype:true});
  // Preserve basic declarative link behavior when no explicit click behavior overrides it.
  if(ev==='click'&&!actions.length&&!interactions.length&&node.type==='link'){
    const href=String(node.props?.href||'').trim();
    if(href&&!href.startsWith('#')){
      const target=resolveSimulationPage(project,href);
      if(target)navigateSimulation(project,session,target.id,{source:node.id});
      else{session.externalUrls.push(href);eventLog(session,'open-url',{url:href,nodeId:node.id,native:true})}
    }
  }
  return {ok:true,actions:actions.length,interactions:interactions.length,pageId:session.pageId,route:session.route,state:clone(session.state),overlays:clone(session.overlays)};
}

export function collectDelayedSimulationEvents(project,session){
  const page=resolveSimulationPage(project,session.pageId);if(!page)return [];
  const out=[];for(const node of allNodes(page.root)){for(const i of node.design?.interactions||[])if(i.trigger==='delay')out.push({nodeId:node.id,delay:Math.max(0,Number(i.delay)||0),interactionId:i.id})}
  return out.sort((a,b)=>a.delay-b.delay);
}

export function resetSimulation(project,session,{pageId='',flowId=session?.flowId||'',scope=session?.scope||'project',fixtureId=session?.fixtureId||''}={}){
  return createSimulationSession(project,{pageId:pageId||session?.pageId||'',flowId,scope,viewport:session?.viewport||'desktop',fixtureId});
}

export function simulationSummary(project,session){
  const page=resolveSimulationPage(project,session?.pageId);return {id:session?.id||'',scope:session?.scope||'',pageId:page?.id||'',pageName:page?.name||'',route:page?.route||'',history:session?.history?.length||0,overlays:session?.overlays?.length||0,state:clone(session?.state||{}),events:session?.events?.length||0,externalUrls:clone(session?.externalUrls||[])};
}

export function simulationHotspots(project,session){
  const page=resolveSimulationPage(project,session?.pageId);if(!page)return [];
  return allNodes(page.root).filter(n=>(n.actions||[]).length||(n.design?.interactions||[]).length).map(n=>({id:n.id,name:n.name||n.type,actions:(n.actions||[]).length,interactions:(n.design?.interactions||[]).length}));
}
