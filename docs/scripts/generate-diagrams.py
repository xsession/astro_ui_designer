#!/usr/bin/env python3
from pathlib import Path
import xml.etree.ElementTree as ET
import subprocess, shutil, html

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/c4/diagrams'
OUT.mkdir(parents=True, exist_ok=True)

COLORS={
 'blue':('#dae8fc','#6c8ebf'), 'green':('#d5e8d4','#82b366'), 'orange':('#ffe6cc','#d79b00'),
 'yellow':('#fff2cc','#d6b656'), 'purple':('#e1d5e7','#9673a6'), 'red':('#f8cecc','#b85450'),
 'gray':('#f5f5f5','#666666'), 'white':('#ffffff','#666666')
}

PAGES=[]
def page(name,title,nodes,edges,notes=()): PAGES.append((name,title,nodes,edges,notes))

def N(i,label,x,y,w=700,h=220,color='blue',shape='roundrect'):
    return dict(id=i,label=label,x=x,y=y,w=w,h=h,color=color,shape=shape)
def E(src,dst,label=''):
    return dict(src=src,dst=dst,label=label)

page('Workbench-Map','Astro UI Designer — dense engineering workbench',[
 N('user','Developer / Designer / HMI Engineer',100,160,700,200,'gray','actor'),
 N('left','LEFT DOCKS\nPalette · Project · Components · Assets · Sources',100,650,900,300,'blue'),
 N('center','CENTER DOCUMENT SURFACE\nDesign · Split · Code · Preview · Simulate · Lab\nDirect manipulation + multi-selection',1250,560,1500,470,'green'),
 N('right','RIGHT INSPECTORS\nProperties · Layout · Actions · Bindings · Code\nStates · Data · Effects · Composition · Story',3000,650,1100,360,'blue'),
 N('bottom','BOTTOM WORKBENCHES (27)\nProblems · Object Tree · Layout/CSS · State/Animation · Tokens\nGit · Simulation · Prototype · Interchange · Round-trip · MCP-adjacent tools',1050,1450,2200,500,'orange'),
 N('output','OUTPUT\nAstro / QML / framework source\nDraw.io / neutral interchange',1250,2350,1500,350,'purple')
],[E('user','center','edits'),E('left','center','inserts / opens'),E('right','center','inspects / mutates'),E('bottom','center','specialist workflows'),E('center','output','generates / syncs')],
['All 42 major panels are relocatable to left/right/bottom or floating.','Dense by design; progressive disclosure reduces visual overload.'])

page('C4-C1-System-Context','C4 C1 — System Context',[
 N('person','UI / HMI Developer\n[Person]\nDesigns, verifies and exports interfaces',120,500,760,300,'gray','actor'),
 N('system','Astro UI Designer\n[Software System]\nVisual/source IDE, simulation and controlled automation',1350,450,1450,430,'blue'),
 N('files','Local Project + Git\n[External Software/Data System]\nUser-owned source and history',3250,250,1050,300,'green'),
 N('runtime','Target Runtime / Toolchain\n[External Software System]\nAstro/Web · Python · Qt/QML · LVGL',3250,750,1100,330,'orange'),
 N('vscode','VS Code\n[External Software System]\nExtension host and workspace APIs',3250,1250,950,300,'purple'),
 N('agent','MCP Agent Client\n[External Software System]\nCalls semantic project tools',3250,1700,950,300,'yellow'),
 N('interchange','Design / Interchange Tools\n[External Software Systems]\nDraw.io · Penpot-like · SVG/HTML/JSON',1150,1600,1550,330,'green'),
 N('deploy','Generated Application / Deployment\n[External Runtime]\nOrdinary user-owned source output',1300,2350,1450,330,'purple')
],[E('person','system','designs & verifies'),E('system','files','reads / writes via host APIs'),E('system','runtime','generates source / launches preview'),E('system','vscode','embedded as webview via extension'),E('agent','system','stdio semantic MCP'),E('system','interchange','imports / exports documents'),E('system','deploy','produces ordinary source')],['Legend: actor = Person; blue = system in scope; other colors = external systems/artifacts.','Relationships are directional and labeled with intent.'])

