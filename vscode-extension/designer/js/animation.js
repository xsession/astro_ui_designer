import { makeId } from './model.js';

export const ANIMATION_PROPERTIES = [
  'opacity','transform','translate','rotate','scale','filter','clipPath',
  'background','backgroundColor','color','borderColor','borderRadius','boxShadow',
  'width','height','maxWidth','maxHeight','minWidth','minHeight',
  'margin','marginLeft','marginTop','marginRight','marginBottom',
  'padding','paddingLeft','paddingTop','paddingRight','paddingBottom',
  'left','top','right','bottom','gap','letterSpacing','lineHeight'
];
export const ANIMATION_TRIGGERS = [
  { id:'manual', label:'Manual / action' },
  { id:'load', label:'On load' },
  { id:'hover', label:'Hover' },
  { id:'focus', label:'Focus' },
  { id:'click', label:'Click' },
  { id:'inView', label:'Enter viewport' },
  { id:'scroll', label:'Scroll / view progress' },
];
export const ANIMATION_ENGINES = [
  { id:'auto', label:'Auto · best backend' },
  { id:'css', label:'CSS @keyframes' },
  { id:'waapi', label:'JavaScript · Web Animations API' },
];
export const EASING_PRESETS = ['linear','ease','ease-in','ease-out','ease-in-out','cubic-bezier(.2,.8,.2,1)','cubic-bezier(.4,0,.2,1)','steps(4,end)'];

export const ANIMATION_PRESETS = {
  fadeIn: { label:'Fade in', duration:420, tracks:[['opacity','0','1']] },
  fadeUp: { label:'Fade + rise', duration:520, easing:'cubic-bezier(.2,.8,.2,1)', tracks:[['opacity','0','1'],['transform','translateY(24px)','translateY(0px)']] },
  scaleIn: { label:'Scale in', duration:420, easing:'cubic-bezier(.2,.8,.2,1)', tracks:[['opacity','0','1'],['transform','scale(.92)','scale(1)']] },
  slideLeft: { label:'Slide from right', duration:480, easing:'ease-out', tracks:[['opacity','0','1'],['transform','translateX(32px)','translateX(0px)']] },
  pulse: { label:'Pulse', duration:800, iterations:'infinite', tracks:[['transform','scale(1)','scale(1.06)','scale(1)'],['opacity','1','.82','1']] },
  spin: { label:'Spin', duration:900, iterations:'infinite', easing:'linear', tracks:[['transform','rotate(0deg)','rotate(360deg)']] },
};

export function createDefaultAnimation() {
  return {
    engine:'auto', trigger:'manual', duration:500, delay:0, easing:'ease', iterations:1,
    direction:'normal', fill:'both', playbackRate:1, reducedMotion:'disable',
    scroll:{ timeline:'view', source:'nearest', axis:'block', rangeStart:'entry 0%', rangeEnd:'cover 100%' },
    tracks:[],
  };
}

export function ensureAnimation(node) {
  const old=node.timeline||{};
  const next={...createDefaultAnimation(),...old,scroll:{...createDefaultAnimation().scroll,...(old.scroll||{})}};
  next.duration=Math.max(1,Number(next.duration)||500);
  next.delay=Math.max(0,Number(next.delay)||0);
  next.playbackRate=Number(next.playbackRate)||1;
  next.iterations=String(next.iterations??1)==='infinite'?'infinite':Math.max(1,Number(next.iterations)||1);
  next.tracks=next.tracks||[]; for(const track of next.tracks)normalizeTrackInPlace(track);
  node.timeline=next;
  return next;
}
function normalizeTrackInPlace(track){
  track.id ||= makeId('track'); track.property ||= 'opacity'; track.keyframes ||= [];
  for(const k of track.keyframes){k.id ||= makeId('kf');k.at=clamp01(Number(k.at));k.value=String(k.value??'');k.easing=String(k.easing||'');}
  if(!track.keyframes.length)track.keyframes.push({id:makeId('kf'),at:0,value:'',easing:''},{id:makeId('kf'),at:1,value:'',easing:''});
  track.keyframes.sort((a,b)=>a.at-b.at);return track;
}
function normalizeTrack(track){
  const keyframes=(track.keyframes||[]).map(k=>({id:k.id||makeId('kf'),at:clamp01(Number(k.at)),value:String(k.value??''),easing:String(k.easing||'')})).sort((a,b)=>a.at-b.at);
  if(!keyframes.length)keyframes.push({id:makeId('kf'),at:0,value:'',easing:''},{id:makeId('kf'),at:1,value:'',easing:''});
  return {id:track.id||makeId('track'),property:track.property||'opacity',keyframes};
}
const clamp01=n=>Math.max(0,Math.min(1,Number.isFinite(n)?n:0));

