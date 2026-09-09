// Advanced direct-manipulation primitives inspired by public Penpot viewport
// behavior. Pure functions keep pointer/UI code out of the geometry math.

const num=(v,f=0)=>{const n=Number(v);return Number.isFinite(n)?n:f};
const clone=v=>JSON.parse(JSON.stringify(v));

export function normalizeSelection(ids=[], primary='') {
  const out=[];
  for (const id of ids||[]) {
    const s=String(id||'').trim();
    if (s && !out.includes(s)) out.push(s);
  }
  if (primary) {
    const p=String(primary);
    const i=out.indexOf(p);
    if (i>=0) out.splice(i,1);
    out.unshift(p);
  }
  return out;
}

export function rectBounds(rects=[]) {
  const r=(rects||[]).filter(Boolean);
  if(!r.length)return {left:0,top:0,width:0,height:0,right:0,bottom:0,cx:0,cy:0};
  const left=Math.min(...r.map(x=>num(x.left))),top=Math.min(...r.map(x=>num(x.top)));
  const right=Math.max(...r.map(x=>num(x.left)+Math.max(0,num(x.width)))),bottom=Math.max(...r.map(x=>num(x.top)+Math.max(0,num(x.height))));
  return {left,top,width:right-left,height:bottom-top,right,bottom,cx:(left+right)/2,cy:(top+bottom)/2};
}

export function rectIntersects(a,b,{contain=false}={}) {
  if(!a||!b)return false;
  const ar={left:num(a.left),top:num(a.top),right:num(a.left)+num(a.width),bottom:num(a.top)+num(a.height)};
  const br={left:num(b.left),top:num(b.top),right:num(b.left)+num(b.width),bottom:num(b.top)+num(b.height)};
  return contain?ar.left>=br.left&&ar.top>=br.top&&ar.right<=br.right&&ar.bottom<=br.bottom:ar.right>=br.left&&ar.left<=br.right&&ar.bottom>=br.top&&ar.top<=br.bottom;
}

export function marqueeSelection(items=[], marquee, {contain=false}={}) {
  return (items||[]).filter(x=>rectIntersects(x,marquee,{contain})).map(x=>x.id).filter(Boolean);
}

export function alignRects(items=[], mode='left', reference='selection') {
  const rects=(items||[]).map(x=>({...x}));
  if(rects.length<2)return [];
  const b=reference&&typeof reference==='object'?reference:rectBounds(rects);
  return rects.map(r=>{
    let left=num(r.left),top=num(r.top);
    if(mode==='left')left=b.left;
    else if(mode==='right')left=b.right-num(r.width);
    else if(mode==='hcenter')left=b.cx-num(r.width)/2;
    else if(mode==='top')top=b.top;
    else if(mode==='bottom')top=b.bottom-num(r.height);
    else if(mode==='vcenter')top=b.cy-num(r.height)/2;
    return {id:r.id,left,top};
  });
}

export function distributeRects(items=[], axis='h', {gap=null}={}) {
  const rects=(items||[]).map(x=>({...x}));
  if(rects.length<3)return [];
  const horizontal=axis==='h'||axis==='x';
  rects.sort((a,b)=>horizontal?num(a.left)-num(b.left):num(a.top)-num(b.top));
  const first=rects[0],last=rects.at(-1);
  const start=horizontal?num(first.left):num(first.top);
  const end=horizontal?num(last.left)+num(last.width):num(last.top)+num(last.height);
  const occupied=rects.reduce((s,r)=>s+(horizontal?num(r.width):num(r.height)),0);
  const resolvedGap=gap==null?(end-start-occupied)/(rects.length-1):num(gap);
  let cursor=start;
  return rects.map((r,i)=>{
    const patch={id:r.id};
    if(horizontal)patch.left=cursor;else patch.top=cursor;
    cursor+=(horizontal?num(r.width):num(r.height))+(i<rects.length-1?resolvedGap:0);
    patch.gap=resolvedGap;
    return patch;
  });
}

