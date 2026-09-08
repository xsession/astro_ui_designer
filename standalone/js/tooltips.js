import { COMPONENTS } from './registry.js';

export const STATIC_CONTROL_TOOLTIPS = Object.freeze({
  'new-btn':'Create a new Astro UI Designer project.',
  'open-btn':'Open an Astro UI Designer project JSON file.',
  'save-btn':'Save the current designer project as JSON. Shortcut: Ctrl/Cmd+S.',
  'undo-btn':'Undo the last project edit. Shortcut: Ctrl/Cmd+Z.',
  'redo-btn':'Redo the last undone project edit.',
  'cut-btn':'Cut the selected node to the designer clipboard.',
  'copy-btn':'Copy the selected node to the designer clipboard.',
  'paste-btn':'Paste the copied node into the selected container.',
  'duplicate-btn':'Duplicate the selected node.',
  'delete-btn':'Delete the selected node. Shortcut: Delete.',
  'wrap-row-btn':'Wrap the current selection in a horizontal Row container.',
  'wrap-col-btn':'Wrap the current selection in a vertical Column container.',
  'move-up-btn':'Move the selected node earlier in its parent stacking/order.',
  'move-down-btn':'Move the selected node later in its parent stacking/order.',
  'align-left-btn':'Align selected freeform objects to the left edge.',
  'align-hcenter-btn':'Align selected freeform objects to the horizontal center.',
  'align-right-btn':'Align selected freeform objects to the right edge.',
  'align-top-btn':'Align selected freeform objects to the top edge.',
  'align-vcenter-btn':'Align selected freeform objects to the vertical center.',
  'align-bottom-btn':'Align selected freeform objects to the bottom edge.',
  'dist-h-btn':'Distribute selected freeform objects evenly horizontally.',
  'dist-v-btn':'Distribute selected freeform objects evenly vertically.',
  'breakpoint-select':'Choose the responsive breakpoint used by the canvas and inspector.',
  'breakpoints-btn':'Open responsive breakpoint configuration.',
  'design-mode-btn':'Design mode: edit the visual canvas.',
  'split-mode-btn':'Split mode: show the visual canvas and source editor together.',
  'code-mode-btn':'Code mode: focus on generated or workspace source.',
  'preview-mode-btn':'Preview mode: interact with the design without editor selection chrome.',
  'component-lab-mode-btn':'Open Component Lab for stories, controls and component tests.',
  'zoom-out-btn':'Zoom the visual canvas out.',
  'fit-btn':'Fit the current artboard to the available canvas area.',
  'zoom-in-btn':'Zoom the visual canvas in.',
  'workspace-btn':'Open or switch the local Astro workspace used for source-aware editing.',
  'live-preview-btn':'Start or stop the real Astro development preview.',
  'dock-layout-btn':'Manage relocatable docks. Drag any dock tab to move, reorder or float it.',
  'roundtrip-btn':'Open Round-trip Studio for reviewed design ↔ source synchronization.',
  'command-btn':'Open the command palette.',
  'export-btn':'Export the current project as a generated Astro project ZIP.',
  'bottom-toggle-btn':'Expand or collapse the bottom dock.',
  'source-file-select':'Choose the workspace source file shown in the source editor.',
  'source-reload-btn':'Reload the selected source file from the workspace.',
  'source-sync-btn':'Apply safe changes from the selected visual node to its mapped source.',
  'source-apply-btn':'Save the edited source text back to the workspace.',
  'live-open-external':'Open the running Astro preview in an external browser tab.',
  'lab-component-select':'Choose the reusable component shown in Component Lab.',
  'lab-new-story':'Create a new story for the selected reusable component.',
  'lab-run-tests':'Run the configured Component Lab tests for the active story.'
});

export const MENU_TOOLTIPS = Object.freeze({
  file:'Open file/project commands: new, open, save, workspace and export.',
  edit:'Open editing commands such as undo, redo, copy, paste and delete.',
  form:'Open page, form and reusable-component creation commands.',
  layout:'Open layout, alignment, ordering and responsive-layout commands.',
  view:'Open canvas, preview, zoom and dock visibility commands.',
  project:'Open project settings, themes, breakpoints and review workbenches.',
  build:'Open validation, testing, preview and export commands.',
  help:'Open documentation and information about Astro UI Designer.'
});