page('C4-C2-Containers','C4 C2 — Containers',[
 N('web','Designer Web App\n[Container: Browser ES Modules]\nCanvas, model editing, workbenches, simulation UI',250,400,1150,380,'blue'),
 N('host','Standalone Host\n[Container: Node.js]\nStatic server + workspace/Git/preview APIs',1750,180,1200,380,'green'),
 N('vsc','VS Code Extension Host\n[Container: VS Code Extension]\nWebview bridge + workspace/Git/tasks/tests',1750,780,1200,400,'purple'),
 N('mcp','Hermes MCP Server\n[Container: Node.js stdio]\nSemantic project tools + simulation sessions',3300,450,1100,380,'yellow'),
 N('proj','Project Workspace\n[Data Store: local filesystem/Git]\nSource + designer-project.json',1450,1650,1550,380,'green'),
 N('target','Target Preview / Build Runtime\n[External Container/Process]\nAstro/Vite · Python · Qt · LVGL simulator',3350,1650,1050,380,'orange')
],[E('web','host','HTTP JSON on localhost /api/*'),E('web','vsc','VS Code webview message bridge'),E('mcp','proj','filesystem read / atomic designer JSON write'),E('host','proj','contained filesystem + Git I/O'),E('vsc','proj','VS Code workspace APIs'),E('host','target','explicit preview child process'),E('proj','target','framework build/run inputs')],['C4 container means an application/data store, not a Docker container.','Round-trip/model modules are components inside the Designer container and appear at C3.'])

page('C4-C3-Components','C4 C3 — Designer Components',[
 N('shell','Shell + Commands\ndocuments · modes · hotkeys · docking',250,250,900,300,'blue'),
 N('model','Project Model\npages · nodes · components · migration',1450,250,900,300,'green'),
 N('canvas','Canvas Renderer + Direct Manipulation',2650,250,1050,300,'blue'),
 N('work','Functional Workbenches\ninspectors + specialist tools',250,900,1000,320,'orange'),
 N('style','CSS / Color / Effects / Animation',1550,900,1000,320,'purple'),
 N('sim','Simulation + Validation + Component Lab',2850,900,1100,320,'yellow'),
 N('rt','Round-trip / Interchange\nQML · pwtk · Draw.io · neutral IR',700,1600,1400,350,'orange'),
 N('plugin','Plugin / Contribution API',2450,1600,1000,330,'green'),
 N('host','Workspace Client / Host Bridges',1500,2300,1300,330,'gray')
],[E('shell','model','orchestrates'),E('canvas','model','reads/writes'),E('work','model','reads/writes'),E('style','model','style semantics'),E('sim','model','interprets / validates'),E('rt','model','imports/maps'),E('plugin','shell','extends'),E('host','rt','filesystem/preview'),E('shell','host','workspace actions')])

page('C4-C4-Source-Modules','C4 C4 — Source Module Map',[
 N('app','app.js\nmain UI orchestration',200,250,850,260,'blue'),
 N('models','model.js + project-pages.js',1300,250,950,260,'green'),
 N('layout','manual-layout.js\nadvanced-manual-edit.js',2500,250,1050,260,'blue'),
 N('work','functional-workbenches.js',3650,250,850,260,'orange'),
 N('style','css-tools.js · color-picker.js · animation.js',650,900,1300,280,'purple'),
 N('sim','simulation.js · validator.js · storybook-cleanroom.js',2350,900,1400,280,'yellow'),
 N('rts','roundtrip-*.js · qml-io.js · drawio-io.js',650,1500,1550,300,'orange'),
 N('plugin','plugin-api.js · plugins/*',2650,1500,1000,300,'green'),
 N('host','launch-designer.mjs · workspace-tools.mjs\nvscode-extension/* · integrations/hermes/*',1300,2200,1900,350,'gray')
],[E('app','models'),E('app','layout'),E('app','work'),E('style','models'),E('sim','models'),E('rts','models'),E('plugin','app'),E('host','rts')])

