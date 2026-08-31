import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createNode, createProject, findProjectNode, removeNode, insertNode, migrateProject, routeToFilename, makeId, walk, deepClone } from '../../../standalone/js/model.js';
import { COMPONENTS } from '../../../standalone/js/registry.js';
import { validateProject } from '../../../standalone/js/validator.js';
import { generateAstroProject } from '../../../standalone/js/astro-exporter.js';
import { accessibilityAudit, contrastAudit, performanceAudit, responsiveAudit, seoAudit, ensureResearchModel } from '../../../standalone/js/research-features.js';
import { ensureStorybookProject, createComponentStory } from '../../../standalone/js/storybook-cleanroom.js';
import { ensureCompositionModel, addQuery, findUsages, instantiateTemplate } from '../../../standalone/js/plasmic-cleanroom.js';
import { ensureDesignProject } from '../../../standalone/js/penpot-cleanroom.js';
import { applyAnimationPreset, createAnimationTrack, ensureAnimation } from '../../../standalone/js/animation.js';
import { PLATFORM_ADAPTERS, listPlatformAdapters } from '../../../standalone/js/platform-io.js';

const enc = new TextEncoder();

export class ProjectService {
  constructor({ projectPath, readOnly = false } = {}) {
    this.projectPath = resolveProjectPath(projectPath);
    this.workspaceRoot = path.dirname(this.projectPath);
    this.readOnly = Boolean(readOnly);
  }

  load() {
    if (!fs.existsSync(this.projectPath)) throw new Error(`Designer project not found: ${this.projectPath}`);
    const raw = fs.readFileSync(this.projectPath, 'utf8');
    const project = migrateProject(JSON.parse(raw));
    ensureResearchModel(project);
    ensureStorybookProject(project);
    ensureCompositionModel(project);
    ensureDesignProject(project);
    return { project, revision: revisionOf(raw) };
  }