export function createAnimationTrack(node, property='opacity') {
  const animation=ensureAnimation(node);
  const track=normalizeTrack({property,keyframes:[{at:0,value:defaultValue(property,0)},{at:1,value:defaultValue(property,1)}]});
  animation.tracks.push(track); return track;
}
export function addAnimationKeyframe(node, trackId, at=.5, value='') {
  const animation=ensureAnimation(node); const tr=animation.tracks.find(x=>x.id===trackId); if(!tr)return null;
  const kf={id:makeId('kf'),at:clamp01(at),value:String(value??interpolateValue(tr,at)),easing:''}; tr.keyframes.push(kf);tr.keyframes.sort((a,b)=>a.at-b.at);return kf;
}
export function removeAnimationKeyframe(node,trackId,keyframeId){const tr=ensureAnimation(node).tracks.find(x=>x.id===trackId);if(!tr)return false;if(tr.keyframes.length<=1)return false;const i=tr.keyframes.findIndex(k=>k.id===keyframeId);if(i<0)return false;tr.keyframes.splice(i,1);return true;}
export function moveAnimationKeyframe(node,trackId,keyframeId,at){const tr=ensureAnimation(node).tracks.find(x=>x.id===trackId);const k=tr?.keyframes.find(k=>k.id===keyframeId);if(!k)return false;k.at=clamp01(at);tr.keyframes.sort((a,b)=>a.at-b.at);return true;}

function defaultValue(property,end){
  if(property==='opacity')return end?'1':'0';
  if(property==='transform')return end?'none':'translateY(20px)';
  if(property==='scale')return end?'1':'0.9';
  if(property==='rotate')return end?'0deg':'-6deg';
  if(property==='filter')return end?'blur(0px)':'blur(8px)';
  return '';
}
function interpolateValue(track,at){
  const f=track.keyframes[0],l=track.keyframes.at(-1); if(!f||!l)return '';
  const a=parseNumeric(f.value),b=parseNumeric(l.value);if(a&&b&&a.unit===b.unit){const x=a.n+(b.n-a.n)*clamp01(at);return `${Math.round(x*1000)/1000}${a.unit}`;}return at<.5?f.value:l.value;
}
function parseNumeric(v){const m=String(v).trim().match(/^(-?\d+(?:\.\d+)?)([A-Za-z%]*)$/);return m?{n:Number(m[1]),unit:m[2]}:null;}

export function applyAnimationPreset(node,presetId){const p=ANIMATION_PRESETS[presetId];if(!p)return false;const a=ensureAnimation(node);a.duration=p.duration||500;a.easing=p.easing||'ease';a.iterations=p.iterations||1;a.tracks=[];for(const spec of p.tracks){const [property,...values]=spec;const count=values.length;a.tracks.push(normalizeTrack({property,keyframes:values.map((value,i)=>({at:count===1?1:i/(count-1),value}))}));}return true;}

export function resolveAnimationEngine(animation){const a={...createDefaultAnimation(),...(animation||{})};if(a.engine==='css'||a.engine==='waapi')return a.engine;return ['load','hover','focus','scroll'].includes(a.trigger)?'css':'waapi';}