page('Runtime-Project-Import','Runtime — Import Existing Project',[
 N('u','User',150,300,600,220,'gray','actor'),N('ui','Import Project UI',1050,300,750,260,'blue'),
 N('host','Host folder browser / snapshot picker',2100,300,1050,260,'green'),N('detect','Round-trip detection',3450,300,950,260,'orange'),
 N('review','Detection review\nadapter + entry override',3450,1000,950,300,'yellow'),N('adapter','Selected adapter importer',2100,1000,1050,300,'orange'),
 N('model','Designer project + source mappings',800,1000,1200,320,'green'),N('studio','Round-trip Studio',800,1800,1000,280,'purple')
],[E('u','ui','Import'),E('ui','host','browse'),E('host','detect','files'),E('detect','review','evidence'),E('review','adapter','confirmed backend'),E('adapter','model','neutral IR + identities'),E('model','studio','open')])

page('Runtime-Visual-to-Source','Runtime — Reviewed Visual → Source',[
 N('edit','Visual edit',200,350,700,240,'blue'),N('model','Designer model mutation',1200,350,850,260,'green'),N('plan','Round-trip plan',2350,350,850,260,'orange'),
 N('fp','Fingerprint / staleness check',3450,350,950,260,'yellow'),N('review','User review / confidence',3450,1050,950,260,'blue'),N('patch','Adapter patch',2350,1050,850,260,'orange'),
 N('write','Contained source write',1200,1050,850,260,'green'),N('audit','Checkpoint + audit history',200,1050,750,260,'purple')
],[E('edit','model'),E('model','plan'),E('plan','fp'),E('fp','review','fresh'),E('review','patch','approve'),E('patch','write'),E('write','audit'),E('fp','model','stale → reconcile')])

page('Runtime-Simulation','Runtime — Deterministic Page/Project Simulation',[
 N('start','Start session\npage / project scope',200,250,900,260,'blue'),N('event','Dispatch event\nclick / input / hover / focus / delay',1450,250,1100,300,'green'),
 N('cond','Restricted condition evaluator',2950,250,1000,260,'yellow'),N('actions','Declarative actions/interactions',2950,950,1000,300,'orange'),
 N('state','Session state\nvariables · overlays · history · route',1450,950,1100,330,'green'),N('render','Simulation pane / MCP summary',200,950,900,300,'purple'),
 N('runtime','NO arbitrary imported app code execution',1100,1800,1900,300,'red')
],[E('start','state'),E('event','cond'),E('cond','actions','allowed'),E('actions','state','mutate'),E('state','render','summarize'),E('render','event','next user event')])

page('Runtime-MCP','Runtime — Semantic MCP Request',[
 N('client','MCP Client / Agent',150,300,750,250,'gray','actor'),N('server','stdio MCP server',1200,300,800,250,'yellow'),N('schema','Tool schema + validation',2300,300,900,250,'blue'),
 N('service','Semantic project operation',3500,300,900,250,'green'),N('file','designer-project.json\natomic mutation',3500,1000,900,280,'green'),N('session','In-memory simulation session',2300,1000,900,280,'purple'),
 N('export','Contained Astro export',1200,1000,800,280,'orange'),N('nogeneric','No generic shell/filesystem authority',1200,1800,2100,280,'red')
],[E('client','server','JSON-RPC'),E('server','schema'),E('schema','service'),E('service','file','model tools'),E('service','session','simulation tools'),E('service','export','export tool')])

