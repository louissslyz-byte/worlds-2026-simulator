import assert from 'node:assert/strict';
import {readFile,readdir,realpath,lstat,readlink,writeFile} from 'node:fs/promises';
import {relative,join} from 'node:path';
import {homedir} from 'node:os';
import {createHash} from 'node:crypto';
import {artifactFiles} from './prebuilt-stage.mjs';
import {validateRelease} from '../lib/team-profile/statistics-release.ts';
const root=await realpath('.vercel/output'),expected=process.env.TEAM_STATS_RELEASE_SHA256;
assert.match(expected??'',/^[a-f0-9]{64}$/);
assert.equal(JSON.parse(await readFile(join(root,'config.json'),'utf8')).version,3);
const meta=JSON.parse(await readFile(join(root,'builds.json'),'utf8'));assert.equal(meta.target,'production');assert.ok(!meta.error);
const files=await artifactFiles(root),hits=[],links=[],resources=[];const hashes={};
const secrets=[];
const researchMarkers=[];
if(process.env.GOL_RESEARCH_DIR){
 const rows=JSON.parse(await readFile(join(process.env.GOL_RESEARCH_DIR,'gol-match-rows.json'),'utf8'));
 researchMarkers.push(...Object.values(rows.players).flatMap(p=>p.rows).slice(0,8).map(r=>JSON.stringify(r)));
}
for(const file of ['.env.local','.vercel/.env.production.local']){
 try{for(const line of (await readFile(file,'utf8')).split('\n')){
  if(line.startsWith('#')||!line.includes('='))continue;
  const value=line.slice(line.indexOf('=')+1).trim().replace(/^['"]|['"]$/g,'');if(value.length>30)secrets.push(value);
 }}catch(error){if(error.code!=='ENOENT')throw error;}
}
if(process.env.VERCEL_CLI_CONFIG){
 const auth=JSON.parse(await readFile(join(process.env.VERCEL_CLI_CONFIG,'auth.json'),'utf8'));
 for(const [key,value] of Object.entries(auth))if(/token|secret|password/i.test(key)&&typeof value==='string'&&value.length>20)secrets.push(value);
}
async function checkLinks(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isSymbolicLink()){const rel=relative(root,await realpath(p));assert.ok(rel!=='..'&&!rel.startsWith('../'),'External output symlink');links.push({path:relative(root,p),target:await readlink(p)});}else if(e.isDirectory())await checkLinks(p);}}
await checkLinks(root);
for(const file of files){
 const rel=relative(root,file),bytes=await readFile(file);hashes[rel]=createHash('sha256').update(bytes).digest('hex');
 const forbiddenName=/(?:^|\/)(?:\.env[^/]*|gol-match-rows\.json|gol-segments\.json|team-profile-data\.json)$|OraclesElixir.*\.csv|offline-worlds-stats|diagnostics\/|__private\//;
 if(forbiddenName.test(rel)||bytes.includes(Buffer.from(homedir()+'/'))||secrets.some(s=>bytes.includes(Buffer.from(s)))||researchMarkers.some(s=>bytes.includes(Buffer.from(s))||bytes.includes(Buffer.from(JSON.stringify(s))))||bytes.includes(Buffer.from('worlds-six-regions-2026-10-14-v1')))hits.push(rel);
 if(rel.endsWith('.team-stats-release/data.json')){
  assert.equal(hashes[rel],expected);const data=validateRelease(JSON.parse(bytes));assert.equal(Object.keys(data.pages).length,114);resources.push(rel);
  assert.ok(rel.startsWith('functions/'));
 }
 if(rel.endsWith('.vc-config.json')){const c=JSON.parse(bytes);assert.equal(c.runtime,'nodejs22.x');assert.ok(!c.filePathMap,'Standalone artifact must not reference source files');}
}
for(const route of ['teams/[slug].func','teams/[slug]/[player].func']){
 const path=join(root,'functions',route,'.team-stats-release/data.json');assert.equal(createHash('sha256').update(await readFile(path)).digest('hex'),expected);
 const config=JSON.parse(await readFile(join(root,'functions',route,'.vc-config.json'),'utf8'));assert.ok((await lstat(join(root,'functions',route,config.handler))).isFile());
}
assert.ok(resources.length);assert.deepEqual(hits,[],'Prebuilt output privacy audit failed');
const treeSha256=createHash('sha256').update(JSON.stringify({hashes,links})).digest('hex');
const result={cliVersion:meta.cliVersion,target:meta.target,files:files.length,sourceMapsScanned:files.filter(p=>p.endsWith('.map')).length,nativeAddons:files.filter(p=>p.endsWith('.node')).length,researchCanaries:researchMarkers.length,internalSymlinks:links.length,resources,teams:19,players:95,releaseSha256:expected,treeSha256,privateOrSecretHits:hits};
if(process.env.PREBUILT_AUDIT_MANIFEST)await writeFile(process.env.PREBUILT_AUDIT_MANIFEST,JSON.stringify({...result,hashes,links},null,2)+'\n',{mode:0o600});
console.log(JSON.stringify(result,null,2));