export const DOCK_PANEL_TOOLTIPS = Object.freeze({
  palette:'Component Palette — browse and insert layout, content, form and advanced UI components.',
  project:'Project — browse pages/routes and reusable components.',
  components:'Components — create, browse and insert reusable project components.',
  assets:'Assets — manage images and other project assets.',
  sources:'Sources — browse files and source-aware workspace snapshots.',
  properties:'Properties — edit the selected node content, identity and component props.',
  layout:'Layout — edit responsive CSS layout, sizing, spacing and alignment.',
  actions:'Actions — configure interactions and event-driven actions.',
  bindings:'Bindings — connect node properties to state, props, data or context.',
  code:'Code — inspect generated source for the selected document.',
  variants:'States — edit component variants and node states.',
  data:'Data — configure ownership, visibility and data-source bindings.',
  effects:'Effects — edit fills, strokes, shadows, blur, blend mode and constraints.',
  composition:'Composition — manage code-component contracts, mixins, variants and contexts.',
  story:'Story — inspect and configure the active component story.',
  problems:'Problems — validation diagnostics for the current project.',
  objects:'Object Tree — hierarchical view of every node in the current document.',
  manual:'Layout Tools — precision geometry, guides, snapping and manual positioning.',
  css:'CSS Tools — advanced CSS states, variables, gradients, transforms and transitions.',
  state:'State — project-level preview state variables.',
  animation:'Animation — keyframe and motion editor with CSS/WAAPI output.',
  tokens:'Design Tokens — edit theme tokens and reusable design values.',
  libraries:'Libraries — publish, import and apply shared design libraries.',
  content:'Content — manage Astro content collections and data sources.',
  locales:'Locales — edit project locales and translated node content.',
  tests:'Tests — recorded interaction tests and component test tools.',
  storybook:'Story Results — view Component Lab test results and visual baselines.',
  queries:'Queries — app-local data queries and generated query modules.',
  templates:'Templates — reusable page/section templates.',
  usages:'Usages — find references to components, assets, tokens, queries and contexts.',
  audit:'Audit — accessibility, responsive, SEO and performance checks.',
  git:'Git — inspect and manage workspace source-control changes.',
  prototype:'Prototype — flows, overlays, navigation and prototype interactions.',
  comments:'Comments — design review comments and replies.',
  inspect:'Inspect — developer handoff information, CSS and geometry.',
  interchange:'Interchange — import/export Draw.io, Penpot, Figma-style JSON, HTML, SVG and framework formats.',
  integrations:'Integrations — run installed plugin providers and adapters.',
  roundtrip:'Round-trip — source graph, reviewed patching, conversion, history and conflict tools.',
  hotkeys:'Hotkeys — view, customize, clear and reset keyboard shortcuts with conflict detection.',
  console:'Console — Astro UI Designer runtime log output.'
});

const CLASS_TOOLTIPS = Object.freeze({
  'dock-splitter':'Drag to resize this dock. Double-click to restore its default size.',
  'floating-dock-titlebar':'Drag this floating tool window to move it. Double-click the title bar to return it to its original dock.',
  'relocatable-section':'Drag the section heading to reorder this section inside its tool panel.',
  'doc-tab':'Open this document. Drag the tab to reorder documents.'
});

const clean = value => String(value ?? '').replace(/\s+/g,' ').trim();
const humanize = value => clean(value).replace(/[-_:]+/g,' ').replace(/\b\w/g,m=>m.toUpperCase());
const datasetValue = (dataset,key) => dataset?.[key] ?? dataset?.[key.replace(/[A-Z]/g,m=>`-${m.toLowerCase()}`)];

function dockIdFromDescriptor(desc){
  const ds=desc.dataset||{};
  const direct=datasetValue(ds,'leftTab')||datasetValue(ds,'rightTab')||datasetValue(ds,'bottomTab');
  if(direct)return String(direct);
  const key=datasetValue(ds,'dockPanel');
  if(key)return String(key).split(':').pop();
  return '';
}

