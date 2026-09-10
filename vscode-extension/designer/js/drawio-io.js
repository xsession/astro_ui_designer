import { createProject, createNode, makeId, deepClone } from './model.js';

export const DRAWIO_MIME = 'application/vnd.jgraph.mxfile';
export const DRAWIO_EXTENSIONS = ['.drawio', '.xml', '.drawio.svg'];

const XML_ENTITIES = Object.freeze({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' });
const px = (value, fallback = 0) => {
  const n = parseFloat(String(value ?? ''));
  return Number.isFinite(n) ? n : fallback;
};
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function xmlEscape(value = '') {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function xmlDecode(value = '') {
  return String(value).replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (_, token) => {
    const lower = token.toLowerCase();
    if (lower.startsWith('#x')) return String.fromCodePoint(parseInt(lower.slice(2), 16));
    if (lower.startsWith('#')) return String.fromCodePoint(parseInt(lower.slice(1), 10));
    return XML_ENTITIES[lower] ?? _;
  });
}

function stripHtml(value = '') {
  return xmlDecode(String(value))
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseAttributes(source = '') {
  const out = {};
  const re = /([A-Za-z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let match;
  while ((match = re.exec(source))) out[match[1]] = xmlDecode(match[2] ?? match[3] ?? '');
  return out;
}

export function parseDrawioStyle(style = '') {
  const out = {};
  for (const token of String(style).split(';')) {
    if (!token) continue;
    const i = token.indexOf('=');
    if (i < 0) out[token.trim()] = '1';
    else out[token.slice(0, i).trim()] = token.slice(i + 1).trim();
  }
  return out;
}

export function serializeDrawioStyle(style = {}) {
  const entries = [];
  for (const [key, value] of Object.entries(style)) {
    if (value == null || value === '' || value === false) continue;
    entries.push(value === '1' && !key.includes('=') && ['ellipse', 'group', 'swimlane', 'text'].includes(key) ? key : `${key}=${value}`);
  }
  return entries.join(';') + (entries.length ? ';' : '');
}

export function isDrawioText(text = '') {
  const s = String(text).trim();
  if (/<(?:mxfile|mxGraphModel)\b/i.test(s)) return true;
  return /^<svg\b/i.test(s.replace(/^<\?xml[^>]*>\s*/i, '')) && /\bcontent=(?:"[^"]*&lt;mxfile\b|'[^']*&lt;mxfile\b)/i.test(s);
}

function unwrapEmbeddedDrawio(source) {
  const s = String(source).trim();
  if (!/^<svg\b/i.test(s.replace(/^<\?xml[^>]*>\s*/i, ''))) return s;
  const match = s.match(/\bcontent=(?:"([^"]*)"|'([^']*)')/i);
  const content = match?.[1] ?? match?.[2];
  if (content && /&lt;mxfile\b/i.test(content)) return xmlDecode(content);
  return s;
}

function normalizeObjectWrappedCells(xml) {
  return String(xml).replace(/<object\b([^>]*)>\s*<mxCell\b([^>]*)>([\s\S]*?)<\/mxCell>\s*<\/object>/gi, (_, objectRaw, cellRaw, body) => {
    const object = parseAttributes(objectRaw), cell = parseAttributes(cellRaw);
    let attrs = cellRaw.trim();
    if (!cell.id && object.id) attrs += ` id="${xmlEscape(object.id)}"`;
    if (!cell.value && (object.label || object.value)) attrs += ` value="${xmlEscape(object.label || object.value)}"`;
    return `<mxCell ${attrs}>${body}</mxCell>`;
  });
}

function base64ToBytes(value) {
  const clean = String(value).replace(/\s+/g, '');
  if (typeof atob === 'function') {
    const binary = atob(clean);
    return Uint8Array.from(binary, c => c.charCodeAt(0));
  }
  if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(clean, 'base64'));
  throw new Error('No base64 decoder is available in this runtime.');
}

async function inflateRawPortable(bytes, customInflate) {
  if (customInflate) {
    const result = await customInflate(bytes);
    if (typeof result === 'string') return result;
    return new TextDecoder().decode(result instanceof Uint8Array ? result : new Uint8Array(result));
  }
  if (typeof DecompressionStream !== 'undefined') {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return await new Response(stream).text();
  }
  if (typeof process !== 'undefined' && process?.versions?.node) {
    const { inflateRawSync } = await import('node:zlib');
    return new TextDecoder().decode(inflateRawSync(bytes));
  }
  throw new Error('This Draw.io page is compressed and this runtime has no raw-DEFLATE decoder.');
}

async function decodeDiagramBody(body, options = {}) {
  let value = String(body ?? '').trim();
  if (value.startsWith('<![CDATA[') && value.endsWith(']]>')) value = value.slice(9, -3).trim();
  if (/^&lt;mxGraphModel\b/i.test(value)) value = xmlDecode(value);
  if (/^<mxGraphModel\b/i.test(value)) return value;
  if (!value) throw new Error('Draw.io diagram page is empty.');
  const inflated = await inflateRawPortable(base64ToBytes(value), options.inflateRaw);
  try {
    const decoded = decodeURIComponent(inflated);
    if (/<mxGraphModel\b/i.test(decoded)) return decoded;
  } catch {}
  if (/<mxGraphModel\b/i.test(inflated)) return inflated;
  throw new Error('Could not decode the compressed Draw.io diagram page.');
}

function extractDiagramRecords(text) {
  const source = unwrapEmbeddedDrawio(text);
  if (/^<mxGraphModel\b/i.test(source.replace(/^<\?xml[^>]*>\s*/i, ''))) {
    return [{ id: 'page-1', name: 'Page 1', body: source.replace(/^<\?xml[^>]*>\s*/i, '') }];
  }
  const records = [];
  const re = /<diagram\b([^>]*)>([\s\S]*?)<\/diagram>/gi;
  let match;
  while ((match = re.exec(source))) {
    const attrs = parseAttributes(match[1]);
    records.push({ id: attrs.id || `page-${records.length + 1}`, name: attrs.name || `Page ${records.length + 1}`, body: match[2] });
  }
  if (!records.length) throw new Error('No <diagram> pages were found in this Draw.io file.');
  return records;
}

function parseGeometry(body = '') {
  const open = String(body).match(/<mxGeometry\b([^>]*)>/i) || String(body).match(/<mxGeometry\b([^>]*)\/>/i);
  const attrs = parseAttributes(open?.[1] || '');
  const points = [];
  const pointRe = /<mxPoint\b([^>]*)\/?\s*>/gi;
  let match;
  while ((match = pointRe.exec(body))) {
    const a = parseAttributes(match[1]);
    points.push({ as: a.as || '', x: px(a.x, 0), y: px(a.y, 0) });
  }
  return {
    x: px(attrs.x, 0), y: px(attrs.y, 0), width: px(attrs.width, 0), height: px(attrs.height, 0),
    relative: attrs.relative === '1', as: attrs.as || 'geometry', points,
  };
}

function parseGraphModel(xml) {
  xml = normalizeObjectWrappedCells(xml);
  const modelTag = String(xml).match(/<mxGraphModel\b([^>]*)>/i);
  const model = parseAttributes(modelTag?.[1] || '');
  const cells = [];
  const re = /<mxCell\b([^>]*?)\/>|<mxCell\b([^>]*?)>([\s\S]*?)<\/mxCell>/gi;
  let match;
  while ((match = re.exec(xml))) {
    const attrs = parseAttributes(match[1] ?? match[2] ?? '');
    const body = match[3] ?? '';
    cells.push({
      id: attrs.id || makeId('mx'), parent: attrs.parent || '', source: attrs.source || '', target: attrs.target || '',
      vertex: attrs.vertex === '1', edge: attrs.edge === '1', value: attrs.value || '', style: attrs.style || '',
      attrs, geometry: parseGeometry(body), body,
    });
  }
  return { model, cells };
}

function fillStyleFromDrawio(base, style, cell) {
  const g = cell.geometry;
  base.position = 'absolute';
  base.left = `${Math.round(g.x)}px`;
  base.top = `${Math.round(g.y)}px`;
  if (g.width > 0) base.width = `${Math.round(g.width)}px`;
  if (g.height > 0) base.height = `${Math.round(g.height)}px`;
  base.boxSizing = 'border-box';
  const fill = style.fillColor;
  const stroke = style.strokeColor;
  if (fill && fill !== 'none' && fill !== 'default') base.background = fill;
  else if (fill === 'none') base.background = 'transparent';
  if (stroke && stroke !== 'none' && stroke !== 'default') base.border = `${Math.max(0.5, px(style.strokeWidth, 1))}px ${style.dashed === '1' ? 'dashed' : 'solid'} ${stroke}`;
  else if (stroke === 'none') base.border = 'none';
  if (style.fontColor && style.fontColor !== 'default') base.color = style.fontColor;
  if (style.fontSize) base.fontSize = `${Math.max(1, px(style.fontSize, 12))}px`;
  const fontStyle = parseInt(style.fontStyle || '0', 10) || 0;
  if (fontStyle & 1) base.fontWeight = '700';
  if (fontStyle & 2) base.fontStyle = 'italic';
  if (fontStyle & 4) base.textDecoration = 'underline';
  if (style.align) base.textAlign = style.align === 'left' || style.align === 'right' ? style.align : 'center';
  if (style.opacity) base.opacity = String(clamp(px(style.opacity, 100) / 100, 0, 1));
  if (style.rounded === '1') base.borderRadius = `${Math.max(6, px(style.arcSize, 12))}px`;
  if (style.ellipse === '1' || style.shape === 'ellipse') base.borderRadius = '50%';
  if (style.rotation) base.rotate = `${px(style.rotation, 0)}deg`;
  if (style.shadow === '1') base.boxShadow = '0 3px 10px rgba(15,23,42,.22)';
  if (style.whiteSpace === 'wrap' || style.html === '1') base.whiteSpace = 'pre-wrap';
  return base;
}

function labelAlignment(style) {
  const justify = style.align === 'left' ? 'flex-start' : style.align === 'right' ? 'flex-end' : 'center';
  const align = style.verticalAlign === 'top' ? 'flex-start' : style.verticalAlign === 'bottom' ? 'flex-end' : 'center';
  return { justifyContent: justify, alignItems: align };
}

function cellToNode(cell, childCount = 0) {
  const style = parseDrawioStyle(cell.style);
  const label = stripHtml(cell.value);
  const textOnly = style.text === '1' || style.shape === 'text' || ((style.fillColor === 'none' || !style.fillColor) && style.strokeColor === 'none' && !style.shape && !childCount);
  const imageLike = style.shape === 'image' || Boolean(style.image);
  const groupLike = style.group === '1' || childCount > 0;
  let node;
  if (imageLike) {
    node = createNode('image', { name: label || `Image ${cell.id}`, props: { src: style.image || '', alt: label || '' } });
  } else if (textOnly) {
    node = createNode('text', { name: label || `Text ${cell.id}`, props: { text: label || '' } });
  } else if (groupLike) {
    node = createNode('group', { name: label || `Group ${cell.id}` });
  } else {
    node = createNode('card', { name: label || `Shape ${cell.id}` });
  }
  node.style.base = fillStyleFromDrawio({ ...(node.style?.base || {}), padding: '0', margin: node.type === 'text' ? '0' : (node.style?.base?.margin || '0'), borderRadius: '0' }, style, cell);
  node.meta ??= {};
  node.meta.drawio = {
    cellId: cell.id, parentCellId: cell.parent, rawStyle: cell.style, rawValue: cell.value,
    shape: style.shape || (style.ellipse === '1' ? 'ellipse' : ''), imported: true,
  };
  if (label && !textOnly && !imageLike) {
    const align = labelAlignment(style);
    const synthetic = createNode('text', {
      name: `${node.name} Label`, props: { text: label },
      style: { base: { position: 'absolute', inset: '0', display: 'flex', ...align, padding: '6px', margin: '0', background: 'transparent', border: 'none', color: 'inherit', fontSize: 'inherit', textAlign: style.align || 'center', whiteSpace: 'pre-wrap', pointerEvents: 'none' } },
      meta: { drawioSyntheticLabel: true, sourceOwnership: 'designer' },
    });
    node.children.unshift(synthetic);
  }
  return node;
}

function routeSlug(name, index) {
  const slug = String(name || `diagram-${index + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `diagram-${index + 1}`;
  return index === 0 ? '/' : `/${slug}`;
}

export async function importDrawioText(text, options = {}) {
  const records = extractDiagramRecords(text);
  const project = createProject();
  project.name = options.projectName || 'drawio-import';
  project.pages = [];
  project.design ??= {};
  project.design.interchange ??= {};
  project.design.interchange.drawio = { version: 1, importedAt: new Date().toISOString(), edges: [], pages: [] };

  for (let pageIndex = 0; pageIndex < records.length; pageIndex++) {
    const record = records[pageIndex];
    const xml = await decodeDiagramBody(record.body, options);
    const parsed = parseGraphModel(xml);
    const vertices = parsed.cells.filter(c => c.vertex);
    const edges = parsed.cells.filter(c => c.edge);
    const childCounts = new Map();
    for (const c of vertices) childCounts.set(c.parent, (childCounts.get(c.parent) || 0) + 1);
    const nodeByCell = new Map();
    for (const cell of vertices) nodeByCell.set(cell.id, cellToNode(cell, childCounts.get(cell.id) || 0));

    const seed = createProject().pages[0];
    const route = routeSlug(record.name, pageIndex);
    seed.id = makeId('page-doc');
    seed.name = record.name || `Page ${pageIndex + 1}`;
    seed.route = route;
    seed.filename = route === '/' ? 'index.astro' : `${route.slice(1)}/index.astro`;
    seed.seo = { title: seed.name, description: 'Imported from Draw.io / diagrams.net', canonical: '', ogImage: '' };
    seed.root.name = `${seed.name}Root`;
    seed.root.props = { ...(seed.root.props || {}), title: seed.name, description: 'Imported from Draw.io / diagrams.net' };

    const topVertices = vertices.filter(c => !nodeByCell.has(c.parent));
    const maxX = Math.max(1280, ...topVertices.map(c => c.geometry.x + Math.max(c.geometry.width, 120) + 80));
    const maxY = Math.max(720, ...topVertices.map(c => c.geometry.y + Math.max(c.geometry.height, 60) + 80));
    const pageWidth = Math.max(maxX, px(parsed.model.pageWidth, 0));
    const pageHeight = Math.max(maxY, px(parsed.model.pageHeight, 0));
    const canvas = createNode('freeform', {
      name: `${seed.name} Diagram`,
      style: { base: { position: 'relative', width: `${Math.round(pageWidth)}px`, minHeight: `${Math.round(pageHeight)}px`, overflow: 'visible', background: '#ffffff', border: '1px solid #d7dce2' } },
      meta: { drawioCanvas: true, drawioPageId: record.id, sourceOwnership: 'designer' },
    });
    canvas.children = [];

    for (const cell of vertices) {
      const node = nodeByCell.get(cell.id);
      const parentNode = nodeByCell.get(cell.parent);
      if (parentNode && Array.isArray(parentNode.children)) parentNode.children.push(node);
      else canvas.children.push(node);
    }
    seed.root.children = [canvas];
    project.pages.push(seed);
    project.design.interchange.drawio.pages.push({ pageId: seed.id, diagramId: record.id, name: seed.name, model: deepClone(parsed.model) });

    for (const edge of edges) {
      project.design.interchange.drawio.edges.push({
        id: makeId('drawio-edge'), pageId: seed.id, cellId: edge.id, parentCellId: edge.parent,
        sourceCellId: edge.source, targetCellId: edge.target,
        sourceNodeId: nodeByCell.get(edge.source)?.id || '', targetNodeId: nodeByCell.get(edge.target)?.id || '',
        value: stripHtml(edge.value), rawValue: edge.value, style: edge.style, geometry: deepClone(edge.geometry),
      });
    }
  }

  if (!project.pages.length) throw new Error('Draw.io import produced no pages.');
  return project;
}

function cssColor(value) {
  const s = String(value || '').trim();
  if (!s || s === 'transparent' || s === 'none') return 'none';
  const hex = s.match(/^#[0-9a-f]{3,8}$/i);
  return hex ? hex[0] : s;
}

function borderParts(border = '') {
  const match = String(border).match(/([\d.]+)px\s+(solid|dashed|dotted|double)\s+([^\s]+)$/i);
  return match ? { width: match[1], style: match[2], color: match[3] } : null;
}

function styleFromNode(node) {
  const base = node.style?.base || {};
  const preserved = parseDrawioStyle(node.meta?.drawio?.rawStyle || '');
  const style = { ...preserved, html: preserved.html || '1', whiteSpace: preserved.whiteSpace || 'wrap' };
  if (node.type === 'text' || node.type === 'heading' || node.type === 'label') Object.assign(style, { text: '1', strokeColor: 'none', fillColor: 'none', align: base.textAlign || style.align || 'left', verticalAlign: 'middle' });
  if (node.type === 'image') { style.shape = 'image'; style.image = node.props?.src || style.image || ''; style.strokeColor = style.strokeColor || 'none'; style.fillColor = style.fillColor || 'none'; }
  if (node.type === 'group') style.group = '1';
  if (node.type === 'section') style.swimlane = '1';
  if (String(base.borderRadius || '').includes('50%')) { style.ellipse = '1'; style.shape = 'ellipse'; delete style.rounded; }
  else if (px(base.borderRadius, 0) > 0) style.rounded = '1';
  if (base.background || base.backgroundColor) style.fillColor = cssColor(base.backgroundColor || base.background);
  const border = borderParts(base.border);
  if (border) { style.strokeColor = cssColor(border.color); style.strokeWidth = border.width; style.dashed = border.style === 'dashed' || border.style === 'dotted' ? '1' : '0'; }
  else if (base.border === 'none') style.strokeColor = 'none';
  if (base.color) style.fontColor = cssColor(base.color);
  if (base.fontSize) style.fontSize = String(px(base.fontSize, 12));
  let fontStyle = 0;
  if (parseInt(base.fontWeight || '0', 10) >= 600 || String(base.fontWeight).toLowerCase() === 'bold') fontStyle |= 1;
  if (base.fontStyle === 'italic') fontStyle |= 2;
  if (String(base.textDecoration || '').includes('underline')) fontStyle |= 4;
  if (fontStyle) style.fontStyle = String(fontStyle); else delete style.fontStyle;
  if (base.textAlign) style.align = base.textAlign;
  if (base.opacity !== undefined && base.opacity !== '') style.opacity = String(Math.round(clamp(Number(base.opacity) || 0, 0, 1) * 100));
  if (base.rotate) style.rotation = String(px(base.rotate, 0));
  if (base.boxShadow && base.boxShadow !== 'none') style.shadow = '1';
  return style;
}

function syntheticLabel(node) {
  return (node.children || []).find(c => c.meta?.drawioSyntheticLabel);
}

function labelFromNode(node) {
  const synthetic = syntheticLabel(node);
  if (synthetic) return String(synthetic.props?.text || '');
  if (['heading', 'text', 'button', 'link', 'badge', 'label', 'icon'].includes(node.type)) return String(node.props?.text || '');
  if (node.type === 'image') return String(node.props?.alt || '');
  return String(node.meta?.drawio?.value || '');
}

function geometryFromNode(node, index = 0) {
  const base = node.style?.base || {};
  const explicitX = /(?:^|\s)absolute|fixed/.test(String(base.position || '')) || base.left !== undefined;
  const explicitY = /(?:^|\s)absolute|fixed/.test(String(base.position || '')) || base.top !== undefined;
  const width = Math.max(20, px(base.width, node.type === 'text' ? 180 : 180));
  const height = Math.max(20, px(base.height, node.type === 'text' ? 40 : 80));
  return {
    x: explicitX ? px(base.left, 0) : 40,
    y: explicitY ? px(base.top, 0) : 40 + index * (height + 24),
    width, height,
  };
}

function uniqueCellId(node, used) {
  let id = String(node.meta?.drawio?.cellId || `aui_${node.id}`).replace(/[\s"'<>]+/g, '_');
  if (!id || id === '0' || id === '1') id = `aui_${node.id}`;
  const base = id;
  let suffix = 2;
  while (used.has(id)) id = `${base}_${suffix++}`;
  used.add(id);
  return id;
}

function graphGeometryXml(g, relative = false, points = []) {
  const attrs = relative ? ` relative="1" as="geometry"` : ` x="${Math.round(g.x)}" y="${Math.round(g.y)}" width="${Math.round(g.width)}" height="${Math.round(g.height)}" as="geometry"`;
  if (!points?.length) return `<mxGeometry${attrs}/>`;
  return `<mxGeometry${attrs}>${points.map(p => `<mxPoint x="${Math.round(p.x)}" y="${Math.round(p.y)}"${p.as ? ` as="${xmlEscape(p.as)}"` : ''}/>`).join('')}</mxGeometry>`;
}

function pageNodes(page) {
  const rootChildren = page.root?.children || [];
  if (rootChildren.length === 1 && rootChildren[0].meta?.drawioCanvas) return rootChildren[0].children || [];
  return rootChildren;
}

function exportPageXml(project, page, pageIndex, options = {}) {
  const used = new Set(['0', '1']);
  const nodeToCell = new Map();
  const cellLines = ['<mxCell id="0"/>', '<mxCell id="1" parent="0"/>'];

  function visit(node, parentCell = '1', index = 0) {
    if (node.meta?.drawioSyntheticLabel) return;
    if (node.meta?.drawioCanvas) {
      (node.children || []).forEach((child, i) => visit(child, parentCell, i));
      return;
    }
    const id = uniqueCellId(node, used);
    nodeToCell.set(node.id, id);
    const label = labelFromNode(node);
    const rawValue = node.meta?.drawio?.rawValue;
    const value = rawValue && stripHtml(rawValue) === label ? rawValue : label;
    const style = serializeDrawioStyle(styleFromNode(node));
    const g = geometryFromNode(node, index);
    cellLines.push(`<mxCell id="${xmlEscape(id)}" value="${xmlEscape(value)}" style="${xmlEscape(style)}" vertex="1" parent="${xmlEscape(parentCell)}">${graphGeometryXml(g, false)}</mxCell>`);
    let childIndex = 0;
    for (const child of node.children || []) {
      if (child.meta?.drawioSyntheticLabel) continue;
      visit(child, id, childIndex++);
    }
  }
  pageNodes(page).forEach((node, i) => visit(node, '1', i));

  const preservedEdges = project.design?.interchange?.drawio?.edges?.filter(e => e.pageId === page.id) || [];
  for (const edge of preservedEdges) {
    const source = nodeToCell.get(edge.sourceNodeId) || edge.sourceCellId || '';
    const target = nodeToCell.get(edge.targetNodeId) || edge.targetCellId || '';
    if (!source && !target) continue;
    const id = used.has(edge.cellId) ? uniqueCellId({ id: edge.id, meta: {} }, used) : String(edge.cellId || uniqueCellId({ id: edge.id, meta: {} }, used));
    used.add(id);
    const style = edge.style || 'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endFill=1;';
    const sourceAttr = source ? ` source="${xmlEscape(source)}"` : '';
    const targetAttr = target ? ` target="${xmlEscape(target)}"` : '';
    cellLines.push(`<mxCell id="${xmlEscape(id)}" value="${xmlEscape(edge.rawValue || edge.value || '')}" style="${xmlEscape(style)}" edge="1" parent="1"${sourceAttr}${targetAttr}>${graphGeometryXml({ x: 0, y: 0, width: 0, height: 0 }, true, edge.geometry?.points || [])}</mxCell>`);
  }

  if (options.includePrototypeInteractions) {
    const nodesById = new Map();
    const collect = n => { nodesById.set(n.id, n); for (const c of n.children || []) collect(c); };
    for (const n of pageNodes(page)) collect(n);
    for (const node of nodesById.values()) {
      const source = nodeToCell.get(node.id);
      for (const interaction of node.design?.interactions || []) {
        const target = nodeToCell.get(interaction.destination);
        if (!source || !target) continue;
        const id = uniqueCellId({ id: makeId('edge'), meta: {} }, used);
        const value = interaction.action || 'interaction';
        cellLines.push(`<mxCell id="${xmlEscape(id)}" value="${xmlEscape(value)}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endFill=1;" edge="1" parent="1" source="${xmlEscape(source)}" target="${xmlEscape(target)}"><mxGeometry relative="1" as="geometry"/></mxCell>`);
      }
    }
  }

  const canvas = page.root?.children?.find(n => n.meta?.drawioCanvas);
  const pageWidth = Math.max(850, px(canvas?.style?.base?.width, 1280));
  const pageHeight = Math.max(600, px(canvas?.style?.base?.minHeight || canvas?.style?.base?.height, 720));
  const metadata = project.design?.interchange?.drawio?.pages?.find(p => p.pageId === page.id);
  const model = metadata?.model || {};
  const graph = `<mxGraphModel dx="${xmlEscape(model.dx || '1422')}" dy="${xmlEscape(model.dy || '794')}" grid="${xmlEscape(model.grid || '1')}" gridSize="${xmlEscape(model.gridSize || '10')}" guides="${xmlEscape(model.guides || '1')}" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${Math.round(pageWidth)}" pageHeight="${Math.round(pageHeight)}" math="0" shadow="0"><root>${cellLines.join('')}</root></mxGraphModel>`;
  return { id: metadata?.diagramId || `aui-page-${pageIndex + 1}`, name: page.name || `Page ${pageIndex + 1}`, graph };
}

export function exportDrawio(project, options = {}) {
  const pages = (project.pages || []).map((page, i) => exportPageXml(project, page, i, options));
  if (!pages.length) throw new Error('The project has no pages to export.');
  const modified = options.modified || new Date().toISOString();
  const diagrams = pages.map(p => `<diagram id="${xmlEscape(p.id)}" name="${xmlEscape(p.name)}">${p.graph}</diagram>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<mxfile host="app.diagrams.net" modified="${xmlEscape(modified)}" agent="Astro UI Designer 2.20.0" compressed="false">${diagrams}</mxfile>\n`;
}
