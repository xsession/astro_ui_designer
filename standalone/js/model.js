import { COMPONENTS, DEFAULT_BREAKPOINTS, DEFAULT_TOKENS } from './registry.js';

let idCounter = 1;
export function makeId(prefix = 'id') {
  const time = Date.now().toString(36).slice(-7);
  return `${prefix}-${time}-${(idCounter++).toString(36)}`;
}
export const deepClone = (value) => JSON.parse(JSON.stringify(value));

export function createNode(type, overrides = {}) {
  const spec = COMPONENTS[type];
  if (!spec) throw new Error(`Unknown component type: ${type}`);
  const style = deepClone(spec.defaultStyle || { base: {} });
  for (const [bp, values] of Object.entries(overrides.style || {})) style[bp] = { ...(style[bp] || {}), ...values };
  return {
    id: overrides.id || makeId(type), type, name: overrides.name || `${spec.label}${idCounter}`,
    props: { ...deepClone(spec.defaultProps || {}), ...(overrides.props || {}) },
    style, actions: deepClone(overrides.actions || []), bindings: deepClone(overrides.bindings || {}),
    meta: { domId: '', className: '', slot: '', role: '', ariaLabel: '', title: '', tabIndex: '', locked: false, hidden: false, sourceOwnership: 'designer', exposed: { content: true, style: false, structure: false, actions: false }, ...(overrides.meta || {}) },
    variant: overrides.variant || '', componentState: overrides.componentState || 'default', states: deepClone(overrides.states || []), containerRules: deepClone(overrides.containerRules || []), timeline: deepClone(overrides.timeline || { duration: 500, delay: 0, easing: 'ease', iterations: 1, direction: 'normal', fill: 'both', playbackRate: 1, reducedMotion: 'disable', engine: 'auto', trigger: 'manual', scroll: { timeline: 'view', source: 'nearest', axis: 'block', rangeStart: 'entry 0%', rangeEnd: 'cover 100%' }, tracks: [] }), visibilityCondition: overrides.visibilityCondition || '', dataContext: deepClone(overrides.dataContext || {}),
    children: (overrides.children || []).map(deepClone),
  };
}

export function createProject() {
  const homeRoot = createNode('page', { name: 'HomePage', props: { title: 'Home', description: 'Generated with Astro UI Designer Pro' } });
  return {
    schemaVersion: 4, id: makeId('project'), name: 'astro-ui-project',
    settings: {
      astroVersion: '^7.2.0', site: '', base: '/', output: 'static', language: 'en',
      breakpoints: deepClone(DEFAULT_BREAKPOINTS), gridSize: 8, dependencies: {}, integrations: [],
    },
    theme: { active: 'default', themes: { default: { label: 'Default', tokens: deepClone(DEFAULT_TOKENS) } } },
    pages: [{ id: makeId('page-doc'), route: '/', filename: 'index.astro', name: 'Home', seo: { title: 'Home', description: 'Generated with Astro UI Designer Pro', canonical: '', ogImage: '' }, root: homeRoot }],
    components: [], assets: [], variables: [
      { id: makeId('state'), name: 'menuOpen', type: 'boolean', initial: false },
      { id: makeId('state'), name: 'message', type: 'string', initial: 'Hello from state' },
    ],
    plugins: [],
    workspace: { rootPath: '', files: [], sourceMappings: [], externalComponents: [], preview: { url: '', running: false }, lastScan: '' },
    content: { collections: [], dataSources: [] },
    locales: { default: 'en', available: [{ id: 'en', label: 'EN' }], translations: {} },
    componentTests: [], recordedTests: [], editor: { permissionMode: 'designer', activeLocale: 'en', sourceOwnershipDefault: 'hybrid' }, tokenFormat: { type: 'dtcg', version: '2025.10' },
  };
}