export function tooltipForDescriptor(desc={}){
  const explicit=clean(desc.tooltip||datasetValue(desc.dataset,'tooltip'));
  if(explicit)return explicit;
  if(desc.id&&STATIC_CONTROL_TOOLTIPS[desc.id])return STATIC_CONTROL_TOOLTIPS[desc.id];
  const native=clean(desc.title);
  if(native)return native;
  const menu=datasetValue(desc.dataset,'menu');
  if(menu&&MENU_TOOLTIPS[menu])return MENU_TOOLTIPS[menu];
  const dockId=dockIdFromDescriptor(desc);
  if(dockId){const base=DOCK_PANEL_TOOLTIPS[dockId]||`${humanize(dockId)} tool panel.`;return `${base} Drag this tab to move, reorder or float the panel.`}
  const addType=datasetValue(desc.dataset,'add');
  if(addType){const spec=COMPONENTS[addType];return spec?`Insert ${spec.label} (${spec.category || 'UI'}) into the selected container.`:`Insert ${humanize(addType)} into the selected container.`}
  const floatDock=datasetValue(desc.dataset,'floatDock');
  if(floatDock)return `Dock this floating tool panel to the ${floatDock} side.`;
  if(datasetValue(desc.dataset,'floatHome')!==undefined)return 'Return this floating tool panel to its original dock.';
  const dockMove=datasetValue(desc.dataset,'dockMove');
  if(dockMove)return `Move this tool panel to the ${dockMove} dock.`;
  if(datasetValue(desc.dataset,'dockFloat')!==undefined)return 'Float this tool panel as a movable, resizable window.';
  if(datasetValue(desc.dataset,'dockReset')!==undefined)return 'Reset every dock, tab order, floating window and section order to defaults.';
  const style=datasetValue(desc.dataset,'style');
  if(style){const [property,value]=String(style).split(':');return `Set ${humanize(property)} to ${value || 'the selected value'}.`}
  const textAlign=datasetValue(desc.dataset,'textAlign');
  if(textAlign)return `Set text alignment to ${humanize(textAlign)}.`;
  const contentAlign=datasetValue(desc.dataset,'contentAlign');
  if(contentAlign){const [axis,value]=String(contentAlign).split(':');return `Align container content ${axis?.toUpperCase() || ''} to ${humanize(value)}.`}
  const role=clean(desc.role);
  const text=clean(desc.text);
  const aria=clean(desc.ariaLabel);
  const label=clean(desc.label);
  const placeholder=clean(desc.placeholder);
  if(aria&&aria!==text)return aria;
  if(label)return `${label}.`;
  if(placeholder)return `${placeholder}.`;
  const classes=new Set(String(desc.className||'').split(/\s+/).filter(Boolean));
  for(const [cls,tip] of Object.entries(CLASS_TOOLTIPS))if(classes.has(cls))return tip;
  if(role==='tab'&&text)return `${text} panel. Click to activate; drag to relocate when docking is enabled.`;
  if(text){
    if(desc.tagName==='BUTTON')return `${text}.`;
    if(desc.tagName==='SELECT')return `Choose ${text}.`;
    return text;
  }
  if(desc.id)return humanize(desc.id);
  return '';
}

function descriptorForElement(el){
  const labelledBy=el.getAttribute?.('aria-labelledby');
  const labelledText=labelledBy?labelledBy.split(/\s+/).map(id=>el.ownerDocument?.getElementById(id)?.textContent||'').join(' '):'';
  const wrappingLabel=el.closest?.('label');
  const rowLabel=el.closest?.('.property-row,.css-mini-field')?.querySelector?.(':scope > label, :scope > span');
  const directLabel=el.id?el.ownerDocument?.querySelector?.(`label[for="${CSS.escape(el.id)}"]`):null;
  return {
    id:el.id||'',
    title:el.getAttribute?.('title')||'',
    tooltip:el.getAttribute?.('data-tooltip')||'',
    ariaLabel:el.getAttribute?.('aria-label')||labelledText||'',
    label:directLabel?.textContent||rowLabel?.textContent||wrappingLabel?.textContent||'',
    placeholder:el.getAttribute?.('placeholder')||'',
    role:el.getAttribute?.('role')||'',
    text:el.textContent||'',
    className:el.className||'',
    tagName:el.tagName||'',
    dataset:el.dataset||{}
  };
}

export function tooltipTextForElement(el){return tooltipForDescriptor(descriptorForElement(el));}

export const TOOLTIP_TARGET_SELECTOR = [
  '[data-tooltip]',
  'button',
  'select',
  'input:not([type="file"]):not([type="hidden"])',
  'textarea',
  '.dock-splitter',
  '.doc-tab',
  '.relocatable-section>summary',
  '.relocatable-section>.group-head',
  '.floating-dock-titlebar',
  '[role="tab"]',
  '[role="button"]'
].join(',');

function nearestTooltipTarget(node){
  if(!(node instanceof Element))return null;
  return node.closest(TOOLTIP_TARGET_SELECTOR);
}