export function compiledKeyframes(animation){const a=animation||createDefaultAnimation();const points=new Map();for(const tr of a.tracks||[]){for(const kf of tr.keyframes||[]){const at=clamp01(Number(kf.at));const obj=points.get(at)||{offset:at};obj[tr.property]=kf.value;if(kf.easing)obj.easing=kf.easing;points.set(at,obj);}}
  return [...points.values()].sort((x,y)=>x.offset-y.offset);
}
export function animationOptions(animation){const a={...createDefaultAnimation(),...(animation||{})};return {duration:Math.max(1,Number(a.duration)||500),delay:Math.max(0,Number(a.delay)||0),easing:a.easing||'ease',iterations:a.iterations==='infinite'?Infinity:Math.max(1,Number(a.iterations)||1),direction:a.direction||'normal',fill:a.fill||'both'};}
export function animationName(node){return `ui-animation-${String(node?.id||'node').replace(/[^A-Za-z0-9_-]/g,'-')}`;}
const kebab=v=>String(v).replace(/[A-Z]/g,m=>`-${m.toLowerCase()}`);
function cssFrames(node){const frames=compiledKeyframes(ensureAnimation(node));const name=animationName(node);let out=`@keyframes ${name} {`;
  for(const f of frames){const entries=Object.entries(f).filter(([k,v])=>!['offset','easing'].includes(k)&&v!==''&&v!=null);if(f.easing)entries.push(['animationTimingFunction',f.easing]);out+=`\n  ${Math.round(f.offset*10000)/100}% { ${entries.map(([k,v])=>`${kebab(k)}: ${v};`).join(' ')} }`;}
  return `${out}\n}`;
}
function cssTiming(node){const a=ensureAnimation(node);const iterations=a.iterations==='infinite'?'infinite':a.iterations;return [`animation-name: ${animationName(node)};`,`animation-duration: ${a.duration}ms;`,`animation-delay: ${a.delay}ms;`,`animation-timing-function: ${a.easing};`,`animation-iteration-count: ${iterations};`,`animation-direction: ${a.direction};`,`animation-fill-mode: ${a.fill};`];}
export function generateAnimationCss(node,selector=`.ui-${String(node?.id||'node').replace(/[^A-Za-z0-9_-]/g,'-')}`){const a=ensureAnimation(node);if(!a.tracks.length)return '';
  let attach='';const timing=cssTiming(node);
  if(a.trigger==='load')attach=`${selector} {\n  ${timing.join('\n  ')}\n}`;
  else if(a.trigger==='hover')attach=`${selector}:hover {\n  ${timing.join('\n  ')}\n}`;
  else if(a.trigger==='focus')attach=`${selector}:focus-visible {\n  ${timing.join('\n  ')}\n}`;
  else if(a.trigger==='scroll'){
    const s=a.scroll||{};const fn=s.timeline==='scroll'?`scroll(${s.source||'nearest'} ${s.axis||'block'})`:`view(${s.axis||'block'})`;
    attach=`${selector} {\n  animation-name: ${animationName(node)};\n  animation-duration: 1ms;\n  animation-timing-function: ${a.easing||'linear'};\n  animation-fill-mode: ${a.fill||'both'};\n  animation-timeline: ${fn};\n  animation-range: ${s.rangeStart||'entry 0%'} ${s.rangeEnd||'cover 100%'};\n}`;
  } else attach=`${selector} {\n  /* ${a.trigger} trigger: add .ui-animation-running or use the generated runtime */\n}\n${selector}.ui-animation-running {\n  ${timing.join('\n  ')}\n}`;
  const rm=a.reducedMotion==='allow'?'':a.reducedMotion==='shorten'?`\n\n@media (prefers-reduced-motion: reduce) {\n  ${selector} { animation-duration: 80ms !important; animation-iteration-count: 1 !important; }\n}`:`\n\n@media (prefers-reduced-motion: reduce) {\n  ${selector} { animation: none !important; }\n}`;
  return `${cssFrames(node)}\n\n${attach}${rm}`;
}

