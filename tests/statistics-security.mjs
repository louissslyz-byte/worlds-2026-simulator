// Opt-in, local-only security tests. Never write or redistribute the source snapshot.
import assert from 'node:assert/strict';
import {register} from 'node:module';
import {pathToFileURL} from 'node:url';
import {mkdtemp,symlink,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
if(!process.env.TEAM_STATS_SNAPSHOT)throw new Error('Explicit external TEAM_STATS_SNAPSHOT required');
register('./tests/statistics-server-loader.mjs',pathToFileURL('./'));
const {teamStatistics,playerStatistics}=await import('../lib/team-profile/statistics-server.ts');
const saved={...process.env};const actual=saved.TEAM_STATS_SNAPSHOT;let cases=0;
const configure=(extra={})=>{for(const key of ['CI','VERCEL','TEAM_STATS_LOCAL','TEAM_STATS_SNAPSHOT','NODE_ENV','P3B_HEADERS_READS','P3B_TEST_HEADERS'])delete process.env[key];Object.assign(process.env,{NODE_ENV:'development',TEAM_STATS_LOCAL:'1',TEAM_STATS_SNAPSHOT:actual,P3B_TEST_HEADERS:JSON.stringify({host:'127.0.0.1:3022'})},extra);};
const blocked=async()=>{assert.equal(await teamStatistics('GEN'),null);assert.equal(await playerStatistics('GEN','Chovy','MID'),null);cases++;};
let temp;
try{
 for(const extra of [{NODE_ENV:'production'},{NODE_ENV:'production',CI:'1',VERCEL:'1'},{NODE_ENV:'development',CI:'1'},{NODE_ENV:'development',VERCEL:'1'},{TEAM_STATS_LOCAL:'0'},{TEAM_STATS_LOCAL:''}]){
  configure({...extra,TEAM_STATS_SNAPSHOT:join(tmpdir(),'nonexistent-private-audit-input.json')});await blocked();assert.equal(process.env.P3B_HEADERS_READS,undefined,'disabled environments must return before headers/filesystem');
 }
 for(const headers of [{host:'example.com'},{host:'localhost.evil.invalid'},{host:'127.0.0.1:3022',forwarded:'for=203.0.113.7'},{host:'127.0.0.1:3022','x-forwarded-host':'public.invalid'},{host:'127.0.0.1:3022','x-forwarded-for':'203.0.113.7'},{host:'127.0.0.1:3022','x-forwarded-for':'127.0.0.1, 203.0.113.7'}]){
  configure({P3B_TEST_HEADERS:JSON.stringify(headers)});await blocked();
 }
 configure({TEAM_STATS_SNAPSHOT:'relative.json'});await blocked();
 for(const path of [resolve('README.md'),resolve('..in-project-probe.json')]){
  configure({TEAM_STATS_SNAPSHOT:path});await assert.rejects(()=>teamStatistics('GEN'),/必须保存在网站项目之外/);cases++;
 }
 temp=await mkdtemp(join(tmpdir(),'worlds-private-path-test-'));
 const link=join(temp,'snapshot-link');await symlink(resolve('README.md'),link);
 configure({TEAM_STATS_SNAPSHOT:link});await assert.rejects(()=>teamStatistics('GEN'),/必须保存在网站项目之外/);cases++;
 configure();const view=await teamStatistics('GEN');assert.ok(view?.entity.metrics);const player=await playerStatistics('GEN','Chovy','MID');assert.ok(player?.entity.metrics);
 for(const projected of [view,player]){
  const text=JSON.stringify(projected);
  for(const marker of ['sourceGameId','sourcePlayerId','worlds-six-regions-2026-10-14-v1','six-region-profile-index-v1.0',actual,'oe-player:','oe:player:'])assert.ok(!text.includes(marker),'page projection must omit raw source IDs/private bundle metadata');
  assert.ok(!('worldsTeamsById' in projected));assert.ok(!('regions' in projected));
 }cases++;
 assert.equal(await teamStatistics('../../private-data'),null);assert.equal(await playerStatistics('GEN','../../private-data','MID'),null);cases++;
 // Cached local data must not become accessible after switching to production.
 process.env.NODE_ENV='production';await blocked();
 console.log(`统计安全专项通过：${cases}组环境、代理头、路径、符号链接、投影及缓存隔离检查。`);
}finally{
 if(temp)await rm(temp,{recursive:true,force:true});
 for(const key of Object.keys(process.env))if(!(key in saved))delete process.env[key];
 Object.assign(process.env,saved);
}