page('Data-Project-Model','Data — Designer Project Model',[
 N('project','Project',1800,150,1000,260,'blue'),N('pages','Pages[]',500,700,800,240,'green'),N('components','Components[]',1600,700,900,240,'green'),N('assets','Assets / Tokens / Variables',2800,700,1000,240,'purple'),N('workspace','Workspace / Source mappings',3950,700,700,240,'orange'),
 N('nodes','Rooted Node Trees\nid · type · props · style · children',700,1350,1100,300,'blue'),N('actions','Actions / Bindings / Interactions',2050,1350,1100,300,'yellow'),N('design','Design metadata\neffects · constraints · manual layout',3450,1350,1050,300,'purple'),
 N('editor','Editor state\ndocks · hotkeys · tab order',900,2150,1050,280,'gray'),N('sim','Simulation settings',2350,2150,900,280,'yellow'),N('story','Stories / Tests / Comments / Flows',3500,2150,1050,280,'green')
],[E('project','pages'),E('project','components'),E('project','assets'),E('project','workspace'),E('pages','nodes'),E('components','nodes'),E('nodes','actions'),E('nodes','design'),E('project','editor'),E('project','sim'),E('project','story')])

page('Roundtrip-Adapter-Architecture','Round-trip Adapter Architecture',[
 N('files','Source files',100,300,700,240,'gray'),N('detect','Backend detection',1100,300,800,240,'orange'),N('adapter','Adapter SDK / built-ins',2200,300,950,260,'orange'),N('ir','Neutral IR',3500,300,750,240,'green'),
 N('identity','Source identities + fingerprints',900,1100,1100,280,'yellow'),N('project','Designer project model',2500,1100,1000,280,'blue'),N('plan','Reviewed patch plan + history',3800,1100,750,280,'purple'),
 N('matrix','Astro · React · Vanilla JS/TS · Vue · Svelte\nTkinter · NiceGUI · LVGL · QML · pwtk',1300,2000,2300,330,'green')
],[E('files','detect'),E('detect','adapter'),E('adapter','ir','import'),E('ir','project'),E('adapter','identity','inspect'),E('identity','plan'),E('project','plan','visual changes'),E('plan','adapter','approved patch')])

page('Deployment-Standalone','Deployment — Standalone Host',[
 N('browser','Browser\nDesigner Web App',350,600,900,300,'blue'),N('node','Node localhost host\nlaunch-designer.mjs',1700,600,1100,300,'green'),N('fs','Workspace files / Git',3300,300,900,260,'green'),N('preview','Target dev/preview process',3300,900,1000,300,'orange'),N('mcp','Optional MCP process',1700,1500,1100,280,'yellow')
],[E('browser','node','HTTP /api'),E('node','fs','contained I/O'),E('node','preview','explicit start/stop'),E('mcp','fs','project-scoped stdio')])

page('Deployment-VSCode','Deployment — VS Code',[
 N('user','Developer',150,450,650,230,'gray','actor'),N('webview','Designer Webview',1100,450,900,300,'blue'),N('ext','VS Code Extension Host',2400,450,1050,300,'purple'),N('workspace','Workspace / Git',3800,200,800,250,'green'),N('services','Tasks · Diagnostics · Tests · Preview',3650,850,950,300,'orange')
],[E('user','webview'),E('webview','ext','message bridge'),E('ext','workspace','trusted workspace API'),E('ext','services','native integrations')])

page('Quality-Test-Strategy','Quality — Verification Strategy',[
 N('unit','Pure model/unit tests\nmodel · layout · simulation · adapters',300,300,1050,300,'green'),N('integration','Integration tests\napp bridge · workspace · interchange · MCP',1700,300,1100,300,'blue'),N('browser','Rendered/browser tests\ndrag · resize · panels · visual checkpoints',3200,300,1100,300,'purple'),
 N('target','Target runtime validation\nAstro build · Qt · Python · LVGL where installed',1000,1200,1400,330,'orange'),N('docs','Documentation checks\nlinks · generated reference · Draw.io XML',2850,1200,1200,330,'yellow'),N('gate','Release evidence\naggregate suite + specialist suites + fresh ZIP retest',1450,2100,1900,330,'blue')
],[E('unit','gate'),E('integration','gate'),E('browser','gate'),E('target','gate'),E('docs','gate')])

