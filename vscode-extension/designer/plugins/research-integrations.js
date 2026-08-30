import { registerDesignerPlugin } from '../js/plugin-api.js';
import { inferFreeformLayout } from '../js/research-features.js';

registerDesignerPlugin({
  id:'core.research-integrations',
  assistants:[{
    id:'responsive-layout-advisor',
    label:'Responsive layout advisor',
    description:'Analyzes freeform geometry and recommends Flex/Grid structure without using a remote AI service.',
    run:({selection,node})=>{
      const nodes=(selection?.length>=2?selection:(node?.children||[]));
      const guess=inferFreeformLayout(nodes);
      return {changed:false,message:`Layout advisor: ${guess.reason}${guess.kind&&guess.kind!=='none'?` → ${guess.kind}, gap ${guess.gap||0}px`:''}`};
    }
  }],
  importers:[{id:'dtcg-penpot',label:'DTCG / Penpot tokens',description:'Imports the vendor-neutral DTCG JSON token format used by Penpot and other design tools.'}],
  dataSources:[
    {id:'rest',label:'REST / JSON',description:'HTTP JSON data source with visual preview and bindings.'},
    {id:'graphql',label:'GraphQL',description:'GraphQL POST source with query preview.'},
    {id:'astro-content',label:'Astro Content Collections',description:'Schema-driven local content collections and repeaters.'},
    {id:'astro-live',label:'Astro Live Collections',description:'Live content source metadata and generated live loader stubs.'}
  ],
  sourceAdapters:[{id:'astro-ui-id',label:'Controlled Astro source sync',description:'Stable data-ui-id source mapping with Designer / Hybrid / Code-owned policies.'}],
  tokenAdapters:[{id:'dtcg',label:'DTCG 2025.10',description:'Import/export Design Tokens Community Group JSON.'}],
  testAdapters:[{id:'designer-browser',label:'Designer browser tests',description:'Recorded interaction tests plus Chromium/CDP visual regression harness.'}]
});