export function tidyRects(items=[], axis='h', gap=null) {
  if((items||[]).length<2)return [];
  const horizontal=axis==='h'||axis==='x';
  const rects=(items||[]).map(x=>({...x})).sort((a,b)=>horizontal?num(a.left)-num(b.left):num(a.top)-num(b.top));
  let inferred=gap;
  if(inferred==null&&rects.length>1){
    const gaps=[];
    for(let i=1;i<rects.length;i++)gaps.push((horizontal?num(rects[i].left):num(rects[i].top))-(horizontal?num(rects[i-1].left)+num(rects[i-1].width):num(rects[i-1].top)+num(rects[i-1].height)));
    inferred=gaps.reduce((a,b)=>a+b,0)/Math.max(1,gaps.length);
  }
  inferred=Math.max(0,num(inferred));
  let cursor=horizontal?num(rects[0].left):num(rects[0].top);
  return rects.map((r,i)=>{
    const patch={id:r.id,gap:inferred};
    if(horizontal)patch.left=cursor;else patch.top=cursor;
    cursor+=(horizontal?num(r.width):num(r.height))+(i<rects.length-1?inferred:0);
    return patch;
  });
}

export function scaleSelectionRects(items=[], fromBounds, toBounds, {scaleSize=true,minWidth=1,minHeight=1}={}) {
  const from=fromBounds||rectBounds(items),to=toBounds||from;
  const sx=Math.abs(from.width)>1e-6?to.width/from.width:1,sy=Math.abs(from.height)>1e-6?to.height/from.height:1;
  return (items||[]).map(r=>({
    id:r.id,
    left:to.left+(num(r.left)-from.left)*sx,
    top:to.top+(num(r.top)-from.top)*sy,
    width:scaleSize?Math.max(minWidth,num(r.width)*sx):num(r.width),
    height:scaleSize?Math.max(minHeight,num(r.height)*sy):num(r.height),
  }));
}

export function rotateSelectionRects(items=[], deltaDegrees=0, center=null) {
  const b=rectBounds(items),c=center||{x:b.cx,y:b.cy},rad=num(deltaDegrees)*Math.PI/180,cos=Math.cos(rad),sin=Math.sin(rad);
  return (items||[]).map(r=>{
    const cx=num(r.left)+num(r.width)/2,cy=num(r.top)+num(r.height)/2,dx=cx-c.x,dy=cy-c.y;
    const nx=c.x+dx*cos-dy*sin,ny=c.y+dx*sin+dy*cos;
    return {id:r.id,left:nx-num(r.width)/2,top:ny-num(r.height)/2,rotationDelta:num(deltaDegrees)};
  });
}

export function spacingHints(items=[], threshold=1.25) {
  const rects=(items||[]).map(x=>({...x}));
  if(rects.length<3)return [];
  const hints=[];
  for(const horizontal of [true,false]){
    const sorted=[...rects].sort((a,b)=>horizontal?num(a.left)-num(b.left):num(a.top)-num(b.top));
    const gaps=[];
    for(let i=1;i<sorted.length;i++)gaps.push({a:sorted[i-1],b:sorted[i],gap:(horizontal?num(sorted[i].left):num(sorted[i].top))-(horizontal?num(sorted[i-1].left)+num(sorted[i-1].width):num(sorted[i-1].top)+num(sorted[i-1].height))});
    if(gaps.length<2)continue;
    const avg=gaps.reduce((s,g)=>s+g.gap,0)/gaps.length;
    if(Math.max(...gaps.map(g=>Math.abs(g.gap-avg)))<=threshold)hints.push({axis:horizontal?'h':'v',gap:avg,pairs:gaps.map(g=>[g.a.id,g.b.id])});
  }
  return hints;
}

export function reorderIndices(length, selectedIndices=[], operation='forward') {
  const arr=Array.from({length},(_,i)=>i),set=new Set(selectedIndices.filter(i=>i>=0&&i<length));
  if(!set.size)return arr;
  if(operation==='front')return [...arr.filter(i=>!set.has(i)),...arr.filter(i=>set.has(i))];
  if(operation==='back')return [...arr.filter(i=>set.has(i)),...arr.filter(i=>!set.has(i))];
  if(operation==='forward'){
    for(let i=length-2;i>=0;i--)if(set.has(arr[i])&&!set.has(arr[i+1]))[arr[i],arr[i+1]]=[arr[i+1],arr[i]];
    return arr;
  }
  if(operation==='backward'){
    for(let i=1;i<length;i++)if(set.has(arr[i])&&!set.has(arr[i-1]))[arr[i],arr[i-1]]=[arr[i-1],arr[i]];
    return arr;
  }
  return arr;
}

export function reorderChildren(children=[], selectedIds=[], operation='forward') {
  const ids=new Set(selectedIds||[]),idx=(children||[]).map((c,i)=>ids.has(c.id)?i:-1).filter(i=>i>=0),order=reorderIndices(children.length,idx,operation);
  return order.map(i=>children[i]);
}

export function selectionSnapshot(items=[]) {
  return {items:clone(items||[]),bounds:rectBounds(items||[])};
}
