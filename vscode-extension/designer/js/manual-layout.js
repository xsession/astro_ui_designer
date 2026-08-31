import { makeId } from './model.js';

const NUM=v=>{const n=parseFloat(String(v??''));return Number.isFinite(n)?n:0};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));

export const POSITION_MODES=['flow','relative','absolute','fixed','sticky'];
export const SIZING_MODES=['fixed','fill','hug'];
export const SNAP_KINDS=['grid','guides','geometry'];

export function ensureManualLayoutProject(project){
  project.manualLayout ||= {};
  project.manualLayout.version ||= 1;
  project.manualLayout.settings={
    rulers:true,
    snapEnabled:true,
    snapGrid:true,
    snapGuides:true,
    snapGeometry:true,
    snapDistance:6,
    showSmartGuides:true,
    measureOnAlt:true,
    showSpacing:false,
    xray:false,
    bigNudge:8,
    fineNudge:1,
    ...project.manualLayout.settings,
  };
  project.manualLayout.layoutGuides ||= {};
  project.manualLayout.gridEdit ||= {visible:true};
  project.design ||= {};
  project.design.guides ||= [];
  for(const g of project.design.guides){
    g.id ||= makeId('guide');
    g.axis=g.axis==='y'?'y':'x';
    g.position=Number(g.position)||0;
    g.color ||= '#ff4f8b';
    g.locked=Boolean(g.locked);
    g.hidden=Boolean(g.hidden);
    g.breakpoint ||= 'all';
  }
  return project.manualLayout;
}

export function ensureManualLayoutNode(node){
  node.design ||= {};
  node.design.constraints ||= {horizontal:'left',vertical:'top'};
  node.design.aspectLocked=Boolean(node.design.aspectLocked);
  node.design.manualLayout={
    sizingX:'fixed',
    sizingY:'fixed',
    rotation:0,
    minWidth:'',
    maxWidth:'',
    minHeight:'',
    maxHeight:'',
    ...node.design.manualLayout,
  };
  return node.design.manualLayout;
}

export function layoutGuideForBreakpoint(project,bpId='base'){
  const m=ensureManualLayoutProject(project);
  m.layoutGuides[bpId] ||= {enabled:false,type:'columns',count:12,gap:24,margin:48,maxWidth:1200,color:'#3b82f633'};
  return m.layoutGuides[bpId];
}

export function applySizingMode(node,axis,mode){
  const m=ensureManualLayoutNode(node); const s=node.style.base ||= {};
  const key=axis==='y'?'sizingY':'sizingX'; m[key]=SIZING_MODES.includes(mode)?mode:'fixed';
  if(axis==='x'){
    if(mode==='fill'){s.width='100%'; if(s.flex===undefined)s.flex='1 1 auto'}
    else if(mode==='hug'){s.width='fit-content'; if(s.flex==='1 1 auto')delete s.flex}
    else if(s.width==='100%'||s.width==='fit-content'){s.width='220px'; if(s.flex==='1 1 auto')delete s.flex}
  } else {
    if(mode==='fill')s.height='100%';
    else if(mode==='hug')s.height='fit-content';
    else if(s.height==='100%'||s.height==='fit-content')s.height='80px';
  }
  return m[key];
}

export function setPositionMode(node,mode,geometry={}){
  ensureManualLayoutNode(node); const s=node.style.base ||= {};
  if(!POSITION_MODES.includes(mode))mode='flow';
  if(mode==='flow'){
    for(const k of ['position','left','right','top','bottom','inset'])delete s[k];
  } else {
    s.position=mode==='relative'?'relative':mode;
    if(['absolute','fixed','sticky'].includes(mode)){
      if(mode!=='sticky'){
        s.left=s.left||`${Math.round(geometry.left||0)}px`;
        s.top=s.top||`${Math.round(geometry.top||0)}px`;
      } else s.top=s.top||'0px';
    }
  }
  return mode;
}

export function applyRotation(node,degrees){
  const m=ensureManualLayoutNode(node); m.rotation=Math.round(Number(degrees)||0);
  const s=node.style.base ||= {};
  if(m.rotation)s.rotate=`${m.rotation}deg`; else delete s.rotate;
  return m.rotation;
}

