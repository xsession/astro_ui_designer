const adapters=new Map();

function clone(value){return value==null?value:JSON.parse(JSON.stringify(value));}
function assertFn(value,name,required=false){if(required&&typeof value!=='function')throw new Error(`Round-trip adapter requires ${name}()`);if(value!=null&&typeof value!=='function')throw new Error(`Round-trip adapter ${name} must be a function`);}
function normalize(def){
  if(!def||typeof def!=='object')throw new Error('Round-trip adapter descriptor is required');
  const id=String(def.id||'').trim();if(!id)throw new Error('Round-trip adapter id is required');
  const label=String(def.label||id).trim();
  const adapter={
    version:Number(def.version||1),id,label,family:String(def.family||'custom'),extensions:[...(def.extensions||[])],priority:Number(def.priority||0),
    capabilities:clone(def.capabilities||{supported:[],partial:[],unsupported:[]}),
    preview:clone(def.preview||{}),metadata:clone(def.metadata||{}),
    detect:def.detect,inspect:def.inspect,importNeutral:def.importNeutral,generate:def.generate,buildPatch:def.buildPatch,applyPatch:def.applyPatch,validate:def.validate,
  };
  assertFn(adapter.detect,'detect');assertFn(adapter.inspect,'inspect');assertFn(adapter.importNeutral,'importNeutral');assertFn(adapter.generate,'generate');assertFn(adapter.buildPatch,'buildPatch');assertFn(adapter.applyPatch,'applyPatch');assertFn(adapter.validate,'validate');
  if(!adapter.importNeutral&&!adapter.generate&&!adapter.buildPatch)throw new Error(`Round-trip adapter ${id} must implement importNeutral(), generate(), or buildPatch()`);
  return adapter;
}

export function registerRoundTripAdapter(def,{replace=false}={}){
  const adapter=normalize(def);if(adapters.has(adapter.id)&&!replace)throw new Error(`Round-trip adapter already registered: ${adapter.id}`);adapters.set(adapter.id,adapter);return adapter;
}
export function unregisterRoundTripAdapter(id){return adapters.delete(String(id));}
export function clearRoundTripAdapters(){adapters.clear();}
export function getRoundTripAdapter(id){return adapters.get(String(id))||null;}
export function listRoundTripAdapters(){return [...adapters.values()].sort((a,b)=>b.priority-a.priority||a.label.localeCompare(b.label)).map(a=>({...a,capabilities:clone(a.capabilities),preview:clone(a.preview),metadata:clone(a.metadata)}));}
export function roundTripAdapterIds(){return [...adapters.keys()];}

export function scoreRoundTripAdapter(adapter,files=[]){
  if(!adapter)return -Infinity;
  if(typeof adapter.detect==='function'){
    const value=adapter.detect(files);if(typeof value==='number')return value;if(value===true)return 1;if(value===false)return 0;
  }
  const exts=new Set((files||[]).map(f=>String(f.filename||f.path||'').toLowerCase().match(/\.[a-z0-9]+$/)?.[0]).filter(Boolean));
  const hits=(adapter.extensions||[]).filter(x=>exts.has(String(x).toLowerCase())).length;
  return hits?Math.min(0.8,0.35+hits*.1):0;
}

export function resolveRoundTripAdapter(files=[],preferred=''){
  if(preferred){const exact=getRoundTripAdapter(preferred);if(exact)return exact;}
  let best=null,bestScore=0;
  for(const adapter of adapters.values()){
    const score=scoreRoundTripAdapter(adapter,files);if(score>bestScore||(score===bestScore&&best&&adapter.priority>best.priority)){best=adapter;bestScore=score;}
  }
  return best;
}

export async function inspectWithRoundTripAdapter(id,context={}){const a=getRoundTripAdapter(id);if(!a)throw new Error(`Unknown round-trip adapter: ${id}`);if(!a.inspect)return null;return a.inspect(context);}
export async function importWithRoundTripAdapter(id,context={}){const a=getRoundTripAdapter(id);if(!a?.importNeutral)throw new Error(`Adapter ${id} cannot import to neutral IR`);return a.importNeutral(context);}
export async function generateWithRoundTripAdapter(id,context={}){const a=getRoundTripAdapter(id);if(!a?.generate)throw new Error(`Adapter ${id} cannot generate source`);return a.generate(context);}
export async function buildPatchWithRoundTripAdapter(id,context={}){const a=getRoundTripAdapter(id);if(!a?.buildPatch)throw new Error(`Adapter ${id} cannot build source patches`);return a.buildPatch(context);}

export function roundTripAdapterManifest(){
  return listRoundTripAdapters().map(a=>({id:a.id,label:a.label,family:a.family,extensions:a.extensions,priority:a.priority,capabilities:a.capabilities,preview:a.preview,metadata:a.metadata,operations:{inspect:Boolean(a.inspect),import:Boolean(a.importNeutral),generate:Boolean(a.generate),patch:Boolean(a.buildPatch),apply:Boolean(a.applyPatch),validate:Boolean(a.validate)}}));
}

export const ROUNDTRIP_ADAPTER_SDK_VERSION=1;
