'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function nonce() { return crypto.randomBytes(18).toString('base64url'); }

function designerHtml(extensionPath, webview, Uri) {
  const root = path.join(extensionPath, 'designer');
  const indexPath = path.join(root, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  const styleUri = webview.asWebviewUri(Uri.file(path.join(root, 'styles.css'))).toString();
  const appUri = webview.asWebviewUri(Uri.file(path.join(root, 'js', 'app.js'))).toString();
  const n = nonce();
  html = html.replace('./styles.css', styleUri).replace('./js/app.js', appUri);
  const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data: blob: https:; font-src ${webview.cspSource}; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource} 'nonce-${n}'; connect-src http: https: ws: wss:; frame-src http: https:;">`;
  html = html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n  ${csp}`);
  const bridge = `<script nonce="${n}">
(() => {
  const vscode = acquireVsCodeApi();
  let seq = 0;
  const pending = new Map();
  const sendRequest = (path, body) => new Promise((resolve, reject) => {
    const id = 'ws-' + (++seq);
    pending.set(id, { resolve, reject });
    vscode.postMessage({ type: 'workspaceRequest', id, path, body });
  });
  window.__ASTRO_UI_VSCODE__ = { request: sendRequest, post: (type, payload) => vscode.postMessage({ type, payload }) };
  const oldOpen = window.open.bind(window);
  window.open = (url, target, features) => {
    if (typeof url === 'string' && /^(https?:|mailto:)/.test(url)) { vscode.postMessage({ type: 'openExternal', url }); return null; }
    return oldOpen(url, target, features);
  };
  async function api() {
    for (let i = 0; i < 200; i++) {
      if (window.AstroUIDesigner) return window.AstroUIDesigner;
      await new Promise(r => setTimeout(r, 25));
    }
    throw new Error('Astro UI Designer API did not initialize');
  }
  window.addEventListener('message', async (event) => {
    const msg = event.data || {};
    if (msg.type === 'workspaceResponse') {
      const item = pending.get(msg.id); if (!item) return; pending.delete(msg.id);
      msg.ok ? item.resolve(msg.value) : item.reject(new Error(msg.error || 'Workspace request failed'));
      return;
    }
    if (msg.type === 'designerCall') {
      try {
        const a = await api();
        const fn = a[msg.method];
        if (typeof fn !== 'function') throw new Error('Designer method not available: ' + msg.method);
        const value = await fn(...(msg.args || []));
        vscode.postMessage({ type: 'designerCallResult', id: msg.id, ok: true, value });
      } catch (error) {
        vscode.postMessage({ type: 'designerCallResult', id: msg.id, ok: false, error: String(error && (error.stack || error.message) || error) });
      }
      return;
    }
  });
  window.addEventListener('DOMContentLoaded', () => vscode.postMessage({ type: 'ready' }), { once: true });
})();
</script>`;
  html = html.replace('</body>', `${bridge}\n</body>`);
  return html;
}

module.exports = { designerHtml };
