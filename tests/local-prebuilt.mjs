import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm,symlink,realpath} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {preparedLocalInput} from '../scripts/local-prebuilt-input.mjs';
import {finalizePrebuilt} from '../scripts/prebuilt-stage.mjs';
const root=await realpath(await mkdtemp(join(tmpdir(),'prebuilt-guard-'))),hash='a'.repeat(64);
try{
 await mkdir(join(root,'.vercel'));await mkdir(join(root,'.team-stats-release'));
 await writeFile(join(root,'.vercel/project.json'),JSON.stringify({projectId:'fixture',orgId:'owner'}));
 await writeFile(join(root,'.team-stats-release/data.json'),'fixture-only');
 const path=join(root,'.vercel/team-stats-local-build.json'),base={kind:'LOCAL_PREBUILT',sha256:hash,pid:process.pid,createdAt:Date.now(),projectId:'fixture',orgId:'owner'};
 await assert.rejects(()=>preparedLocalInput(root,hash));
 for(const extra of [{createdAt:Date.now()-4_000_000},{createdAt:Date.now()+10_000},{projectId:'other'},{orgId:'other'},{kind:'CLOUD'},{sha256:'b'.repeat(64)},{pid:1}]){
  await writeFile(path,JSON.stringify({...base,...extra}));await assert.rejects(()=>preparedLocalInput(root,hash));
 }
 await writeFile(path,JSON.stringify(base));assert.equal((await preparedLocalInput(root,hash)).toString(),'fixture-only');
 await rm(join(root,'.team-stats-release/data.json'));await symlink(join(root,'.vercel/project.json'),join(root,'.team-stats-release/data.json'));await assert.rejects(()=>preparedLocalInput(root,hash));
 const output=join(root,'output');await mkdir(join(output,'diagnostics'),{recursive:true});await mkdir(join(output,'static/_next/__private'),{recursive:true});
 await writeFile(join(output,'builds.json'),JSON.stringify({target:'production',cliVersion:'64.2.0',argv:['local-path'],detectedFramework:{slug:'nextjs'},builds:[{requirePath:'local-builder-path',src:'package.json',use:'@vercel/next'}]}));
 await finalizePrebuilt(output);const result=JSON.parse(await readFile(join(output,'builds.json')));
 assert.equal(result.target,'production');assert.equal(result.builds[0].requirePath,undefined);assert.equal(result.detectedFramework.slug,'nextjs');assert.deepEqual(result.argv,['vercel','build','--prod','--standalone']);
 await writeFile(join(output,'builds.json'),JSON.stringify({target:'production',error:{message:'fixture failure'}}));await assert.rejects(()=>finalizePrebuilt(output));
 console.log('本地Prebuilt保护测试通过：真实绑定、有效期、活跃runner、符号链接、失败关闭及可部署target元数据保留。');
}finally{await rm(root,{recursive:true,force:true});}