  save(project, expectedRevision = '') {
    if (this.readOnly) throw new Error('MCP server is running in read-only mode.');
    const current = fs.existsSync(this.projectPath) ? fs.readFileSync(this.projectPath, 'utf8') : '';
    if (expectedRevision && revisionOf(current) !== expectedRevision) {
      const err = new Error('Project changed since the last read. Reload project state before mutating.');
      err.code = 'REVISION_CONFLICT';
      throw err;
    }
    const text = JSON.stringify(project, null, 2) + '\n';
    const tmp = `${this.projectPath}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, text, 'utf8');
    fs.renameSync(tmp, this.projectPath);
    return revisionOf(text);
  }

  mutate(fn, expectedRevision = '') {
    const { project, revision } = this.load();
    if (expectedRevision && expectedRevision !== revision) {
      const err = new Error('Project changed since the last read. Reload project state before mutating.');
      err.code = 'REVISION_CONFLICT';
      throw err;
    }
    const result = fn(project);
    const newRevision = this.save(project, revision);
    return { result, revision: newRevision };
  }

  summary() {
    const { project, revision } = this.load();
    let nodes = 0, actions = 0, animations = 0;
    for (const owner of [...(project.pages || []), ...(project.components || [])]) {
      walk(owner.root, n => { nodes++; actions += (n.actions || []).length; if ((n.timeline?.tracks || []).length) animations++; });
    }
    return {
      name: project.name,
      schemaVersion: project.schemaVersion,
      projectPath: this.projectPath,
      workspaceRoot: this.workspaceRoot,
      readOnly: this.readOnly,
      revision,
      counts: {
        pages: project.pages?.length || 0,
        components: project.components?.length || 0,
        nodes,
        assets: project.assets?.length || 0,
        variables: project.variables?.length || 0,
        queries: project.composition?.queries?.length || 0,
        stories: (project.components || []).reduce((n, c) => n + (c.stories?.length || 0), 0),
        actions,
        animatedNodes: animations,
      },
      settings: { output: project.settings?.output, site: project.settings?.site, base: project.settings?.base },
    };
  }

  listPages() {
    const { project, revision } = this.load();
    return { revision, pages: (project.pages || []).map(p => ({ id: p.id, name: p.name, route: p.route, filename: p.filename, rootId: p.root?.id, seo: p.seo })) };
  }

  listComponents() {
    const { project, revision } = this.load();
    return { revision, components: (project.components || []).map(c => ({ id: c.id, name: c.name, filename: c.filename, rootId: c.root?.id, props: c.props || [], slots: c.slots || [], storyCount: c.stories?.length || 0 })) };
  }

  componentRegistry() {
    return Object.entries(COMPONENTS).map(([type, spec]) => ({
      type,
      label: spec.label,
      category: spec.category,
      acceptsChildren: Boolean(spec.acceptsChildren),
      defaultProps: deepClone(spec.defaultProps || {}),
      defaultStyle: deepClone(spec.defaultStyle || {}),
    }));
  }

  getNode(nodeId) {
    const { project, revision } = this.load();
    const found = findProjectNode(project, nodeId);
    if (!found) throw new Error(`Node not found: ${nodeId}`);
    return { revision, scope: found.kind, owner: { id: found.owner.id, name: found.owner.name }, node: found.node };
  }

  search(query, limit = 50) {
    const { project, revision } = this.load();
    const q = String(query || '').trim().toLowerCase();
    if (!q) return { revision, results: [] };
    const results = [];
    const scan = (owner, kind) => walk(owner.root, node => {
      if (results.length >= limit) return;
      const hay = [node.id, node.name, node.type, JSON.stringify(node.props || {}), node.meta?.domId, node.meta?.className].join(' ').toLowerCase();
      if (hay.includes(q)) results.push({ kind, ownerId: owner.id, ownerName: owner.name, nodeId: node.id, name: node.name, type: node.type, text: node.props?.text || '' });
    });
    for (const p of project.pages || []) scan(p, 'page');
    for (const c of project.components || []) scan(c, 'component');
    return { revision, results };
  }

  validate() {
    const { project, revision } = this.load();
    const issues = validateProject(project);
    return { revision, issueCount: issues.length, errors: issues.filter(x => x.severity === 'error').length, warnings: issues.filter(x => x.severity === 'warning').length, issues };
  }

  audit(kinds = ['accessibility','contrast','responsive','seo','performance']) {
    const { project, revision } = this.load();
    const requested = new Set(Array.isArray(kinds) && kinds.length ? kinds : ['accessibility','contrast','responsive','seo','performance']);
    const reports = {};
    if (requested.has('accessibility')) reports.accessibility = accessibilityAudit(project);
    if (requested.has('contrast')) reports.contrast = contrastAudit(project);
    if (requested.has('responsive')) reports.responsive = responsiveAudit(project);
    if (requested.has('seo')) reports.seo = seoAudit(project);
    if (requested.has('performance')) reports.performance = performanceAudit(project);
    const issues = Object.values(reports).flat();
    return { revision, issueCount: issues.length, reports };
  }

  usage(ref) {
    const { project, revision } = this.load();
    return { revision, usages: findUsages(project, ref) };
  }

  createPage(args) {
    return this.mutate(project => {
      const route = normalizeRoute(args.route || `/${slug(args.name || 'page')}`);
      if ((project.pages || []).some(p => p.route === route)) throw new Error(`Route already exists: ${route}`);
      const root = createNode('page', { name: `${args.name || 'Page'}Page`, props: { title: args.title || args.name || 'Page', description: args.description || '' } });
      const page = { id: makeId('page-doc'), route, filename: routeToFilename(route), name: args.name || 'Page', seo: { title: args.title || args.name || 'Page', description: args.description || '', canonical: '', ogImage: '' }, root };
      project.pages.push(page);
      return { id: page.id, route: page.route, filename: page.filename, rootId: root.id };
    }, args.expectedRevision);
  }

  addNode(args) {
    return this.mutate(project => {
      if (!COMPONENTS[args.type]) throw new Error(`Unknown component type: ${args.type}`);
      const parent = findProjectNode(project, args.parentId);
      if (!parent) throw new Error(`Parent node not found: ${args.parentId}`);
      const node = createNode(args.type, { name: args.name, props: args.props || {}, style: args.style || {}, meta: args.meta || {} });
      insertNode(parent.root, args.parentId, node, Number.isInteger(args.index) ? args.index : null);
      return { nodeId: node.id, name: node.name, type: node.type, parentId: args.parentId };
    }, args.expectedRevision);
  }

  updateNode(args) {
    return this.mutate(project => {
      const found = findProjectNode(project, args.nodeId);
      if (!found) throw new Error(`Node not found: ${args.nodeId}`);
      const node = found.node;
      const patch = args.patch || {};
      if (patch.name != null) node.name = String(patch.name);
      if (patch.props) node.props = { ...(node.props || {}), ...deepClone(patch.props) };
      if (patch.meta) node.meta = { ...(node.meta || {}), ...deepClone(patch.meta), id: node.meta?.id };
      if (patch.style) for (const [bp, st] of Object.entries(patch.style)) node.style[bp] = { ...(node.style[bp] || {}), ...deepClone(st) };
      if (patch.cssStates) { node.cssStates ||= {hover:{},focus:{},focusVisible:{},active:{},disabled:{}}; for (const [pseudo, st] of Object.entries(patch.cssStates)) node.cssStates[pseudo] = { ...(node.cssStates[pseudo] || {}), ...deepClone(st) }; }
      if (patch.cssVariables) node.cssVariables = { ...(node.cssVariables || {}), ...deepClone(patch.cssVariables) };
      if (patch.design) { const d=deepClone(patch.design); node.design = { ...(node.design || {}), ...d, manualLayout: { ...(node.design?.manualLayout || {}), ...(d.manualLayout || {}) }, constraints: { ...(node.design?.constraints || {}), ...(d.constraints || {}) } }; }
      if (patch.variant != null) node.variant = String(patch.variant);
      if (patch.componentState != null) node.componentState = String(patch.componentState);
      if (patch.visibilityCondition != null) node.visibilityCondition = String(patch.visibilityCondition);
      return { nodeId: node.id, name: node.name, type: node.type };
    }, args.expectedRevision);
  }

  deleteNode(args) {
    return this.mutate(project => {
      const found = findProjectNode(project, args.nodeId);
      if (!found) throw new Error(`Node not found: ${args.nodeId}`);
      if (found.owner.root?.id === args.nodeId) throw new Error('Cannot delete a page/component root node.');
      const removed = removeNode(found.root, args.nodeId);
      if (!removed) throw new Error(`Unable to delete node: ${args.nodeId}`);
      return { nodeId: args.nodeId, name: removed.name, type: removed.type };
    }, args.expectedRevision);
  }

  addAction(args) {
    return this.mutate(project => {
      const found = findProjectNode(project, args.nodeId);
      if (!found) throw new Error(`Node not found: ${args.nodeId}`);
      const action = { id: makeId('act'), event: args.event || 'click', type: args.type || 'navigate', target: args.target || '', value: args.value ?? '', condition: args.condition || '' };
      found.node.actions ??= [];
      found.node.actions.push(action);
      return action;
    }, args.expectedRevision);
  }

  addAnimation(args) {
    return this.mutate(project => {
      const found = findProjectNode(project, args.nodeId);
      if (!found) throw new Error(`Node not found: ${args.nodeId}`);
      const node = found.node;
      let ok = false;
      if (args.preset) ok = applyAnimationPreset(node, args.preset);
      if (!ok) {
        const tr = createAnimationTrack(node, args.property || 'opacity');
        if (args.from != null) tr.keyframes[0].value = String(args.from);
        if (args.to != null) tr.keyframes[tr.keyframes.length - 1].value = String(args.to);
      }
      const a = ensureAnimation(node);
      if (args.duration != null) a.duration = Math.max(1, Number(args.duration) || 500);
      if (args.engine) a.engine = args.engine;
      if (args.trigger) a.trigger = args.trigger;
      return { nodeId: node.id, timeline: a };
    }, args.expectedRevision);
  }

  addStory(args) {
    return this.mutate(project => {
      const component = (project.components || []).find(c => c.id === args.componentId);
      if (!component) throw new Error(`Component not found: ${args.componentId}`);
      const story = createComponentStory(component, args.name || 'Default', project);
      if (args.args && typeof args.args === 'object') story.args = { ...(story.args || {}), ...deepClone(args.args) };
      return { id: story.id, name: story.name, componentId: component.id, args: story.args };
    }, args.expectedRevision);
  }

  createQuery(args) {
    return this.mutate(project => {
      const q = addQuery(project, args.name || 'query', args.kind || 'static');
      const allowed = ['url','method','headers','body','collection','expression','mockData','variables'];
      for (const key of allowed) if (args[key] !== undefined) q[key] = deepClone(args[key]);
      return q;
    }, args.expectedRevision);
  }

  applyTemplate(args) {
    return this.mutate(project => {
      const template = (project.composition?.templates || []).find(t => t.id === args.templateId);
      if (!template) throw new Error(`Template not found: ${args.templateId}`);
      const parent = findProjectNode(project, args.parentId);
      if (!parent) throw new Error(`Parent node not found: ${args.parentId}`);
      const node = instantiateTemplate(template);
      insertNode(parent.root, args.parentId, node, Number.isInteger(args.index) ? args.index : null);
      return { nodeId: node.id, name: node.name, type: node.type, templateId: template.id };
    }, args.expectedRevision);
  }

  exportProject({ target = 'astro', outputDir = 'hermes-export' } = {}) {
    const { project, revision } = this.load();
    const base = safeOutputDir(this.workspaceRoot, outputDir);
    fs.mkdirSync(base, { recursive: true });
    const written = [];
    if (target === 'astro') {
      const files = generateAstroProject(project);
      for (const [name, content] of Object.entries(files)) {
        const out = safeChild(base, name);
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.writeFileSync(out, toBuffer(content));
        written.push(path.relative(this.workspaceRoot, out));
      }
    } else {
      const adapter = PLATFORM_ADAPTERS[target];
      if (!adapter?.canExport) throw new Error(`Unsupported export target: ${target}`);
      if (adapter.exportFiles) {
        const files = adapter.exportFiles(project);
        for (const [name, content] of Object.entries(files)) {
          const out = safeChild(base, name);
          fs.mkdirSync(path.dirname(out), { recursive: true });
          fs.writeFileSync(out, toBuffer(content));
          written.push(path.relative(this.workspaceRoot, out));
        }
      } else if (adapter.exportText) {
        const ext = adapter.extensions?.[0] || '.txt';
        const out = safeChild(base, `${slug(project.name)}${ext}`);
        fs.writeFileSync(out, String(adapter.exportText(project)), 'utf8');
        written.push(path.relative(this.workspaceRoot, out));
      } else if (adapter.exportProject) {
        const ext = adapter.extensions?.[0] || '.bin';
        const out = safeChild(base, `${slug(project.name)}${ext}`);
        fs.writeFileSync(out, toBuffer(adapter.exportProject(project)));
        written.push(path.relative(this.workspaceRoot, out));
      } else throw new Error(`Export adapter is not callable: ${target}`);
    }
    return { revision, target, outputDir: path.relative(this.workspaceRoot, base) || '.', files: written };
  }

  generatedSource(file = '') {
    const { project, revision } = this.load();
    const files = generateAstroProject(project);
    const names = Object.keys(files).sort();
    const selected = file || names.find(n => n.startsWith('src/pages/')) || names[0];
    if (!selected || !(selected in files)) throw new Error(`Generated file not found: ${selected}`);
    const value = files[selected];
    return { revision, file: selected, files: names, content: typeof value === 'string' ? value : `[binary ${value?.byteLength ?? value?.length ?? 0} bytes]` };
  }
}

function resolveProjectPath(input) {
  const candidate = input || process.env.AUI_PROJECT || path.join(process.cwd(), 'designer-project.json');
  const resolved = path.resolve(candidate);
  if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) return path.join(resolved, 'designer-project.json');
  return resolved;
}
function revisionOf(text) { return crypto.createHash('sha256').update(String(text)).digest('hex').slice(0, 16); }
function normalizeRoute(route) { const r = `/${String(route || '').trim().replace(/^\/+|\/+$/g, '')}`; return r === '/' ? '/' : r; }
function slug(value) { return String(value || 'project').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'project'; }
function safeOutputDir(root, rel) {
  const value = String(rel || 'hermes-export');
  if (path.isAbsolute(value)) throw new Error('outputDir must be relative to the designer workspace.');
  return safeChild(root, value);
}
function safeChild(root, rel) {
  const base = path.resolve(root);
  const out = path.resolve(base, rel);
  if (out !== base && !out.startsWith(base + path.sep)) throw new Error(`Path escapes workspace: ${rel}`);
  return out;
}
function toBuffer(value) {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  if (value instanceof ArrayBuffer) return Buffer.from(value);
  return Buffer.from(String(value));
}

export function resolveProjectArg(argv = process.argv.slice(2)) {
  let projectPath = '', readOnly = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--project') projectPath = argv[++i] || '';
    else if (argv[i] === '--read-only') readOnly = true;
  }
  return { projectPath, readOnly };
}
