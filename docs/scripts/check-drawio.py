#!/usr/bin/env python3
from pathlib import Path
import xml.etree.ElementTree as ET
import sys, json
p=Path(__file__).resolve().parents[1]/'c4/diagrams/astro-ui-designer-master.drawio'
r=ET.parse(p).getroot()
issues=[]; pages=[]
if r.tag!='mxfile': issues.append('root is not mxfile')
for d in r.findall('diagram'):
    m=d.find('mxGraphModel'); name=d.get('name','')
    if m is None: issues.append(f'{name}: missing mxGraphModel'); continue
    w=float(m.get('pageWidth','0') or 0); h=float(m.get('pageHeight','0') or 0)
    root=m.find('root'); cells=root.findall('mxCell') if root is not None else []
    ids={c.get('id') for c in cells}; verts=edges=0
    for c in cells:
        if c.get('vertex')=='1':
            verts+=1; g=c.find('mxGeometry')
            if g is not None and g.get('relative')!='1':
                x=float(g.get('x','0') or 0); y=float(g.get('y','0') or 0); cw=float(g.get('width','0') or 0); ch=float(g.get('height','0') or 0)
                if x<0 or y<0 or x+cw>w+1 or y+ch>h+1: issues.append(f'{name}:{c.get("id")}: geometry out of page bounds')
        if c.get('edge')=='1':
            edges+=1
            for a in ('source','target'):
                v=c.get(a)
                if v and v not in ids: issues.append(f'{name}:{c.get("id")}: missing {a} {v}')
    pages.append({'name':name,'vertices':verts,'edges':edges,'pageWidth':w,'pageHeight':h})
print(json.dumps({'file':str(p),'pages':pages,'issues':issues},indent=2))
if issues: sys.exit(1)
