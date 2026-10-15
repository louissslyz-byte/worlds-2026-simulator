import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {register} from 'node:module';
import {pathToFileURL} from 'node:url';
import {validateRelease,releaseEnabled,unpackRelease} from '../lib/team-profile/statistics-release.ts';
const input=process.env.STATISTICS_RELEASE_INPUT,source=process.env.TEAM_STATS_SNAPSHOT;
assert.ok(input&&source,'Explicit private test inputs required');
const bytes=await readFile(input),data=validateRelease(JSON.parse(bytes)),hash=createHash('sha256').update(bytes).digest('hex');
const fullSource=JSON.parse(await readFile(source));
assert.throws(()=>validateRelease(fullSource),'Full private snapshot must fail the release schema');
assert.equal(Object.keys(data.pages).length,114);
for(const env of [{NODE_ENV:'development',TEAM_STATS_RELEASE_ENABLED:'true'},{NODE_ENV:'production'},{NODE_ENV:'production',TEAM_STATS_LOCAL:'1'},{NODE_ENV:'production',TEAM_STATS_RELEASE_ENABLED:'true',VERCEL:'1',VERCEL_ENV:'preview'},{NODE_ENV:'production',TEAM_STATS_RELEASE_ENABLED:'true',VERCEL:'1'}])assert.equal(releaseEnabled(env),false);
assert.equal(releaseEnabled({NODE_ENV:'production',TEAM_STATS_RELEASE_ENABLED:'true',VERCEL:'1',VERCEL_ENV:'production',CI:'1'}),true);
assert.throws(()=>validateRelease({metadata:{schemaVersion:'six-region-profile-index-v1.0'}}));
const bad=structuredClone(data);bad.rawGames=[];assert.throws(()=>validateRelease(bad));
const badMetric=structuredClone(data);badMetric.pages['team:GEN'].entity.metrics.gd15.rawGames=[];assert.throws(()=>validateRelease(badMetric));
assert.equal(unpackRelease(data,'team:UNKNOWN'),null);
const temp=await mkdtemp(join(tmpdir(),'worlds-release-'));
try{
 const output=join(temp,'data.json');
 for(let n=0;n<2;n++){
  const result=spawnSync(process.execPath,['--import','tsx','scripts/create-statistics-release.mjs',source,output],{encoding:'utf8'});assert.equal(result.status,0,'114 source/projection equality checks must pass');assert.equal(createHash('sha256').update(await readFile(output)).digest('hex'),hash);
 }
 for(const extra of [{TEAM_STATS_RELEASE_ENABLED:'false'},{TEAM_STATS_RELEASE_ENABLED:'true',VERCEL:'1',VERCEL_ENV:'preview'},{TEAM_STATS_RELEASE_ENABLED:'true',VERCEL:'1',VERCEL_ENV:'production',CI:'1',TEAM_STATS_RELEASE_SHA256:hash}]){
  const env={...process.env,...extra,TEAM_STATS_RELEASE_INPUT:input};delete env.TEAM_STATS_RELEASE_URL;
  const result=spawnSync(process.execPath,['--import','tsx','scripts/prepare-statistics-release.mjs'],{env,encoding:'utf8'});
  assert.equal(result.status,extra.VERCEL_ENV==='production'?1:0,'CI must not use an absolute local artifact input');
 }
 const sourceHash=createHash('sha256').update(await readFile(source)).digest('hex');
 const forbidden=spawnSync(process.execPath,['--import','tsx','scripts/prepare-statistics-release.mjs'],{env:{...process.env,TEAM_STATS_RELEASE_ENABLED:'true',TEAM_STATS_RELEASE_INPUT:source,TEAM_STATS_RELEASE_SHA256:sourceHash},encoding:'utf8'});
 assert.notEqual(forbidden.status,0);assert.match(forbidden.stderr,/Invalid aggregate release schema|Release artifact size\/checksum mismatch/);
 // Runtime production uses only the fixed release artifact, ignoring private input.
 const prepared=spawnSync(process.execPath,['--import','tsx','scripts/prepare-statistics-release.mjs'],{env:{...process.env,TEAM_STATS_RELEASE_ENABLED:'true',TEAM_STATS_RELEASE_INPUT:input,TEAM_STATS_RELEASE_SHA256:hash},encoding:'utf8'});assert.equal(prepared.status,0);
 register('./tests/statistics-server-loader.mjs',pathToFileURL('./'));
 const saved={...process.env};
 try{
  Object.assign(process.env,{NODE_ENV:'production',CI:'1',VERCEL:'1',VERCEL_ENV:'production',TEAM_STATS_RELEASE_ENABLED:'true',TEAM_STATS_RELEASE_SHA256:hash,TEAM_STATS_LOCAL:'1',TEAM_STATS_SNAPSHOT:'/nonexistent/forbidden-private-input.json'});
  const {teamStatistics,playerStatistics}=await import('../lib/team-profile/statistics-server.ts');
  assert.deepEqual(JSON.parse(JSON.stringify(await teamStatistics('GEN'))),unpackRelease(data,'team:GEN'));
  assert.ok((await playerStatistics('GEN','Chovy','MID')).entity.metrics.gd15);assert.equal(process.env.P3B_HEADERS_READS,undefined);
  process.env.VERCEL_ENV='preview';assert.equal(await teamStatistics('GEN'),null);
  process.env.VERCEL_ENV='production';process.env.TEAM_STATS_RELEASE_ENABLED='false';assert.equal(await teamStatistics('GEN'),null);
 }finally{for(const key of Object.keys(process.env))if(!(key in saved))delete process.env[key];Object.assign(process.env,saved);}
 console.log('发布数据测试通过：114页逐字段一致、两次字节复现、严格schema、Preview拒绝、CI拒绝私人路径、生产读取及开关隔离。');
}finally{await rm(temp,{recursive:true,force:true});}