function candidatesForAxis(axis,movingRect,parentRect,siblingRects,guides){
  const out=[]; const isX=axis==='x';
  const pStart=isX?parentRect.left:parentRect.top,pSize=isX?parentRect.width:parentRect.height;
  out.push({value:pStart,kind:'parent-edge',label:'parent start'},{value:pStart+pSize/2,kind:'parent-center',label:'parent center'},{value:pStart+pSize,kind:'parent-edge',label:'parent end'});
  for(const x of siblingRects||[]){const start=isX?x.left:x.top,size=isX?x.width:x.height;out.push({value:start,kind:'object-edge',label:x.name||'object'},{value:start+size/2,kind:'object-center',label:x.name||'object'},{value:start+size,kind:'object-edge',label:x.name||'object'})}
  for(const g of guides||[])if(!g.hidden&&g.axis===axis)out.push({value:Number(g.position)||0,kind:'guide',label:g.name||'guide',guideId:g.id});
  return out;
}

export function snapPosition({x,y,width,height,parentRect={left:0,top:0,width:0,height:0},siblingRects=[],guides=[],settings={},gridSize=8}){
  const cfg={snapEnabled:true,snapGrid:true,snapGuides:true,snapGeometry:true,snapDistance:6,...settings};
  if(!cfg.snapEnabled)return {x,y,lines:[]};
  const dist=Math.max(1,Number(cfg.snapDistance)||6),lines=[];
  const snapAxis=(axis,value,size)=>{
    const center=value+size/2,end=value+size;
    let best={delta:Infinity,target:null,source:'start'};
    if(cfg.snapGuides||cfg.snapGeometry){
      for(const c of candidatesForAxis(axis,{left:x,top:y,width,height},parentRect,siblingRects,guides)){
        if(c.kind==='guide'&&!cfg.snapGuides)continue;
        if(c.kind!=='guide'&&!cfg.snapGeometry)continue;
        for(const [source,sv] of [['start',value],['center',center],['end',end]]){
          const d=c.value-sv;if(Math.abs(d)<Math.abs(best.delta)&&Math.abs(d)<=dist)best={delta:d,target:c,source};
        }
      }
    }
    if(best.target){lines.push({axis,value:best.target.value,kind:best.target.kind,label:best.target.label,source:best.source});return value+best.delta}
    if(cfg.snapGrid&&gridSize>0)return Math.round(value/gridSize)*gridSize;
    return value;
  };
  const sx=snapAxis('x',x,width),sy=snapAxis('y',y,height);
  return {x:sx,y:sy,lines};
}

export function smartSelectionMetrics(rects=[]){
  if(rects.length<2)return null;
  const xs=[...rects].sort((a,b)=>a.left-b.left),ys=[...rects].sort((a,b)=>a.top-b.top);
  const hOverlap=rects.every(r=>r.top<Math.min(...rects.map(x=>x.top+x.height))&&r.top+r.height>Math.max(...rects.map(x=>x.top)));
  const vOverlap=rects.every(r=>r.left<Math.min(...rects.map(x=>x.left+x.width))&&r.left+r.width>Math.max(...rects.map(x=>x.left)));
  const gapsH=xs.slice(1).map((r,i)=>r.left-(xs[i].left+xs[i].width));
  const gapsV=ys.slice(1).map((r,i)=>r.top-(ys[i].top+ys[i].height));
  const spread=a=>a.length?Math.max(...a)-Math.min(...a):Infinity;
  let axis='h';if(vOverlap&&!hOverlap)axis='v';else if(hOverlap&&!vOverlap)axis='h';else axis=spread(gapsH)<=spread(gapsV)?'h':'v';
  const sorted=axis==='h'?xs:ys,gaps=axis==='h'?gapsH:gapsV;
  return {axis,sorted,gaps,averageGap:gaps.length?gaps.reduce((a,b)=>a+b,0)/gaps.length:0,equal:spread(gaps)<=1};
}

