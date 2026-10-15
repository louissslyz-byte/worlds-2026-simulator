// Build-only handoff. Never reads an external input path or runs in application code.
import {readFile,realpath,lstat} from 'node:fs/promises';
import {join} from 'node:path';
export async function preparedLocalInput(root,expected){
 const permitPath=join(root,'.vercel/team-stats-local-build.json');
 if((await lstat(permitPath)).isSymbolicLink())throw Error('Invalid local prebuilt permit');
 const permit=JSON.parse(await readFile(permitPath,'utf8'));
 const binding=JSON.parse(await readFile(join(root,'.vercel/project.json'),'utf8'));
 const age=Date.now()-permit.createdAt;
 if(permit.kind!=='LOCAL_PREBUILT'||permit.sha256!==expected||permit.projectId!==binding.projectId||permit.orgId!==binding.orgId||!Number.isFinite(age)||age<0||age>3_600_000||!Number.isInteger(permit.pid)||permit.pid<=1)throw Error('Invalid or expired local prebuilt permit');
 // A normal cloud build has neither this ignored permit nor its live local runner.
 try{process.kill(permit.pid,0);}catch{throw Error('Local prebuilt runner is no longer active');}
 const directory=join(root,'.team-stats-release'),path=join(directory,'data.json');
 if(await realpath(directory)!==directory||(await lstat(path)).isSymbolicLink())throw Error('Invalid prepared aggregate resource');
 return readFile(path);
}