export function generateAnimationJs(node,targetExpr=`document.querySelector('[data-ui-id="${String(node?.id||'')}"]')`){
  const a=ensureAnimation(node);const frames=compiledKeyframes(a).map(f=>Object.fromEntries(Object.entries(f).filter(([,v])=>v!==''&&v!=null)));const options=animationOptions(a);const jsonOpts={...options,iterations:options.iterations===Infinity?'Infinity':options.iterations};let opts=JSON.stringify(jsonOpts,null,2).replace('"Infinity"','Infinity');
  const base=`const target = ${targetExpr};\nconst keyframes = ${JSON.stringify(frames,null,2)};\nconst options = ${opts};\nconst reducedMotion = ${JSON.stringify(a.reducedMotion||'disable')};\nconst reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;\nif (reduce && reducedMotion === 'shorten') { options.duration = Math.min(Number(options.duration) || 500, 80); options.iterations = 1; }\nlet animation;\nconst makeAnimation = () => { if (reduce && reducedMotion === 'disable') return null; animation?.cancel(); animation = target?.animate(keyframes, options); if (animation) animation.playbackRate = ${Number(a.playbackRate)||1}; return animation; };\n`;
  if(a.trigger==='load')return base+`makeAnimation();\n`;
  if(a.trigger==='hover')return base+`target?.addEventListener('pointerenter',()=>makeAnimation());\ntarget?.addEventListener('pointerleave',()=>animation?.cancel());\n`;
  if(a.trigger==='focus')return base+`target?.addEventListener('focusin',()=>makeAnimation());\ntarget?.addEventListener('focusout',()=>animation?.cancel());\n`;
  if(a.trigger==='click')return base+`target?.addEventListener('click',()=>makeAnimation());\n`;
  if(a.trigger==='inView')return base+`if(target){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))makeAnimation();},{threshold:.15});observer.observe(target);}\n`;
  if(a.trigger==='scroll')return base+`if(target){let raf=0;const update=()=>{raf=0;const r=target.getBoundingClientRect();const span=innerHeight+r.height;const progress=Math.max(0,Math.min(1,(innerHeight-r.top)/span));if(!animation){animation=target.animate(keyframes,{...options,duration:1000});animation.pause();}animation.currentTime=progress*1000;};addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(update)},{passive:true});update();}\n`;
  return base+`animation = makeAnimation(); animation?.pause(); // control with play(), pause(), reverse() or currentTime\n`;
}

export function animationRuntimePayload(node){const a=ensureAnimation(node);return {engine:resolveAnimationEngine(a),trigger:a.trigger,keyframes:compiledKeyframes(a),options:{...animationOptions(a),iterations:a.iterations==='infinite'?'Infinity':Number(a.iterations)||1},playbackRate:Number(a.playbackRate)||1,reducedMotion:a.reducedMotion||'disable',scroll:a.scroll||{}};}

export function validateAnimation(node){const a=ensureAnimation(node),issues=[];if(!a.tracks.length)return issues;if(a.duration<=0)issues.push({code:'ANIM01',message:'Animation duration must be greater than zero.'});const props=new Set();for(const tr of a.tracks){if(!tr.property)issues.push({code:'ANIM02',message:'Animation track has no property.'});if(props.has(tr.property))issues.push({code:'ANIM03',message:`Duplicate animation track for ${tr.property}.`});props.add(tr.property);for(const k of tr.keyframes){if(k.at<0||k.at>1)issues.push({code:'ANIM04',message:'Keyframe offset must be between 0 and 1.'});}}
  if(a.engine==='css'&&['click','inView'].includes(a.trigger))issues.push({code:'ANIM05',message:`${a.trigger} needs runtime assistance; Auto/JavaScript is recommended.`});return issues;}