export function tidyRects(rects=[],axis='auto',gap=null){
  const m=smartSelectionMetrics(rects);if(!m)return [];
  const chosen=axis==='auto'?m.axis:axis,sorted=[...rects].sort((a,b)=>chosen==='h'?a.left-b.left:a.top-b.top);
  const targetGap=gap==null?Math.max(0,Math.round(m.averageGap)):Number(gap)||0;
  let cursor=chosen==='h'?sorted[0].left:sorted[0].top;
  return sorted.map((r,i)=>{const patch=chosen==='h'?{left:cursor}:{top:cursor};cursor+=(chosen==='h'?r.width:r.height)+(i<sorted.length-1?targetGap:0);return {id:r.id,...patch,gap:targetGap,axis:chosen}});
}

export function resizeRect(rect,handle,dx,dy,{aspectLocked=false,fromCenter=false,minWidth=24,minHeight=24}={}){
  let {left,top,width,height}=rect; const ratio=width/Math.max(1,height),h=String(handle||'se');
  const west=h.includes('w'),east=h.includes('e'),north=h.includes('n'),south=h.includes('s');
  if(east)width+=dx;if(south)height+=dy;if(west){left+=dx;width-=dx}if(north){top+=dy;height-=dy}
  if(fromCenter){if(east||west){left-=dx*(east?1:-1);width+=dx*(east?1:-1)}if(north||south){top-=dy*(south?1:-1);height+=dy*(south?1:-1)}}
  if(aspectLocked&&(east||west||north||south)){
    if(Math.abs(dx)>=Math.abs(dy)){const old=height;height=width/ratio;if(north)top+=old-height}
    else{const old=width;width=height*ratio;if(west)left+=old-width}
  }
  if(width<minWidth){if(west)left-=minWidth-width;width=minWidth}if(height<minHeight){if(north)top-=minHeight-height;height=minHeight}
  return {left,top,width,height};
}

export function constrainChildRect(rect,oldParent,newParent,constraints={horizontal:'left',vertical:'top'}){
  let r={...rect};const sx=oldParent.width?newParent.width/oldParent.width:1,sy=oldParent.height?newParent.height/oldParent.height:1;
  const right=oldParent.width-(rect.left+rect.width),bottom=oldParent.height-(rect.top+rect.height);
  switch(constraints.horizontal){
    case'right':r.left=newParent.width-right-r.width;break;
    case'left-right':r.width=Math.max(1,newParent.width-rect.left-right);break;
    case'center':r.left=newParent.width/2-(oldParent.width/2-rect.left);break;
    case'scale':r.left=rect.left*sx;r.width=rect.width*sx;break;
  }
  switch(constraints.vertical){
    case'bottom':r.top=newParent.height-bottom-r.height;break;
    case'top-bottom':r.height=Math.max(1,newParent.height-rect.top-bottom);break;
    case'center':r.top=newParent.height/2-(oldParent.height/2-rect.top);break;
    case'scale':r.top=rect.top*sy;r.height=rect.height*sy;break;
  }
  return r;
}

export function boxSpacing(style={}){
  const parse=(v)=>String(v||'0').trim().split(/\s+/).map(NUM);
  const expand=(vals)=>vals.length===1?[vals[0],vals[0],vals[0],vals[0]]:vals.length===2?[vals[0],vals[1],vals[0],vals[1]]:vals.length===3?[vals[0],vals[1],vals[2],vals[1]]:[vals[0]||0,vals[1]||0,vals[2]||0,vals[3]||0];
  return {margin:expand(parse(style.margin)),padding:expand(parse(style.padding))};
}

export function buildLayoutGuideColumns(width,config){
  if(!config?.enabled||config.type!=='columns')return [];
  const count=Math.max(1,Number(config.count)||12),gap=Math.max(0,Number(config.gap)||0),margin=Math.max(0,Number(config.margin)||0),maxWidth=Math.max(0,Number(config.maxWidth)||0);
  const usable=Math.min(width-margin*2,maxWidth||width-margin*2),start=(width-usable)/2,totalGap=gap*(count-1),col=Math.max(0,(usable-totalGap)/count);
  return Array.from({length:count},(_,i)=>({left:start+i*(col+gap),width:col}));
}
