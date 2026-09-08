const MOD_ORDER=['Ctrl','Alt','Shift','Meta'];
const MOD_ALIASES={control:'Ctrl',ctrl:'Ctrl',alt:'Alt',option:'Alt',shift:'Shift',meta:'Meta',cmd:'Meta',command:'Meta',super:'Meta',win:'Meta'};
const KEY_ALIASES={' ':'Space',esc:'Escape',del:'Delete',return:'Enter','+':'Plus','-':'Minus','=':'Equal',arrowup:'ArrowUp',arrowdown:'ArrowDown',arrowleft:'ArrowLeft',arrowright:'ArrowRight'};
export function normalizeHotkey(binding=''){
  const raw=String(binding||'').trim();if(!raw)return '';
  const parts=raw.replace(/\s+/g,'').split('+').filter(Boolean);const mods=new Set();let key='';
  for(const p of parts){const low=p.toLowerCase();if(MOD_ALIASES[low])mods.add(MOD_ALIASES[low]);else key=KEY_ALIASES[low]||(/^[a-z]$/i.test(p)?p.toUpperCase():p.length===1?p.toUpperCase():p[0].toUpperCase()+p.slice(1));}
  if(!key&&raw==='+')key='Plus';if(!key)return [...MOD_ORDER].filter(m=>mods.has(m)).join('+');
  return [...MOD_ORDER].filter(m=>mods.has(m)).concat(key).join('+');
}
export function eventToHotkey(event){
  const mods=[];if(event.ctrlKey)mods.push('Ctrl');if(event.altKey)mods.push('Alt');if(event.shiftKey)mods.push('Shift');if(event.metaKey)mods.push('Meta');
  let key=event.key||'';if(['Control','Alt','Shift','Meta'].includes(key))return mods.join('+');
  if(key===' ')key='Space';else if(key==='+')key='Plus';else if(key==='-')key='Minus';else if(key==='=')key='Equal';else if(key.length===1)key=key.toUpperCase();
  return normalizeHotkey([...mods,key].join('+'));
}
export function effectiveHotkeys(commands=[],overrides={}){
  const out={};for(const command of commands){const override=Object.prototype.hasOwnProperty.call(overrides||{},command.id)?overrides[command.id]:undefined;const values=override===undefined?(command.defaultBindings||[]):Array.isArray(override)?override:[override];out[command.id]=[...new Set(values.map(normalizeHotkey).filter(Boolean))];}return out;
}
export function findHotkeyConflicts(map={}){
  const owners=new Map(),conflicts=[];for(const [id,bindings] of Object.entries(map))for(const b of bindings||[]){if(!owners.has(b))owners.set(b,[]);owners.get(b).push(id)}for(const [binding,ids] of owners)if(ids.length>1)conflicts.push({binding,commandIds:ids});return conflicts;
}
export function commandForEvent(event,commands=[],overrides={}){
  const binding=eventToHotkey(event);if(!binding)return null;const map=effectiveHotkeys(commands,overrides);for(const command of commands)if((map[command.id]||[]).includes(binding))return {command,binding};return null;
}
export function isEditableTarget(target){const tag=String(target?.tagName||'').toUpperCase();return Boolean(target?.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(tag));}
export function shouldHandleHotkey(event,command){if(!command)return false;if(command.allowInEditable)return true;return !isEditableTarget(event.target);}
export function setHotkeyOverride(overrides,commandId,bindings){const next={...(overrides||{})};next[commandId]=(Array.isArray(bindings)?bindings:[bindings]).map(normalizeHotkey).filter(Boolean);return next;}
export function clearHotkeyOverride(overrides,commandId){const next={...(overrides||{})};delete next[commandId];return next;}
export function hotkeyLabel(binding,navigatorPlatform=''){const b=normalizeHotkey(binding);if(!/mac/i.test(navigatorPlatform))return b;return b.replace(/Meta/g,'⌘').replace(/Ctrl/g,'⌃').replace(/Alt/g,'⌥').replace(/Shift/g,'⇧').replace(/\+/g,'');}
