/**
 * Lightweight Qt Quick/QML interchange support.
 *
 * This parser is intentionally structural rather than a full QML/JS parser. It
 * understands QML object declarations, direct property bindings, ids and common
 * Qt Quick Controls/Layout primitives while preserving unknown expressions as
 * opaque values. It is safe for project import/export and anchored literal
 * patches; arbitrary JavaScript handler bodies are never rewritten.
 */

const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const esc=v=>JSON.stringify(String(v??''));
const pxNumber=v=>{const m=String(v??'').trim().match(/^-?\d+(?:\.\d+)?/);return m?Number(m[0]):null};
const qmlIdSafe=v=>{let s=String(v||'item').replace(/[^A-Za-z0-9_]/g,'_');if(!/^[a-z_]/.test(s))s=`item_${s}`;return s||'item'};

function maskQml(source=''){
  const s=String(source),out=s.split('');let mode='code',quote='';
  for(let i=0;i<s.length;i++){
    const ch=s[i],next=s[i+1];
    if(mode==='line'){if(ch==='\n')mode='code';else out[i]=' ';continue}
    if(mode==='block'){out[i]=' ';if(ch==='*'&&next==='/'){out[i+1]=' ';i++;mode='code'}continue}
    if(mode==='string'){if(ch==='\\'){out[i]=' ';if(i+1<s.length){out[i+1]=' ';i++}continue}if(ch===quote){out[i]=' ';mode='code';quote='';continue}if(ch!=='\n')out[i]=' ';continue}
    if(ch==='/'&&next==='/'){out[i]=out[i+1]=' ';i++;mode='line';continue}
    if(ch==='/'&&next==='*'){out[i]=out[i+1]=' ';i++;mode='block';continue}
    if(ch==='"'||ch==="'"){quote=ch;out[i]=' ';mode='string';continue}
  }
  return out.join('');
}
function matchingBrace(masked,open){let depth=0;for(let i=open;i<masked.length;i++){if(masked[i]==='{')depth++;else if(masked[i]==='}'){depth--;if(depth===0)return i}}return -1}
function lineColumn(source,pos){const before=String(source).slice(0,pos),lines=before.split('\n');return {line:lines.length,column:(lines.at(-1)||'').length+1}}
function literal(raw=''){
  const s=String(raw).trim().replace(/;\s*$/,'');
  let m;if((m=s.match(/^(?:qsTr|qsTranslate)\(\s*(["'])([\s\S]*?)\1(?:\s*,[\s\S]*)?\)$/)))return m[2].replace(/\\([\\"'])/g,'$1');
  if((m=s.match(/^(["'])([\s\S]*)\1$/)))return m[2].replace(/\\([\\"'])/g,'$1');
  if(/^-?\d+(?:\.\d+)?$/.test(s))return Number(s);if(s==='true')return true;if(s==='false')return false;if(s==='null')return null;return {expression:s};
}
function qmlTypeToNeutral(type=''){
  const t=String(type).split('.').pop();
  if(['Row','RowLayout'].includes(t))return 'container';if(['Column','ColumnLayout'].includes(t))return 'container';if(['Grid','GridLayout','Flow'].includes(t))return 'container';
  if(['Text','Label'].includes(t))return 'text';if(['Button','ToolButton','RoundButton','DelayButton'].includes(t))return 'button';
  if(['TextField','TextInput','TextArea','ComboBox','SpinBox','Slider','Dial'].includes(t))return 'input';if(t==='Image')return 'image';if(t==='CheckBox'||t==='Switch')return 'checkbox';if(t==='RadioButton')return 'radio';
  if(['Repeater','ListView','GridView','TableView'].includes(t))return 'repeater';return 'container';
}
function qmlStyle(type,props){
  const style={},n=(name,out=name,overwrite=true)=>{const v=props[name];if(v==null||typeof v==='object'||(!overwrite&&style[out]!=null))return;const num=Number(v);style[out]=Number.isFinite(num)?`${num}px`:String(v)},expr=name=>props[name]&&typeof props[name]==='object'?String(props[name].expression||'').trim():'';
  n('x','left');n('y','top');n('width');n('height');n('implicitWidth','minWidth');n('implicitHeight','minHeight');n('spacing','gap');n('radius','borderRadius');
  n('Layout.preferredWidth','width',false);n('Layout.preferredHeight','height',false);if(props['Layout.fillWidth']===true&&!style.width)style.width='100%';if(props['Layout.fillHeight']===true&&!style.height)style.height='100%';if(expr('anchors.fill')==='parent'){if(!style.width)style.width='100%';if(!style.height)style.height='100%'}
  n('anchors.margins','margin');n('anchors.leftMargin','marginLeft');n('anchors.rightMargin','marginRight');n('anchors.topMargin','marginTop');n('anchors.bottomMargin','marginBottom');
  if(typeof props.opacity==='number')style.opacity=String(props.opacity);if(typeof props.z==='number')style.zIndex=String(props.z);if(typeof props.rotation==='number')style.transform=`rotate(${props.rotation}deg)`;
  if(typeof props.color==='string'){if(['Text','Label'].includes(String(type).split('.').pop()))style.color=props.color;else style.backgroundColor=props.color}
  if(typeof props['border.color']==='string'){style.borderColor=props['border.color'];style.borderStyle='solid'}if(typeof props['border.width']==='number'){style.borderWidth=`${props['border.width']}px`;style.borderStyle=style.borderStyle||'solid'}
  if(typeof props['font.pixelSize']==='number')style.fontSize=`${props['font.pixelSize']}px`;if(props['font.bold']===true)style.fontWeight='700';
  const h=expr('horizontalAlignment');if(/AlignHCenter$/.test(h))style.textAlign='center';else if(/AlignRight$/.test(h))style.textAlign='right';else if(/AlignLeft$/.test(h))style.textAlign='left';
  return style;
}
function directPropertyRows(source,object,allObjects){
  const childRanges=allObjects.filter(x=>x!==object&&x.start>object.openBrace&&x.end<object.end).map(x=>[x.start,x.end]),masked=maskQml(source);
  const inChild=pos=>childRanges.some(([a,b])=>pos>=a&&pos<=b),extendBalanced=(valueStart,lineEnd)=>{const stack=[],pairs={'}':'{',']':'[',')':'('},opens=new Set(['{','[','(']);let saw=false;for(let i=valueStart;i<lineEnd;i++){const ch=masked[i];if(opens.has(ch)){stack.push(ch);saw=true}else if(pairs[ch]&&stack.at(-1)===pairs[ch])stack.pop()}if(!saw||!stack.length)return lineEnd;for(let i=lineEnd;i<object.closeBrace;i++){const ch=masked[i];if(opens.has(ch))stack.push(ch);else if(pairs[ch]&&stack.at(-1)===pairs[ch]){stack.pop();if(!stack.length)return i+1}}return lineEnd};const rows=[];let pos=object.openBrace+1;
  while(pos<object.closeBrace){let lineEnd=source.indexOf('\n',pos);if(lineEnd<0||lineEnd>object.closeBrace)lineEnd=object.closeBrace;const line=source.slice(pos,lineEnd);let next=lineEnd+1;if(!inChild(pos)){const m=line.match(/^\s*([A-Za-z_][\w.]*)\s*:\s*(.*?)\s*;?\s*$/);if(m){const name=m[1],lineRaw=m[2],valueStart=pos+line.indexOf(lineRaw),valueEnd=extendBalanced(valueStart,lineEnd),raw=source.slice(valueStart,valueEnd).trimEnd().replace(/;\s*$/,'');rows.push({name,raw,value:literal(raw),start:pos,end:valueEnd,valueStart,valueEnd});if(valueEnd>lineEnd){const after=source.indexOf('\n',valueEnd);next=after<0||after>object.closeBrace?object.closeBrace:after+1}}}pos=next;
  }
  return rows;
}
export function inspectQmlSource(source,{filename='Main.qml'}={}){
  const text=String(source),masked=maskQml(text),diagnostics=[],objects=[],re=/\b([A-Z][A-Za-z0-9_.]*)\s*\{/g;let m;
  while((m=re.exec(masked))){const type=m[1],open=masked.indexOf('{',m.index+type.length),close=matchingBrace(masked,open);if(close<0){diagnostics.push(`Unclosed QML object ${type}.`);continue}objects.push({type,start:m.index,openBrace:open,closeBrace:close,end:close+1});}
  objects.sort((a,b)=>a.start-b.start||b.end-a.end);for(const o of objects){const parent=[...objects].reverse().find(p=>p!==o&&p.start<o.start&&p.end>o.end);o.parent=parent||null;o.properties=directPropertyRows(text,o,objects);o.propertyMap=Object.fromEntries(o.properties.map(p=>[p.name,p.value]));const id=o.propertyMap.id&&typeof o.propertyMap.id==='object'?String(o.propertyMap.id.expression||''):String(o.propertyMap.id||'');o.qmlId=id&&/^[A-Za-z_]\w*$/.test(id)?id:'';}
  const roots=objects.filter(o=>!o.parent),pathFor=o=>{const chain=[];let cur=o;while(cur){const siblings=objects.filter(x=>x.parent===cur.parent&&x.type===cur.type),idx=Math.max(0,siblings.indexOf(cur));chain.unshift(cur.qmlId||`${cur.type}[${idx}]`);cur=cur.parent}return chain.join('/')};
  const nodes=objects.map(o=>{const p=o.propertyMap,lc=lineColumn(text,o.start),symbolPath=o.qmlId||pathFor(o),attrs={qmlType:o.type,qmlId:o.qmlId||'',visible:p.visible,checked:p.checked,source:p.source,placeholderText:p.placeholderText,title:p.title};const textValue=typeof p.text==='string'?p.text:typeof p.title==='string'&&/Window$/.test(o.type)?p.title:null;return {kind:'qml-object',tag:o.type,attributes:attrs,text:textValue,style:qmlStyle(o.type,p),start:o.start,end:o.end,line:lc.line,column:lc.column,dataUiId:null,selectorPath:null,symbolPath,parser:'qml-structural',confidence:o.qmlId?1:.92,properties:o.properties.map(x=>({name:x.name,value:clone(x.value),raw:x.raw,start:x.start,end:x.end,valueStart:x.valueStart,valueEnd:x.valueEnd}))}});
  return {parser:'qml-structural',nodes,styleRules:[],diagnostics,astValidated:diagnostics.length===0&&objects.length>0,confidence:objects.length?(diagnostics.length?0.75:0.96):0.2,metadata:{filename,imports:[...text.matchAll(/^\s*import\s+([^\s;]+)/gm)].map(x=>x[1]),roots:roots.length}};
}
function objectToNeutral(node,byRange,filename){
  const props=Object.fromEntries((node.properties||[]).map(p=>[p.name,p.value])),type=qmlTypeToNeutral(node.tag),attrs={qmlType:node.tag,qmlId:node.attributes?.qmlId||'',visible:props.visible,checked:props.checked,placeholderText:props.placeholderText,title:props.title};if(typeof props.source==='string')attrs.src=props.source;if(typeof props.text==='string')attrs.text=props.text;
  const events={};for(const p of node.properties||[])if(/^on[A-Z]/.test(p.name))events[p.name]={expression:p.raw};
  const out={id:`qml-${Math.abs(node.start||0).toString(36)}`,type,tag:`qml.${node.tag}`,name:node.attributes?.qmlId||node.text||String(node.tag).split('.').pop(),text:node.text||'',attrs,style:qmlStyle(node.tag,props),events,layout:{},source:{backend:'qml',filename,nodeId:node.attributes?.qmlId||node.symbolPath,symbolPath:node.symbolPath,selector:null,start:node.start,end:node.end},opaque:{qmlProperties:clone(node.properties||[])},children:[]};
  for(const child of byRange.filter(x=>x.parentSymbol===node.symbolPath&&!x.propertyOwner))out.children.push(objectToNeutral(child,byRange,filename));return out;
}
export function parseQmlNeutral(source,{filename='Main.qml'}={}){
  const inspection=inspectQmlSource(source,{filename}),nodes=inspection.nodes.map(n=>({...n,parentSymbol:null,propertyOwner:null}));for(const n of nodes){const parent=[...nodes].reverse().find(p=>p!==n&&p.start<n.start&&p.end>n.end);n.parentSymbol=parent?.symbolPath||null;if(parent){const owner=(parent.properties||[]).find(p=>n.start>=p.valueStart&&n.end<=p.valueEnd);n.propertyOwner=owner?.name||null}}
  const root={id:'qml-root',type:'root',tag:'root',name:filename.replace(/\.qml$/i,''),text:'',attrs:{},style:{},events:{},layout:{},source:{backend:'qml',filename},opaque:null,children:[]};for(const n of nodes.filter(x=>!x.parentSymbol&&!x.propertyOwner))root.children.push(objectToNeutral(n,nodes,filename));return {version:2,backend:'qml',filename,root,diagnostics:[...inspection.diagnostics],metadata:{...inspection.metadata,rawSource:String(source)}};
}
function entryQml(files=[],explicit=''){const names=files.map(f=>String(f.filename||f.path||''));if(explicit&&names.includes(explicit))return explicit;return names.find(n=>/(^|\/)Main\.qml$/i.test(n))||names.find(n=>/(^|\/)main\.qml$/i.test(n))||names.find(n=>/\.qml$/i.test(n))||''}
export function importQmlFiles(files=[],{entryFile=''}={}){
  const normalized=(files||[]).map(f=>({filename:String(f.filename||f.path||''),source:String(f.content??f.source??'')})).filter(f=>f.filename),entry=entryQml(normalized,entryFile),file=normalized.find(f=>f.filename===entry)||normalized.find(f=>/\.qml$/i.test(f.filename));if(!file)return parseQmlNeutral('',{filename:entryFile||'Main.qml'});const doc=parseQmlNeutral(file.source,{filename:file.filename});doc.metadata.rawSources=Object.fromEntries(normalized.map(f=>[f.filename,f.source]));doc.metadata.entryFile=file.filename;doc.metadata.qmlFiles=normalized.filter(f=>/\.qml$/i.test(f.filename)).map(f=>f.filename);return doc;
}
function qmlTypeFor(node){const preserved=String(node.attrs?.qmlType||'').replace(/^qml\./,'');if(preserved)return preserved;const t=node.type;if(t==='row')return 'RowLayout';if(t==='column')return 'ColumnLayout';if(t==='grid')return 'GridLayout';if(t==='text'||t==='heading'||t==='label')return 'Label';if(t==='button')return 'Button';if(t==='input')return 'TextField';if(t==='textarea')return 'TextArea';if(t==='image')return 'Image';if(t==='checkbox')return 'CheckBox';if(t==='radio')return 'RadioButton';if(t==='repeater')return 'Repeater';if(t==='page')return 'ApplicationWindow';if(node.style?.backgroundColor)return 'Rectangle';return 'Item'}
function qmlValue(value,kind='string'){if(value&&typeof value==='object'&&value.expression!=null)return String(value.expression);if(kind==='number'){const n=pxNumber(value);return n==null?'0':String(n)}if(kind==='bool')return value?'true':'false';return esc(value)}
function generateQmlDocument(doc,{moduleUri='AstroDesigner'}={}){
  const roots=doc.root?.children||[],seen=new Set();const idFor=node=>{const raw=node.attrs?.qmlId||node.source?.symbolPath||node.name||'item';if(/^[a-z_]\w*$/.test(raw)&&!String(raw).includes('/')){let id=raw,i=2;while(seen.has(id))id=`${raw}${i++}`;seen.add(id);return id}let base=qmlIdSafe(raw),id=base,i=2;while(seen.has(id))id=`${base}${i++}`;seen.add(id);return id};
  const emit=(node,depth=0,isRoot=false)=>{const pad='    '.repeat(depth),type=isRoot&&roots.length===1?qmlTypeFor(node):qmlTypeFor(node),id=idFor(node),s=node.style||{},a=node.attrs||{},lines=[`${pad}${type} {`,`${pad}    id: ${id}`],written=new Set(['id']),opaqueProps=Array.isArray(node.opaque?.qmlProperties)?node.opaque.qmlProperties:[];const preserved=name=>opaqueProps.find(p=>p?.name===name);const raw=(k,v)=>{if(v==null||v==='')return;lines.push(`${pad}    ${k}: ${String(v)}`);written.add(k)};const prop=(k,v,kind='string')=>{if(v==null||v==='')return;lines.push(`${pad}    ${k}: ${qmlValue(v,kind)}`);written.add(k)};
    if(isRoot&&/Window$/.test(type)){prop('width',s.width||800,'number');prop('height',s.height||600,'number');const visible=preserved('visible');if(visible)raw('visible',visible.raw);else prop('visible',true,'bool');const title=preserved('title');if(title&&!a.title)raw('title',title.raw);else prop('title',a.title||node.name||'Astro UI Designer')}
    else{prop('x',s.left,'number');prop('y',s.top,'number');prop('width',s.width,'number');prop('height',s.height,'number')}
    prop('opacity',s.opacity,'number');if(['Rectangle'].includes(type)&&s.backgroundColor!=null)prop('color',s.backgroundColor||s.background);if(s.borderRadius)prop('radius',s.borderRadius,'number');if(['RowLayout','ColumnLayout','GridLayout','Row','Column','Grid'].includes(type))prop('spacing',s.gap,'number');
    if(['Label','Button','ToolButton','RoundButton','CheckBox','RadioButton'].includes(type))prop('text',node.text||a.text||node.name||'');if(type==='TextField'||type==='TextArea')prop('placeholderText',a.placeholderText||a.placeholder||'');if(type==='Image')prop('source',a.src||a.source||'');if(type==='CheckBox'||type==='Switch'||type==='RadioButton')if(a.checked!=null)prop('checked',Boolean(a.checked),'bool');if(s.color&&['Label','Text'].includes(type))prop('color',s.color);if(s.fontSize)prop('font.pixelSize',s.fontSize,'number');
    for(const p of opaqueProps){if(!p?.name||written.has(p.name)||p.name==='id'||p.raw==null||p.raw==='')continue;raw(p.name,p.raw)}
    for(const [event,value] of Object.entries(node.events||{})){if(written.has(event)||!/^on[A-Z]/.test(event))continue;raw(event,value&&typeof value==='object'&&value.expression!=null?value.expression:value)}
    for(const child of node.children||[])lines.push(emit(child,depth+1,false));lines.push(`${pad}}`);return lines.join('\n')};
  let body;if(roots.length===1)body=emit(roots[0],0,true);else{const synthetic={type:'page',name:doc.metadata?.projectName||'Main',attrs:{qmlType:'ApplicationWindow',title:doc.metadata?.projectName||'Astro UI Designer'},style:{width:'800px',height:'600px'},children:roots};body=emit(synthetic,0,true)}
  return `import QtQuick\nimport QtQuick.Controls\nimport QtQuick.Layouts\n\n${body}\n`;
}
export function generateQmlFromNeutral(doc,options={}){
  const moduleUri=options.moduleUri||'AstroDesigner',entryName=String(options.entryFile||'Main.qml'),main=generateQmlDocument(doc,{moduleUri});const appName=String(options.appName||'AstroDesignerApp').replace(/[^A-Za-z0-9_]/g,'_')||'AstroDesignerApp';
  const cpp=`#include <QGuiApplication>\n#include <QQmlApplicationEngine>\n\nint main(int argc, char *argv[])\n{\n    QGuiApplication app(argc, argv);\n    QQmlApplicationEngine engine;\n    engine.loadFromModule("${moduleUri}", "${entryName.replace(/\.qml$/i,'')}");\n    if (engine.rootObjects().isEmpty())\n        return -1;\n    return app.exec();\n}\n`;
  const cmake=`cmake_minimum_required(VERSION 3.21)\nproject(${appName} VERSION 1.0 LANGUAGES CXX)\n\nfind_package(Qt6 6.5 REQUIRED COMPONENTS Quick Qml QuickControls2)\nqt_standard_project_setup(REQUIRES 6.5)\n\nqt_add_executable(${appName}\n    main.cpp\n)\n\nqt_add_qml_module(${appName}\n    URI ${moduleUri}\n    VERSION 1.0\n    QML_FILES\n        ${entryName}\n)\n\ntarget_link_libraries(${appName}\n    PRIVATE Qt6::Quick Qt6::Qml Qt6::QuickControls2\n)\n`;
  return {[entryName]:main,'main.cpp':cpp,'CMakeLists.txt':cmake};
}
function qmlPatchValue(value,property){if(['x','y','width','height','implicitWidth','implicitHeight','spacing','radius','font.pixelSize','opacity'].includes(property)){const n=pxNumber(value);return n==null?String(value):String(n)}if(typeof value==='boolean')return value?'true':'false';if(value==null)return 'null';if(typeof value==='number')return String(value);return esc(value)}
const changeProperty=c=>{const p=String(c.property||'');if(c.domain==='text'||p==='content')return 'text';return ({left:'x',top:'y',backgroundColor:'color',borderRadius:'radius',fontSize:'font.pixelSize',gap:'spacing'}[p]||p)};
export function patchQmlSource(source,identity={},changes=[]){
  const text=String(source),inspection=inspectQmlSource(text,{filename:identity.relativeFilePath||'Main.qml'}),targetKey=String(identity.symbolPath||identity.nodePath||'').trim(),node=inspection.nodes.find(n=>n.symbolPath===targetKey||n.attributes?.qmlId===targetKey);if(!node)return {ok:false,source:text,reason:'qml-object-not-found',inspection};const ops=[];for(const c of changes||[]){const property=changeProperty(c);if(!property)continue;const prior=(node.properties||[]).find(p=>p.name===property),value=qmlPatchValue(c.value,property);if(prior){if(String(prior.raw).trim()===value)continue;ops.push({start:prior.valueStart,end:prior.valueEnd,text:value})}else{const lineStart=text.lastIndexOf('\n',node.start)+1,indent=(text.slice(lineStart,node.start).match(/^\s*/)||[''])[0]+'    ',insert=node.properties?.find(p=>p.name==='id')?.end??(node.start+text.slice(node.start,node.end).indexOf('{')+1);ops.push({start:insert,end:insert,text:`\n${indent}${property}: ${value}`})}}
  if(!ops.length)return {ok:false,source:text,reason:'no-qml-literal-changes',inspection};ops.sort((a,b)=>b.start-a.start);let out=text;for(const op of ops)out=out.slice(0,op.start)+op.text+out.slice(op.end);return {ok:out!==text,source:out,reason:out!==text?'ok':'no-qml-literal-changes',inspection};
}
