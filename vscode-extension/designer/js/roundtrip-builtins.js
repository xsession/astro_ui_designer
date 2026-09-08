import { registerRoundTripAdapter,getRoundTripAdapter } from './roundtrip-adapter-sdk.js';
import { listRoundTripBackends,detectRoundTripBackend,buildRoundTripPatchPlan,applyRoundTripPatch,getPreviewProfile } from './roundtrip-engine.js';
import { importFilesToNeutral,generateNeutralBackend } from './roundtrip-neutral-ir.js';

for(const backend of listRoundTripBackends()){
  if(getRoundTripAdapter(backend.id))continue;
  registerRoundTripAdapter({
    id:backend.id,label:backend.label,family:backend.family,extensions:backend.extensions,priority:backend.id==='astro'?100:50,
    capabilities:{supported:backend.supported,partial:backend.partial,unsupported:backend.unsupported},preview:getPreviewProfile(backend.id),metadata:{builtin:true,roundTripVersion:2},
    detect:files=>detectRoundTripBackend(files)===backend.id?1:0,
    inspect:async context=>context.inspectSource?context.inspectSource(context):importFilesToNeutral(context.files||[],{backend:backend.id,entryFile:context.entryFile}),
    importNeutral:context=>importFilesToNeutral(context.files||[],{backend:backend.id,entryFile:context.entryFile}),
    generate:context=>generateNeutralBackend(context.document||context.neutral,backend.id,context.options||{}),
    buildPatch:context=>buildRoundTripPatchPlan({...context,backend:backend.id}),
    applyPatch:context=>applyRoundTripPatch(context.plan,context.currentSource,context.options||{}),
    validate:context=>{const doc=context.document||context.neutral;return {ok:!(doc?.diagnostics||[]).length,diagnostics:doc?.diagnostics||[]}},
  });
}
