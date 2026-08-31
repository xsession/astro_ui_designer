const COLOR_ONLY_PROPERTIES = new Set([
  'color','backgroundColor','borderColor','borderTopColor','borderRightColor','borderBottomColor','borderLeftColor',
  'outlineColor','textDecorationColor','columnRuleColor','caretColor','accentColor','fill','stroke','stopColor','floodColor','lightingColor'
]);

const COMPOUND_COLOR_PROPERTIES = new Set([
  'background','backgroundImage','border','borderTop','borderRight','borderBottom','borderLeft','outline','boxShadow','textShadow'
]);

const COLOR_TOKEN_RE = /(?:#[0-9a-f]{3,8}\b|(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^)]*\)|var\(\s*--[^)]+\)|\b(?:transparent|currentcolor|black|white|red|green|blue|yellow|magenta|fuchsia|cyan|aqua|gray|grey|orange|purple|pink|brown|lime|navy|teal|olive|maroon|silver)\b)/i;

function clampByte(value){return Math.max(0,Math.min(255,Math.round(value)))}
function byteHex(value){return clampByte(value).toString(16).padStart(2,'0')}
function expandHex(hex){
  const s=String(hex||'').trim().toLowerCase();
  if(!/^#[0-9a-f]{3,8}$/.test(s))return null;
  if(s.length===4||s.length===5)return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  return s.slice(0,7);
}
function hueToRgb(p,q,t){if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p}
function hslToHex(h,s,l){
  h=((Number(h)%360)+360)%360/360;s=Math.max(0,Math.min(1,Number(s)));l=Math.max(0,Math.min(1,Number(l)));
  if(s===0){const v=byteHex(l*255);return `#${v}${v}${v}`}
  const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q;
  return `#${byteHex(hueToRgb(p,q,h+1/3)*255)}${byteHex(hueToRgb(p,q,h)*255)}${byteHex(hueToRgb(p,q,h-1/3)*255)}`;
}
function parseRgbPart(part){const s=String(part).trim();return s.endsWith('%')?255*parseFloat(s)/100:parseFloat(s)}
function parsePercent(part){const s=String(part).trim();return s.endsWith('%')?parseFloat(s)/100:parseFloat(s)}
function splitFunctionalBody(body){return body.replace(/\s*\/\s*[^,\s]+\s*$/,'').trim().split(/\s*,\s*|\s+/).filter(Boolean)}

export function isColorEditableProperty(property=''){
  const key=String(property||'').trim();
  return COLOR_ONLY_PROPERTIES.has(key)||COMPOUND_COLOR_PROPERTIES.has(key)||/Color$/.test(key);
}

export function containsColorCode(value=''){return COLOR_TOKEN_RE.test(String(value||''))}

export function resolveCssVariable(value='',tokens={},depth=0){
  const s=String(value||'').trim();if(depth>6)return s;
  const m=s.match(/^var\(\s*--([A-Za-z0-9_-]+)\s*(?:,\s*([^)]*))?\)$/);if(!m)return s;
  const next=tokens?.[m[1]]??m[2];return next==null?s:resolveCssVariable(next,tokens,depth+1);
}

export function colorPickerHex(value='',tokens={},fallback='#000000'){
  let s=resolveCssVariable(value,tokens).trim().toLowerCase();
  const hex=expandHex(s);if(hex)return hex;
  if(s==='transparent'||s==='currentcolor')return fallback;
  const named={black:'#000000',white:'#ffffff',red:'#ff0000',green:'#008000',blue:'#0000ff',yellow:'#ffff00',magenta:'#ff00ff',fuchsia:'#ff00ff',cyan:'#00ffff',aqua:'#00ffff',gray:'#808080',grey:'#808080',orange:'#ffa500',purple:'#800080',pink:'#ffc0cb',brown:'#a52a2a',lime:'#00ff00',navy:'#000080',teal:'#008080',olive:'#808000',maroon:'#800000',silver:'#c0c0c0'};
  if(named[s])return named[s];
  let m=s.match(/^rgba?\((.*)\)$/i);if(m){const parts=splitFunctionalBody(m[1]);if(parts.length>=3){const rgb=parts.slice(0,3).map(parseRgbPart);if(rgb.every(Number.isFinite))return `#${rgb.map(byteHex).join('')}`}}
  m=s.match(/^hsla?\((.*)\)$/i);if(m){const parts=splitFunctionalBody(m[1]);if(parts.length>=3){const h=parseFloat(parts[0]),sat=parsePercent(parts[1]),light=parsePercent(parts[2]);if([h,sat,light].every(Number.isFinite))return hslToHex(h,sat,light)}}
  const token=s.match(COLOR_TOKEN_RE)?.[0];if(token&&token!==s)return colorPickerHex(token,tokens,fallback);
  return fallback;
}

export function replaceColorInCssValue(value='',picked='#000000',property='color',tokens={}){
  const current=String(value??'').trim(),color=colorPickerHex(picked,{},'#000000');
  if(COLOR_ONLY_PROPERTIES.has(property)||(/Color$/.test(property)&&!COMPOUND_COLOR_PROPERTIES.has(property)))return color;
  if(!current)return color;
  const resolved=/^var\(/i.test(current)?resolveCssVariable(current,tokens):current;
  const working=resolved!==current?resolved:current;
  if(COLOR_TOKEN_RE.test(working))return working.replace(COLOR_TOKEN_RE,color);
  if(['background','backgroundImage'].includes(property))return color;
  if(['border','borderTop','borderRight','borderBottom','borderLeft','outline','boxShadow','textShadow'].includes(property))return `${working} ${color}`.trim();
  return color;
}

export function shouldOfferColorPicker(property='',value='',name=''){
  return isColorEditableProperty(property)||containsColorCode(value)||/(?:^|[-_\s])(color|colour|fill|stroke|tint|accent|background|foreground)(?:$|[-_\s])/i.test(String(name||''));
}