export function annotateTooltips(root=document){
  const scope=root?.querySelectorAll?root:document;
  const nodes=[];
  if(root instanceof Element&&root.matches(TOOLTIP_TARGET_SELECTOR))nodes.push(root);
  nodes.push(...scope.querySelectorAll(TOOLTIP_TARGET_SELECTOR));
  let count=0;
  for(const el of nodes){
    const text=tooltipTextForElement(el);
    if(!text)continue;
    el.dataset.designerTooltip=text;
    el.setAttribute('aria-description',text);
    if(el.matches('button:disabled,[aria-disabled="true"]')&&!el.getAttribute('title'))el.setAttribute('title',text);
    count++;
  }
  return count;
}

export function installTooltipSystem({root=document,delay=420,hideDelay=70}={}){
  if(typeof document==='undefined')return {refresh:()=>0,destroy:()=>{}};
  const doc=root?.ownerDocument||document;
  let tooltip=doc.getElementById('designer-tooltip');
  if(!tooltip){tooltip=doc.createElement('div');tooltip.id='designer-tooltip';tooltip.className='designer-tooltip';tooltip.setAttribute('role','tooltip');tooltip.hidden=true;doc.body.appendChild(tooltip)}
  let active=null,showTimer=0,hideTimer=0;
  const clearTimers=()=>{clearTimeout(showTimer);clearTimeout(hideTimer)};
  const hide=()=>{clearTimers();active=null;tooltip.classList.remove('visible');tooltip.hidden=true};
  const place=el=>{
    const r=el.getBoundingClientRect();
    tooltip.hidden=false;tooltip.style.left='0px';tooltip.style.top='0px';
    const tr=tooltip.getBoundingClientRect(),pad=8,gap=8;
    let left=r.left+(r.width-tr.width)/2,top=r.bottom+gap;
    if(top+tr.height>innerHeight-pad)top=r.top-tr.height-gap;
    left=Math.max(pad,Math.min(innerWidth-tr.width-pad,left));
    top=Math.max(pad,Math.min(innerHeight-tr.height-pad,top));
    tooltip.style.left=`${Math.round(left)}px`;tooltip.style.top=`${Math.round(top)}px`;
  };
  const show=el=>{
    const text=el?.dataset?.designerTooltip||tooltipTextForElement(el);
    if(!text)return hide();
    clearTimeout(hideTimer);active=el;tooltip.textContent=text;tooltip.hidden=false;tooltip.classList.remove('visible');place(el);
    requestAnimationFrame(()=>{if(active===el&&!tooltip.hidden)tooltip.classList.add('visible')});
  };
  const scheduleShow=(el,immediate=false)=>{
    clearTimers();
    if(active===el&&tooltip.classList.contains('visible'))return;
    const text=el?.dataset?.designerTooltip||tooltipTextForElement(el);if(!text)return;
    showTimer=setTimeout(()=>show(el),immediate?0:delay);
  };
  const scheduleHide=()=>{clearTimeout(showTimer);clearTimeout(hideTimer);hideTimer=setTimeout(hide,hideDelay)};
  const over=e=>{const el=nearestTooltipTarget(e.target);if(!el)return;const from=nearestTooltipTarget(e.relatedTarget);if(from===el)return;scheduleShow(el,false)};
  const out=e=>{const el=nearestTooltipTarget(e.target);if(!el)return;const to=nearestTooltipTarget(e.relatedTarget);if(to===el)return;scheduleHide()};
  const focus=e=>{const el=nearestTooltipTarget(e.target);if(el)scheduleShow(el,true)};
  const blur=e=>{if(nearestTooltipTarget(e.target))scheduleHide()};
  const key=e=>{if(e.key==='Escape')hide()};
  const reposition=()=>{if(active&&!tooltip.hidden&&active.isConnected)place(active);else if(active)hide()};
  doc.addEventListener('pointerover',over,true);doc.addEventListener('pointerout',out,true);doc.addEventListener('focusin',focus,true);doc.addEventListener('focusout',blur,true);doc.addEventListener('keydown',key,true);window.addEventListener('resize',reposition);doc.addEventListener('scroll',reposition,true);
  annotateTooltips(root);
  const observer=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node instanceof Element)annotateTooltips(node)});
  observer.observe(root===document?document.body:root,{childList:true,subtree:true});
  return {
    refresh:()=>annotateTooltips(root),
    destroy:()=>{hide();observer.disconnect();doc.removeEventListener('pointerover',over,true);doc.removeEventListener('pointerout',out,true);doc.removeEventListener('focusin',focus,true);doc.removeEventListener('focusout',blur,true);doc.removeEventListener('keydown',key,true);window.removeEventListener('resize',reposition);doc.removeEventListener('scroll',reposition,true);tooltip.remove();}
  };
}
