import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class DesignerBrowser {
  constructor(rootDir = path.resolve('.')) {
    this.rootDir = rootDir;
    this.port = 9400 + Math.floor(Math.random() * 300);
    this.profile = `/tmp/astro-ui-designer-cdp-${process.pid}-${Date.now()}`;
    this.chrome = null;
    this.ws = null;
    this.seq = 0;
    this.pending = new Map();
    this.events = [];
  }

  async start({ width = 1600, height = 900 } = {}) {
    fs.rmSync(this.profile, { recursive: true, force: true });
    this.chrome = spawn('chromium', [
      '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--hide-scrollbars',
      `--user-data-dir=${this.profile}`, `--remote-debugging-port=${this.port}`, 'about:blank',
    ], { stdio: 'ignore' });

    let pages = null;
    for (let i = 0; i < 60; i++) {
      try {
        const response = await fetch(`http://127.0.0.1:${this.port}/json/list`);
        pages = await response.json();
        if (pages?.length) break;
      } catch {}
      await sleep(100);
    }
    if (!pages?.length) throw new Error('Chromium DevTools endpoint did not start');

    this.ws = new WebSocket(pages[0].webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('CDP WebSocket timeout')), 5000);
      this.ws.onopen = () => { clearTimeout(timer); resolve(); };
    });
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        this.pending.get(message.id)(message);
        this.pending.delete(message.id);
      } else {
        this.events.push(message);
        if (message.method === 'Page.javascriptDialogOpening') {
          this.command('Page.handleJavaScriptDialog', { accept: true }).catch(() => {});
        }
      }
    };

    await this.command('Page.enable');
    await this.command('Runtime.enable');
    await this.command('Log.enable');
    await this.command('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    await this.loadDesigner();
    return this;
  }

  command(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.seq;
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP command timeout: ${method}`));
      }, 10000);
      this.pending.set(id, (message) => {
        clearTimeout(timer);
        if (message.error) reject(new Error(`${method}: ${message.error.message}`));
        else resolve(message);
      });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression, { awaitPromise = false } = {}) {
    const response = await this.command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise });
    if (response.result.exceptionDetails) {
      const d = response.result.exceptionDetails;
      throw new Error(`${d.text}: ${d.exception?.description || d.exception?.value || ''}`);
    }
    return response.result.result.value;
  }

  source(rel) { return fs.readFileSync(path.join(this.rootDir, rel), 'utf8'); }

  async blobModule(source) {
    const b64 = Buffer.from(source, 'utf8').toString('base64');
    return this.evaluate(`URL.createObjectURL(new Blob([Uint8Array.from(atob(${JSON.stringify(b64)}),c=>c.charCodeAt(0))],{type:'text/javascript'}))`);
  }

  async loadDesigner() {
    const rawHtml = this.source('standalone/index.html').replace(/<script type="module"[\s\S]*?<\/script>/, '');
    const css = this.source('standalone/styles.css');
    const html = rawHtml.replace('<link rel="stylesheet" href="./styles.css" />', `<style>${css}</style>`);
    const tree = await this.command('Page.getFrameTree');
    await this.command('Page.setDocumentContent', { frameId: tree.result.frameTree.frame.id, html });
    await sleep(50);

    const registry = await this.blobModule(this.source('standalone/js/registry.js'));
    const model = await this.blobModule(this.source('standalone/js/model.js').replace("'./registry.js'", JSON.stringify(registry)));
    const zip = await this.blobModule(this.source('standalone/js/zip.js'));
    const penpotCleanroom = await this.blobModule(this.source('standalone/js/penpot-cleanroom.js').replace("'./model.js'", JSON.stringify(model)));
    const platformIo = await this.blobModule(
      this.source('standalone/js/platform-io.js')
        .replace("'./model.js'", JSON.stringify(model))
        .replace("'./zip.js'", JSON.stringify(zip))
        .replace("'./penpot-cleanroom.js'", JSON.stringify(penpotCleanroom)),
    );
    const animation = await this.blobModule(this.source('standalone/js/animation.js').replace("'./model.js'", JSON.stringify(model)));
    const pluginApi = await this.blobModule(this.source('standalone/js/plugin-api.js').replace("'./registry.js'", JSON.stringify(registry)));
    const research = await this.blobModule(
      this.source('standalone/js/research-features.js').replace("'./model.js'", JSON.stringify(model)),
    );
    const example = await this.blobModule(this.source('standalone/plugins/example-callout.js').replace("'../js/plugin-api.js'", JSON.stringify(pluginApi)));
    const researchPlugin = await this.blobModule(
      this.source('standalone/plugins/research-integrations.js')
        .replace("'../js/plugin-api.js'", JSON.stringify(pluginApi))
        .replace("'../js/research-features.js'", JSON.stringify(research)),
    );
    const bootstrap = await this.blobModule(
      this.source('standalone/plugins/bootstrap.js')
        .replace("'./example-callout.js'", JSON.stringify(example))
        .replace("'./research-integrations.js'", JSON.stringify(researchPlugin)),
    );
    const workspaceClient = await this.blobModule(this.source('standalone/js/workspace-client.js'));
    const storybookCleanroom = await this.blobModule(this.source('standalone/js/storybook-cleanroom.js').replace("'./model.js'", JSON.stringify(model)));
    const plasmicCleanroom = await this.blobModule(this.source('standalone/js/plasmic-cleanroom.js').replace("'./model.js'", JSON.stringify(model)));
    const astro = await this.blobModule(
      this.source('standalone/js/astro-exporter.js')
        .replace("'./registry.js'", JSON.stringify(registry))
        .replace("'./model.js'", JSON.stringify(model))
        .replace("'./plugin-api.js'", JSON.stringify(pluginApi))
        .replace("'./animation.js'", JSON.stringify(animation))
        .replace("'./storybook-cleanroom.js'", JSON.stringify(storybookCleanroom))
        .replace("'./plasmic-cleanroom.js'", JSON.stringify(plasmicCleanroom)),
    );
    const validator = await this.blobModule(
      this.source('standalone/js/validator.js')
        .replace("'./registry.js'", JSON.stringify(registry))
        .replace("'./model.js'", JSON.stringify(model))
        .replace("'./plugin-api.js'", JSON.stringify(pluginApi))
        .replace("'./animation.js'", JSON.stringify(animation))
        .replace("'./storybook-cleanroom.js'", JSON.stringify(storybookCleanroom)),
    );
    let app = this.source('standalone/js/app.js');
    const replacements = [
      ["'../plugins/bootstrap.js'", bootstrap], ["'./registry.js'", registry], ["'./model.js'", model],
      ["'./astro-exporter.js'", astro], ["'./zip.js'", zip], ["'./validator.js'", validator], ["'./plugin-api.js'", pluginApi], ["'./research-features.js'", research], ["'./workspace-client.js'", workspaceClient], ["'./animation.js'", animation], ["'./penpot-cleanroom.js'", penpotCleanroom], ["'./platform-io.js'", platformIo], ["'./storybook-cleanroom.js'", storybookCleanroom], ["'./plasmic-cleanroom.js'", plasmicCleanroom],
    ];
    for (const [from, url] of replacements) app = app.replace(from, JSON.stringify(url));
    const appUrl = await this.blobModule(app);
    await this.evaluate(`import(${JSON.stringify(appUrl)}).then(()=>true)`, { awaitPromise: true });
    await sleep(150);
    const ready = await this.evaluate(`Boolean(window.AstroUIDesigner && document.querySelectorAll('.palette-item').length)`);
    if (!ready) throw new Error('Designer did not initialize');
  }

  async click(selector) {
    return this.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw new Error('Missing selector: '+${JSON.stringify(selector)});e.click();return true})()`);
  }

  async dblclick(selector) {
    return this.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw new Error('Missing selector: '+${JSON.stringify(selector)});e.dispatchEvent(new MouseEvent('dblclick',{bubbles:true,cancelable:true,view:window}));return true})()`);
  }

  async change(selector, value, { checked = null } = {}) {
    const jsValue = JSON.stringify(value);
    return this.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw new Error('Missing selector: '+${JSON.stringify(selector)});${checked === null ? `e.value=${jsValue};` : `e.checked=${checked ? 'true' : 'false'};`}e.dispatchEvent(new Event('change',{bubbles:true}));return true})()`);
  }

  async drag(selector, dx, dy, { steps = 4 } = {}) {
    const rect = await this.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw new Error('Missing selector: '+${JSON.stringify(selector)});const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`);
    const x0 = rect.x, y0 = rect.y, x1 = x0 + dx, y1 = y0 + dy;
    await this.command('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x0, y: y0, button: 'none' });
    await this.command('Input.dispatchMouseEvent', { type: 'mousePressed', x: x0, y: y0, button: 'left', buttons: 1, clickCount: 1 });
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      await this.command('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t, button: 'left', buttons: 1 });
      await sleep(15);
    }
    await this.command('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x1, y: y1, button: 'left', buttons: 0, clickCount: 1 });
    await sleep(30);
    return true;
  }

  async key(key, options = {}) {
    const params = { type: 'keyDown', key, code: options.code || key, windowsVirtualKeyCode: options.keyCode || key.charCodeAt?.(0) || 0, ...options };
    await this.command('Input.dispatchKeyEvent', params);
    await this.command('Input.dispatchKeyEvent', { ...params, type: 'keyUp' });
  }

  async screenshot(filename, { width, height } = {}) {
    if (width && height) await this.command('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    await sleep(80);
    const response = await this.command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    fs.writeFileSync(filename, Buffer.from(response.result.data, 'base64'));
    return filename;
  }

  async runtimeErrors() {
    const appErrors = await this.evaluate('window.__designerErrors ? [...window.__designerErrors] : []');
    const protocolErrors = this.events.filter((x) => x.method === 'Runtime.exceptionThrown').map((x) => x.params?.exceptionDetails?.exception?.description || x.params?.exceptionDetails?.text);
    return [...appErrors, ...protocolErrors].filter(Boolean);
  }

  async close() {
    try { this.ws?.close(); } catch {}
    try { this.chrome?.kill('SIGTERM'); } catch {}
    for (let i = 0; i < 5; i++) {
      await sleep(100 + i * 80);
      try { fs.rmSync(this.profile, { recursive: true, force: true }); break; }
      catch (e) { if (i === 4) console.warn(`Could not fully remove browser profile ${this.profile}: ${e.message}`); }
    }
  }
}
