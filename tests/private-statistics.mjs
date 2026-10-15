// Opt-in local acceptance only. Never loads restricted input in production.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {localStatisticsEnabled,formatMetric} from '../lib/team-profile/statistics-types.ts';
const env={NODE_ENV:'development',TEAM_STATS_LOCAL:'1'};
assert.equal(localStatisticsEnabled(env,'127.0.0.1:3022',false),true);
for(const e of [{...env,NODE_ENV:'production'},{...env,CI:'1'},{...env,VERCEL:'1'},{NODE_ENV:'development'}])assert.equal(localStatisticsEnabled(e,'localhost:3022',false),false);
assert.equal(localStatisticsEnabled(env,'example.com',false),false);assert.equal(localStatisticsEnabled(env,'localhost',true),false);
assert.equal(formatMetric('gd15',null),'暂无有效数据');assert.equal(formatMetric('gd15',0),'0');assert.equal(formatMetric('durationSeconds',1956.675),'32:37');assert.equal(formatMetric('damageConversion',1.2),'1.20×');
if(!process.env.TEAM_STATS_SNAPSHOT)throw new Error('Set private TEAM_STATS_SNAPSHOT explicitly for this opt-in test');
const snapshot=JSON.parse(await readFile(process.env.TEAM_STATS_SNAPSHOT,'utf8'));
const root='http://127.0.0.1:3022';let checked=0;
const checks=[...Object.values(snapshot.worldsTeamsById).map(t=>({path:`/teams/${t.slug}`,marker:'TEAM STATISTICS',metrics:snapshot.regions[t.region].teamsById[t.regionalTeamId].metrics})),...Object.values(snapshot.worldsRosterBySlot).map(s=>({path:`/teams/${s.teamId.toLowerCase()}/${s.slug}`,marker:'PLAYER STATISTICS',metrics:snapshot.regions[s.region].playerStatsByKey[s.regionalStatKeys[0]].metrics}))];
// Small batches keep local dev compilation responsive.
for(let at=0;at<checks.length;at+=3){await Promise.all(checks.slice(at,at+3).map(async c=>{
 const res=await fetch(root+c.path);assert.equal(res.status,200,c.path);const html=await res.text();assert.ok(html.includes(c.marker),c.path);
 for(const [key,m] of Object.entries(c.metrics))assert.ok(html.includes(formatMetric(key,m.value)),`${c.path}: ${key}`);
 for(const forbidden of ['worlds-six-regions-2026-10-14-v1','sourceGameId','oe:player:','TEAM_STATS_SNAPSHOT'])assert.ok(!html.includes(forbidden),`private payload leak: ${forbidden}`);
 if(c.marker==='PLAYER STATISTICS')assert.ok(html.indexOf('PLAYER STATISTICS')<html.indexOf('STAGE 3 CHAMPION POOL'));
 checked++;
}));}
const external=await fetch(root+'/teams/gen',{headers:{'x-forwarded-host':'example.com'}});assert.ok(!(await external.text()).includes('TEAM STATISTICS'));
console.log(`本地统计验收通过：${checked} 页面（19队、95位），门禁、null/0、数值与页面级数据隔离。`);