# Draw.io builder
mxfile=ET.Element('mxfile',{'host':'Electron','agent':'Astro UI Designer Documentation 2.19','version':'29.7.1'})
for idx,(name,title,nodes,edges,notes) in enumerate(PAGES):
    diagram=ET.SubElement(mxfile,'diagram',{'id':f'astro-doc-{idx+1}','name':name})
    model=ET.SubElement(diagram,'mxGraphModel',{'dx':'1200','dy':'900','grid':'1','gridSize':'10','guides':'1','tooltips':'1','connect':'1','arrows':'1','fold':'1','page':'1','pageScale':'1','pageWidth':'4681','pageHeight':'3300','math':'0','shadow':'0'})
    root=ET.SubElement(model,'root'); ET.SubElement(root,'mxCell',{'id':'0'}); ET.SubElement(root,'mxCell',{'id':'1','parent':'0'})
    titlecell=ET.SubElement(root,'mxCell',{'id':'title','value':title,'style':'text;html=1;align=left;verticalAlign=middle;fontSize=30;fontStyle=1;','parent':'1','vertex':'1'})
    ET.SubElement(titlecell,'mxGeometry',{'x':'120','y':'60','width':'2500','height':'80','as':'geometry'})
    for n in nodes:
        fill,stroke=COLORS[n['color']]
        if n['shape']=='actor': style=f'shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;fillColor={fill};strokeColor={stroke};fontSize=18;'
        else: style=f'rounded=1;whiteSpace=wrap;html=1;fillColor={fill};strokeColor={stroke};strokeWidth=2;fontSize=18;align=center;verticalAlign=middle;'
        c=ET.SubElement(root,'mxCell',{'id':n['id'],'value':n['label'].replace('\n','&#xa;'),'style':style,'parent':'1','vertex':'1'})
        ET.SubElement(c,'mxGeometry',{'x':str(n['x']),'y':str(n['y']),'width':str(n['w']),'height':str(n['h']),'as':'geometry'})
    for ei,e in enumerate(edges):
        c=ET.SubElement(root,'mxCell',{'id':f'e{ei}','value':e['label'],'style':'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endFill=1;strokeWidth=2;fontSize=15;','parent':'1','source':e['src'],'target':e['dst'],'edge':'1'})
        ET.SubElement(c,'mxGeometry',{'relative':'1','as':'geometry'})
    for ni,note in enumerate(notes):
        c=ET.SubElement(root,'mxCell',{'id':f'note{ni}','value':note,'style':'shape=note;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=15;','parent':'1','vertex':'1'})
        ET.SubElement(c,'mxGeometry',{'x':'3350','y':str(2500+ni*240),'width':'1100','height':'180','as':'geometry'})

ET.indent(mxfile,space='  ')
ET.ElementTree(mxfile).write(OUT/'astro-ui-designer-master.drawio',encoding='utf-8',xml_declaration=False)