export function createSampleProject() {
  const p = createProject();
  const root = p.pages[0].root;
  const header = createNode('header', { name: 'SiteHeader', style: { base: { padding: '14px 24px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' } } });
  const nav = createNode('nav', { name: 'MainNav', style: { base: { maxWidth: '1120px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: '12px' } } });
  const brand = createNode('heading', { name: 'Brand', props: { text: 'Astro UI Designer', level: '3' }, style: { base: { fontSize: '18px' } } });
  const links = createNode('row', { name: 'NavLinks', style: { base: { gap: '14px' }, mobile: { display: 'none' } } });
  links.children.push(createNode('link', { props: { text: 'Features', href: '#features' } }), createNode('link', { props: { text: 'Contact', href: '/contact' } }));
  nav.children.push(brand, links); header.children.push(nav);

  const hero = createNode('section', { name: 'Hero', style: { base: { background: 'linear-gradient(135deg,#eef5fb 0%,#fff 68%)' } } });
  const c = createNode('container'); const row = createNode('row', { style: { base: { gap: '36px', alignItems: 'center', flexWrap: 'nowrap' }, mobile: { flexDirection: 'column', alignItems: 'stretch' } } });
  const copy = createNode('column', { style: { base: { flex: '1 1 560px', gap: '18px' } } });
  copy.children.push(
    createNode('badge', { props: { text: 'Visual Astro IDE' } }),
    createNode('heading', { props: { text: 'Build responsive Astro interfaces visually.', level: '1' }, style: { base: { fontSize: '52px', maxWidth: '780px' }, tablet: { fontSize: '42px' }, mobile: { fontSize: '34px' } } }),
    createNode('text', { props: { text: 'Qt Creator-style workflow, web-native layout rules, reusable components, responsive states, actions, assets and clean Astro output.' }, style: { base: { maxWidth: '720px', color: '#4b5563', fontSize: '18px' } } }),
  );
  const buttons = createNode('row', { style: { base: { gap: '10px' }, mobile: { flexDirection: 'column' } } });
  buttons.children.push(createNode('button', { name: 'DocsButton', props: { text: 'Open docs' }, actions: [{ id: makeId('act'), event: 'click', type: 'navigate', value: '/docs', target: '', condition: '' }] }), createNode('link', { props: { text: 'See features', href: '#features' }, style: { base: { padding: '10px 12px' } } }));
  copy.children.push(buttons);
  const preview = createNode('card', { name: 'PreviewCard', style: { base: { flex: '1 1 360px', minHeight: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px', background: '#17202a', color: '#fff' } } });
  preview.children.push(createNode('heading', { props: { text: 'Source-first output', level: '3' }, style: { base: { fontSize: '22px' } } }), createNode('text', { props: { text: 'Generated pages, components, layouts, CSS, assets and client actions stay readable and editable.' }, style: { base: { color: '#cfd8e3' } } }));
  row.children.push(copy, preview); c.children.push(row); hero.children.push(c);

  const features = createNode('section', { name: 'Features', props: { ariaLabel: 'Features' } });
  const fc = createNode('container'); fc.children.push(createNode('heading', { props: { text: 'A full visual frontend IDE', level: '2' } }));
  const grid = createNode('grid', { name: 'FeatureGrid' });
  [['Responsive layout','Flex, Grid, breakpoints and freeform HMI layers.'],['Reusable components','Create project components with slots and instance overrides.'],['Behavior','State variables, bindings and web-native signal/action connections.']].forEach(([title, body]) => {
    const card = createNode('card'); card.children.push(createNode('heading', { props: { text: title, level: '3' }, style: { base: { fontSize: '20px' } } }), createNode('text', { props: { text: body } })); grid.children.push(card);
  });
  fc.children.push(createNode('spacer'), grid); features.children.push(fc);
  root.children.push(header, hero, features);

  const contact = createNode('page', { name: 'ContactPage', props: { title: 'Contact', description: 'Contact form' } });
  const sec = createNode('section'); const cc = createNode('container'); const form = createNode('form', { name: 'ContactForm' });
  form.children.push(createNode('heading', { props: { text: 'Contact', level: '1' } }), createNode('label', { props: { text: 'Email', htmlFor: 'email' } }), createNode('input', { props: { inputType: 'email', name: 'email', placeholder: 'you@example.com', required: true } }), createNode('label', { props: { text: 'Message', htmlFor: 'message' } }), createNode('textarea', { props: { name: 'message', placeholder: 'How can we help?', required: true } }), createNode('button', { props: { text: 'Send', buttonType: 'submit' } }));
  cc.children.push(form); sec.children.push(cc); contact.children.push(sec);
  p.pages.push({ id: makeId('page-doc'), route: '/contact', filename: 'contact.astro', name: 'Contact', seo: { title: 'Contact', description: 'Contact form', canonical: '', ogImage: '' }, root: contact });
  return p;
}

export function walk(node, fn, parent = null) { fn(node, parent); for (const child of node.children || []) walk(child, fn, node); }
export function findNode(root, id) { let found = null; walk(root, n => { if (n.id === id) found = n; }); return found; }
export function findParent(root, id) { let found = null; walk(root, (n,p) => { if (n.id === id) found = p; }); return found; }
export function canAcceptChildren(node) { return Boolean(COMPONENTS[node?.type]?.acceptsChildren); }
export function insertNode(root, parentId, node, index = null) {
  const parent = findNode(root, parentId); if (!parent) throw new Error('Parent not found'); if (!canAcceptChildren(parent)) throw new Error(`${parent.type} cannot contain children`);
  if (index == null || index < 0 || index > parent.children.length) parent.children.push(node); else parent.children.splice(index, 0, node);
}
export function removeNode(root, id) { const parent = findParent(root,id); if (!parent) return null; const i = parent.children.findIndex(c => c.id === id); return i >= 0 ? parent.children.splice(i,1)[0] : null; }
export function duplicateNode(root,id) { const source=findNode(root,id), parent=findParent(root,id); if(!source||!parent) return null; const clone=deepClone(source); walk(clone,n=>{n.id=makeId(n.type);n.name=`${n.name}Copy`; for(const a of n.actions||[]) a.id=makeId('act');}); const i=parent.children.findIndex(c=>c.id===id); parent.children.splice(i+1,0,clone); return clone; }
export function moveNode(root,id,newParentId,index=null) { const node=removeNode(root,id); if(!node) return false; try { insertNode(root,newParentId,node,index); return true; } catch(e) { const oldParent=findParent(root,id); if(oldParent) oldParent.children.push(node); throw e; } }
export function allNodes(root) { const out=[]; walk(root,n=>out.push(n)); return out; }
export function collectProjectNodes(project) { const out=[]; for(const p of project.pages) walk(p.root,n=>out.push({node:n, scope:'page', owner:p})); for(const c of project.components) walk(c.root,n=>out.push({node:n,scope:'component',owner:c})); return out; }
export function findProjectNode(project,id) { for(const p of project.pages){const n=findNode(p.root,id);if(n)return {node:n,root:p.root,owner:p,kind:'page'};} for(const c of project.components){const n=findNode(c.root,id);if(n)return {node:n,root:c.root,owner:c,kind:'component'};} return null; }
export function sanitizeFilename(name, ext = '.astro') { const s=String(name||'component').trim().replace(/[^A-Za-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'') || 'component'; return s.endsWith(ext)?s:`${s}${ext}`; }
export function routeToFilename(route) { let r=String(route||'/').trim(); if(r==='/'||r==='') return 'index.astro'; r=r.replace(/^\/+|\/+$/g,''); return `${r}/index.astro`; }

export function migrateProject(project) {
  const p=deepClone(project); p.schemaVersion ||= 1;
  if(p.schemaVersion<2){ p.settings ||= {}; p.settings.breakpoints ||= deepClone(DEFAULT_BREAKPOINTS); p.settings.dependencies ||= {}; p.settings.integrations ||= []; p.theme ||= {active:'default',themes:{default:{label:'Default',tokens:deepClone(DEFAULT_TOKENS)}}}; p.components ||= []; p.assets ||= []; p.variables ||= []; for(const pg of p.pages||[]) pg.seo ||= {title:pg.root?.props?.title||pg.name,description:pg.root?.props?.description||'',canonical:'',ogImage:''}; p.schemaVersion=2; }
  if(p.schemaVersion<3){ p.workspace ||= {rootPath:'',files:[],sourceMappings:[],externalComponents:[],preview:{url:'',running:false},lastScan:''}; p.content ||= {collections:[],dataSources:[]}; p.locales ||= {default:p.settings?.language||'en',available:[{id:p.settings?.language||'en',label:String(p.settings?.language||'en').toUpperCase()}],translations:{}}; p.componentTests ||= []; p.recordedTests ||= []; p.editor ||= {permissionMode:'designer',activeLocale:p.locales.default,sourceOwnershipDefault:'hybrid'}; p.tokenFormat ||= {type:'dtcg',version:'2025.10'}; p.schemaVersion=3; }
  if(p.schemaVersion<4){ p.schemaVersion=4; }
  for(const c of p.components||[]){ c.props ||= []; c.variants ||= []; c.stories ||= []; }
  for(const {node} of collectProjectNodes(p)){ if(node.type==='componentInstance'){node.props ||= {}; node.props.propValues ||= {};} node.bindings ||= {}; node.meta ||= {domId:'',className:'',slot:'',locked:false,hidden:false}; node.meta={domId:'',className:'',slot:'',locked:false,hidden:false,sourceOwnership:'designer',exposed:{content:true,style:false,structure:false,actions:false},...node.meta}; node.actions ||= []; node.children ||= []; node.style ||= {base:{}}; node.style.base ||= {}; node.variant ||= ''; node.componentState ||= 'default'; node.states ||= []; node.containerRules ||= []; node.timeline ||= { duration: 500, delay: 0, easing: 'ease', iterations: 1, direction: 'normal', fill: 'both', playbackRate: 1, reducedMotion: 'disable', engine: 'auto', trigger: 'manual', scroll: { timeline: 'view', source: 'nearest', axis: 'block', rangeStart: 'entry 0%', rangeEnd: 'cover 100%' }, tracks: [] }; node.timeline={...{ duration: 500, delay: 0, easing: 'ease', iterations: 1, direction: 'normal', fill: 'both', playbackRate: 1, reducedMotion: 'disable', engine: 'auto', trigger: 'manual', scroll: { timeline: 'view', source: 'nearest', axis: 'block', rangeStart: 'entry 0%', rangeEnd: 'cover 100%' }, tracks: [] },...node.timeline,scroll:{...{ duration: 500, delay: 0, easing: 'ease', iterations: 1, direction: 'normal', fill: 'both', playbackRate: 1, reducedMotion: 'disable', engine: 'auto', trigger: 'manual', scroll: { timeline: 'view', source: 'nearest', axis: 'block', rangeStart: 'entry 0%', rangeEnd: 'cover 100%' }, tracks: [] }.scroll,...(node.timeline.scroll||{})}}; node.visibilityCondition ||= ''; node.dataContext ||= {}; }
  return p;
}
