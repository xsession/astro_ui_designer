'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const IGNORE = new Set(['node_modules', '.git', 'dist', '.astro', '.vercel', '.netlify', '.turbo', 'coverage']);
const SOURCE_RE = /\.(astro|tsx?|jsx?|mjs|cjs|svelte|vue|json|mdx?|css)$/i;
const COMPONENT_RE = /\.(astro|tsx?|jsx?|vue|svelte)$/i;

function safeRoot(value) {
  const root = path.resolve(String(value || ''));
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) throw new Error('Workspace directory does not exist');
  return root;
}

function safeJoin(root, relativePath) {
  const base = safeRoot(root);
  const target = path.resolve(base, String(relativePath || ''));
  if (target !== base && !target.startsWith(base + path.sep)) throw new Error('Path escapes workspace');
  return target;
}

function walkFiles(root, dir = root, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE.has(entry.name)) continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(root, absolute, out);
    else if (entry.isFile() && SOURCE_RE.test(entry.name)) out.push(path.relative(root, absolute).split(path.sep).join('/'));
  }
  return out;
}

function parseTypedProps(body = '') {
  const out = [];
  const re = /([A-Za-z_$][\w$]*)\s*(\?)?\s*:\s*([^;\n}]+)/g;
  let match;
  while ((match = re.exec(body))) {
    const rawType = match[3].trim();
    const options = [...rawType.matchAll(/["']([^"']+)["']/g)].map((m) => m[1]);
    out.push({
      name: match[1],
      optional: Boolean(match[2]),
      type: /\bboolean\b/.test(rawType) ? 'boolean' : /\bnumber\b/.test(rawType) ? 'number' : options.length ? 'enum' : 'string',
      options,
      rawType,
    });
  }
  return out;
}

function inferProps(source) {
  const m = source.match(/interface\s+Props\s*\{([\s\S]*?)\}/m) || source.match(/type\s+Props\s*=\s*\{([\s\S]*?)\}/m);
  return m ? parseTypedProps(m[1]) : [];
}

function componentName(relativePath) {
  return (path.basename(relativePath).replace(/\.(astro|tsx?|jsx?|vue|svelte)$/i, '') || 'Component').replace(/[^A-Za-z0-9_$]/g, '_');
}

function scanFrameworkComponent(relativePath, source) {
  const ext = path.extname(relativePath).toLowerCase();
  const name = componentName(relativePath);
  if (ext === '.astro') return null;
  if (['.tsx', '.ts', '.jsx', '.js'].includes(ext)) {
    let props = inferProps(source);
    if (!props.length) {
      const m = source.match(/(?:function|const)\s+[A-Za-z_$][\w$]*\s*(?:=\s*)?\(?\s*\{[^}]*\}\s*:\s*\{([\s\S]*?)\}/m);
      if (m) props = parseTypedProps(m[1]);
    }
    return { relativePath, kind: 'component', framework: 'react', name, symbol: name, props, slots: props.some((p) => p.name === 'children') ? ['default'] : [], uiIds: [...source.matchAll(/data-ui-id=["']([^"']+)["']/g)].map((m) => m[1]) };
  }
  if (ext === '.vue') {
    let props = [];
    const generic = source.match(/defineProps\s*<\s*\{([\s\S]*?)\}\s*>/m);
    if (generic) props = parseTypedProps(generic[1]);
    else {
      const obj = source.match(/defineProps\s*\(\s*\{([\s\S]*?)\}\s*\)/m);
      if (obj) props = [...obj[1].matchAll(/([A-Za-z_$][\w$]*)\s*:/g)].map((m) => ({ name: m[1], optional: true, type: 'string', options: [], rawType: 'unknown' }));
    }
    const slots = [...source.matchAll(/<slot(?:\s+name=["']([^"']+)["'])?[^>]*>/g)].map((m) => m[1] || 'default');
    return { relativePath, kind: 'component', framework: 'vue', name, symbol: name, props, slots: [...new Set(slots)], uiIds: [] };
  }
  if (ext === '.svelte') {
    const props = [];
    for (const m of source.matchAll(/export\s+let\s+([A-Za-z_$][\w$]*)(?:\s*:\s*([^=;\n]+))?/g)) {
      const rawType = (m[2] || 'string').trim();
      props.push({ name: m[1], optional: true, type: /boolean/.test(rawType) ? 'boolean' : /number/.test(rawType) ? 'number' : 'string', options: [], rawType });
    }
    return { relativePath, kind: 'component', framework: 'svelte', name, symbol: name, props, slots: /<slot(?:\s|>)/.test(source) ? ['default'] : [], uiIds: [] };
  }
  return null;
}

function readJson(root, rel) {
  try { return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8')); } catch { return null; }
}

function isGit(root) {
  if (fs.existsSync(path.join(root, '.git'))) return true;
  return cp.spawnSync('git', ['-C', root, 'rev-parse', '--is-inside-work-tree'], { encoding: 'utf8' }).status === 0;
}

function scanWorkspace(rootValue) {
  const root = safeRoot(rootValue);
  const files = walkFiles(root);
  const astro = [];
  const components = [];
  for (const relativePath of files) {
    if (!COMPONENT_RE.test(relativePath)) continue;
    const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
    if (relativePath.endsWith('.astro')) {
      const item = {
        relativePath,
        kind: relativePath.startsWith('src/pages/') ? 'page' : 'component',
        framework: 'astro',
        name: componentName(relativePath),
        symbol: componentName(relativePath),
        props: inferProps(source),
        slots: [...new Set([...source.matchAll(/<slot(?:\s+name=["']([^"']+)["'])?\s*\/?\s*>/g)].map((m) => m[1] || 'default'))],
        uiIds: [...source.matchAll(/data-ui-id=["']([^"']+)["']/g)].map((m) => m[1]),
        astAvailable: false,
      };
      astro.push(item);
      if (item.kind === 'component') components.push(item);
    } else if (!relativePath.startsWith('src/pages/')) {
      const item = scanFrameworkComponent(relativePath, source);
      if (item) components.push(item);
    }
  }
  return {
    rootPath: root,
    files,
    astro,
    components,
    packageJson: readJson(root, 'package.json'),
    astroConfig: files.find((f) => /^astro\.config\./.test(f)) || '',
    git: isGit(root),
    scannedAt: new Date().toISOString(),
  };
}

function git(root, args) {
  const result = cp.spawnSync('git', ['-C', safeRoot(root), ...args], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error((result.stderr || result.stdout || 'git command failed').trim());
  return result.stdout;
}

function readFile(root, relativePath) { return fs.readFileSync(safeJoin(root, relativePath), 'utf8'); }
function writeFile(root, relativePath, content) {
  const target = safeJoin(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, String(content), 'utf8');
  return { relativePath, bytes: Buffer.byteLength(String(content)) };
}

function findDesignerProject(root) {
  for (const candidate of ['designer-project.json', '.astro-ui/designer-project.json']) {
    const file = path.join(root, candidate);
    if (fs.existsSync(file)) return file;
  }
  return null;
}

function isAstroWorkspace(root) {
  const pkg = readJson(root, 'package.json');
  if (pkg?.dependencies?.astro || pkg?.devDependencies?.astro) return true;
  return fs.readdirSync(root).some((name) => /^astro\.config\./.test(name));
}

module.exports = { safeRoot, safeJoin, scanWorkspace, git, readFile, writeFile, readJson, findDesignerProject, isAstroWorkspace, inferProps, parseTypedProps };
