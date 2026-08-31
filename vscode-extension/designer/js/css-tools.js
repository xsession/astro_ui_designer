const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const splitSpace=(v='')=>String(v).trim().split(/\s+/).filter(Boolean);

export const CSS_PSEUDO_STATES=[
  {id:'base',label:'Base'},
  {id:'hover',label:'Hover',selector:':hover'},
  {id:'focus',label:'Focus',selector:':focus'},
  {id:'focusVisible',label:'Focus visible',selector:':focus-visible'},
  {id:'active',label:'Active',selector:':active'},
  {id:'disabled',label:'Disabled',selector:':disabled'},
];

export function ensureCssNode(node){
  node.cssStates??={hover:{},focus:{},focusVisible:{},active:{},disabled:{}};
  for(const s of CSS_PSEUDO_STATES)if(s.id!=='base')node.cssStates[s.id]??={};
  node.cssVariables??={};
  return node;
}

export function styleTarget(node,breakpoint='base',pseudo='base'){
  ensureCssNode(node);
  if(pseudo==='base'){node.style??={};node.style[breakpoint]??={};return node.style[breakpoint];}
  node.cssStates[pseudo]??={};
  return node.cssStates[pseudo];
}

export function parseQuad(value='0px'){
  const p=splitSpace(value); if(!p.length)return ['','','',''];
  if(p.length===1)return [p[0],p[0],p[0],p[0]];
  if(p.length===2)return [p[0],p[1],p[0],p[1]];
  if(p.length===3)return [p[0],p[1],p[2],p[1]];
  return [p[0],p[1],p[2],p[3]];
}
export function serializeQuad([t,r,b,l]){
  if([t,r,b,l].every(x=>x===t))return t;
  if(t===b&&r===l)return `${t} ${r}`;
  if(r===l)return `${t} ${r} ${b}`;
  return `${t} ${r} ${b} ${l}`;
}

export function parseRadius(value='0px'){
  const base=String(value||'0px').split('/')[0].trim();return parseQuad(base);
}
export const serializeRadius=serializeQuad;

export function gradientCss({type='linear',angle=135,colorA='#3b82f6',colorB='#8b5cf6',position='center'}={}){
  if(type==='radial')return `radial-gradient(circle at ${position}, ${colorA}, ${colorB})`;
  if(type==='conic')return `conic-gradient(from ${Number(angle)||0}deg at ${position}, ${colorA}, ${colorB})`;
  return `linear-gradient(${Number(angle)||0}deg, ${colorA}, ${colorB})`;
}

export function shadowCss({x=0,y=8,blur=24,spread=0,color='rgba(15,23,42,.18)',inset=false}={}){
  return `${inset?'inset ':''}${Number(x)||0}px ${Number(y)||0}px ${Math.max(0,Number(blur)||0)}px ${Number(spread)||0}px ${color}`;
}

export function filterCss({blur=0,brightness=100,contrast=100,saturate=100,hue=0,grayscale=0,sepia=0}={}){
  const out=[];if(Number(blur))out.push(`blur(${Math.max(0,Number(blur))}px)`);if(Number(brightness)!==100)out.push(`brightness(${Math.max(0,Number(brightness))}%)`);if(Number(contrast)!==100)out.push(`contrast(${Math.max(0,Number(contrast))}%)`);if(Number(saturate)!==100)out.push(`saturate(${Math.max(0,Number(saturate))}%)`);if(Number(hue))out.push(`hue-rotate(${Number(hue)}deg)`);if(Number(grayscale))out.push(`grayscale(${clamp(Number(grayscale),0,100)}%)`);if(Number(sepia))out.push(`sepia(${clamp(Number(sepia),0,100)}%)`);return out.join(' ')||'none';
}

export function transformCss({x=0,y=0,rotate=0,scaleX=1,scaleY=1,skewX=0,skewY=0}={}){
  const out=[];if(Number(x)||Number(y))out.push(`translate(${Number(x)||0}px, ${Number(y)||0}px)`);if(Number(rotate))out.push(`rotate(${Number(rotate)}deg)`);if(Number(skewX))out.push(`skewX(${Number(skewX)}deg)`);if(Number(skewY))out.push(`skewY(${Number(skewY)}deg)`);if(Number(scaleX)!==1||Number(scaleY)!==1)out.push(`scale(${Number(scaleX)||1}, ${Number(scaleY)||1})`);return out.join(' ')||'none';
}

export function transitionCss({property='all',duration=200,easing='ease',delay=0}={}){
  return `${property||'all'} ${Math.max(0,Number(duration)||0)}ms ${easing||'ease'} ${Math.max(0,Number(delay)||0)}ms`;
}

export function customPropertyName(name=''){
  const n=String(name).trim().replace(/^--/,'').replace(/[^A-Za-z0-9_-]/g,'-').replace(/^-+|-+$/g,'');
  return n?`--${n}`:'';
}

export function cssDeclarations(style={}){
  const kebab=s=>s.replace(/[A-Z]/g,m=>`-${m.toLowerCase()}`);
  return Object.entries(style).filter(([,v])=>v!==''&&v!=null).map(([k,v])=>`${kebab(k)}: ${v};`).join('\n');
}
