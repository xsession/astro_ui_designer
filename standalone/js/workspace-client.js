const jsonHeaders={'Content-Type':'application/json'};
async function api(path, body=null){
  const init=body==null?{}:{method:'POST',headers:jsonHeaders,body:JSON.stringify(body)};
  const r=await fetch(`/api/${path}`,init); if(!r.ok)throw new Error((await r.text())||`${r.status} ${r.statusText}`); return r.json();
}
export async function openWorkspace(rootPath){return api('workspace/open',{rootPath});}
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
