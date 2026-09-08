const jsonHeaders={'Content-Type':'application/json'};
async function api(path, body=null){if(window.__ASTRO_UI_VSCODE__?.request)return window.__ASTRO_UI_VSCODE__.request(path,body);const init=body==null?{}:{method:'POST',headers:jsonHeaders,body:JSON.stringify(body)};const r=await fetch(`/api/${path}`,init);if(!r.ok)throw new Error((await r.text())||`${r.status} ${r.statusText}`);return r.json();}
export async function openWorkspace(rootPath){return api('workspace/open',{rootPath});}
export async function browseWorkspace(initialPath=''){return api('workspace/browse',{initialPath});}
export async function rescanWorkspace(){return api('workspace/rescan',{});}
export async function readWorkspaceFile(relativePath){return api('workspace/read',{relativePath});}
export async function writeWorkspaceFile(relativePath,content){return api('workspace/write',{relativePath,content});}
export async function gitStatus(){return api('git/status',{});}
export async function gitDiff(relativePath=''){return api('git/diff',{relativePath});}
export async function gitStage(relativePath=''){return api('git/stage',{relativePath});}
export async function gitCommit(message){return api('git/commit',{message});}
export async function startPreview(){return api('preview/start',{});}
export async function stopPreview(){return api('preview/stop',{});}
export async function workspaceInfo(){return api('workspace/info',{});}
export async function isWorkspaceApiAvailable(){try{await workspaceInfo();return true}catch{return false}}
export async function roundTripHealth(){return api('roundtrip/health',{});}
export async function roundTripInspectSource(relativePath,backend='astro'){return api('roundtrip/inspect',{relativePath,backend});}
export async function roundTripPlanSource({relativePath,backend='astro',baselineFingerprint='',sourceIdentity={},nodeId='',changes=[]}={}){return api('roundtrip/plan',{relativePath,backend,baselineFingerprint,sourceIdentity,nodeId,changes});}
export async function roundTripApplySource({relativePath,baselineFingerprint,nextSource,backend='astro'}={}){return api('roundtrip/apply',{relativePath,baselineFingerprint,nextSource,backend});}
export async function roundTripWatchStart(){return api('roundtrip/watch/start',{});}
export async function roundTripWatchPoll(after=0){return api('roundtrip/watch/poll',{after});}
export async function roundTripWatchStop(){return api('roundtrip/watch/stop',{});}
export async function roundTripPreviewStart(backend='astro'){return api('roundtrip/preview/start',{backend});}
export async function roundTripPreviewStop(){return api('roundtrip/preview/stop',{});}