# Graphviz previews (compact variants, intentionally not a one-to-one render of Draw.io)
DOTS={
'system-context':'''digraph G { graph [rankdir=LR,bgcolor="white",pad=.4,nodesep=.7,ranksep=1]; node [shape=box,style="rounded,filled",fontname="Arial",fontsize=12]; edge [fontname="Arial",fontsize=10]; user [label="UI / HMI Developer",fillcolor="#f5f5f5"]; designer [label="Astro UI Designer\nvisual + source IDE",fillcolor="#dae8fc"]; files [label="Project files + Git",fillcolor="#d5e8d4"]; runtime [label="Target runtimes\nWeb / Python / Qt / LVGL",fillcolor="#ffe6cc"]; vscode [label="VS Code",fillcolor="#e1d5e7"]; agent [label="MCP Agent",fillcolor="#fff2cc"]; out [label="Generated source",fillcolor="#d5e8d4"]; user->designer; designer->files [label="reviewed I/O"]; designer->runtime [label="generate / preview"]; designer->vscode; agent->designer [label="semantic MCP"]; designer->out; }''',
'containers':'''digraph G { graph [rankdir=TB,bgcolor="white",pad=.4]; node [shape=box,style="rounded,filled",fontname="Arial"]; web [label="Designer Web App",fillcolor="#dae8fc"]; host [label="Standalone Node Host",fillcolor="#d5e8d4"]; vsc [label="VS Code Extension Host",fillcolor="#e1d5e7"]; rt [label="Round-trip Engine",fillcolor="#ffe6cc"]; mcp [label="MCP Server",fillcolor="#fff2cc"]; proj [label="Target Project",fillcolor="#d5e8d4"]; web->host; web->vsc; web->rt; host->proj; vsc->proj; rt->proj; mcp->proj; }''',
'roundtrip':'''digraph G { graph [rankdir=LR,bgcolor="white",pad=.4]; node [shape=box,style="rounded,filled",fontname="Arial"]; files [label="Source files",fillcolor="#f5f5f5"]; detect [label="Detect backend",fillcolor="#ffe6cc"]; adapter [label="Adapter",fillcolor="#ffe6cc"]; ir [label="Neutral IR",fillcolor="#d5e8d4"]; model [label="Designer model",fillcolor="#dae8fc"]; plan [label="Reviewed patch plan",fillcolor="#e1d5e7"]; files->detect->adapter->ir->model; model->plan->adapter; adapter->files [label="fingerprinted patch"]; }''',
'simulation':'''digraph G { graph [rankdir=LR,bgcolor="white",pad=.4]; node [shape=box,style="rounded,filled",fontname="Arial"]; start [label="Session",fillcolor="#dae8fc"]; event [label="Event",fillcolor="#d5e8d4"]; cond [label="Restricted condition",fillcolor="#fff2cc"]; action [label="Declarative action",fillcolor="#ffe6cc"]; state [label="State / route / overlays",fillcolor="#d5e8d4"]; view [label="UI/MCP summary",fillcolor="#e1d5e7"]; start->state; event->cond->action->state->view; view->event; }''',
'mcp':'''digraph G { graph [rankdir=LR,bgcolor="white",pad=.4]; node [shape=box,style="rounded,filled",fontname="Arial"]; client [label="MCP Client",fillcolor="#f5f5f5"]; server [label="stdio MCP",fillcolor="#fff2cc"]; schema [label="Tool schema + validation",fillcolor="#dae8fc"]; op [label="Semantic operation",fillcolor="#d5e8d4"]; project [label="Designer project JSON",fillcolor="#d5e8d4"]; sim [label="Simulation session",fillcolor="#e1d5e7"]; client->server->schema->op; op->project; op->sim; }''',
'data-model':'''digraph G { graph [rankdir=TB,bgcolor="white",pad=.4]; node [shape=box,style="rounded,filled",fontname="Arial"]; p [label="Project",fillcolor="#dae8fc"]; pages [label="Pages",fillcolor="#d5e8d4"]; comps [label="Components",fillcolor="#d5e8d4"]; nodes [label="Node trees\nprops + responsive style + children",fillcolor="#dae8fc"]; actions [label="Actions / Bindings / Interactions",fillcolor="#fff2cc"]; source [label="Workspace / Source mappings",fillcolor="#ffe6cc"]; editor [label="Editor state",fillcolor="#f5f5f5"]; p->pages; p->comps; pages->nodes; comps->nodes; nodes->actions; p->source; p->editor; }''',
'workbench':'''digraph G { graph [rankdir=TB,bgcolor="white",pad=.4]; node [shape=box,style="rounded,filled",fontname="Arial"]; center [label="Center canvas / documents",fillcolor="#d5e8d4"]; left [label="Left discovery docks (5)",fillcolor="#dae8fc"]; right [label="Right inspectors (10)",fillcolor="#dae8fc"]; bottom [label="Bottom workbenches (27)",fillcolor="#ffe6cc"]; left->center; right->center; bottom->center; }'''
}
for name,dot in DOTS.items():
    d=OUT/f'{name}.dot'; d.write_text(dot,encoding='utf-8')
    if shutil.which('dot'):
        for fmt in ('svg','png'):
            subprocess.run(['dot',f'-T{fmt}',str(d),'-o',str(OUT/f'{name}.{fmt}')],check=True)

# Validate resulting XML
ET.parse(OUT/'astro-ui-designer-master.drawio')
print(f'generated {len(PAGES)} drawio pages and {len(DOTS)} preview diagrams')
