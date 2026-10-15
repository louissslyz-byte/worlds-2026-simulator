import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateRelease,unpackRelease} from '../lib/team-profile/statistics-release.ts';
import {formatMetric} from '../lib/team-profile/statistics-types.ts';
import {profileTeams,profileRoster} from '../lib/team-profile/data.ts';
const root=new URL(process.env.STATISTICS_BASE_URL??'http://127.0.0.1:3023');
assert.ok(root.protocol==='http:'&&['127.0.0.1','localhost','[::1]'].includes(root.hostname));
const data=validateRelease(JSON.parse(await readFile(process.env.STATISTICS_RELEASE_INPUT,'utf8')));let checked=0;
const paths=profileTeams.flatMap(t=>[{path:`/teams/${t.slug}`,key:`team:${t.id}`},...profileRoster(t.id).slots.map(({player:p})=>({path:`/teams/${t.slug}/${p.slug}`,key:`player:${t.id}|${p.playerId}|${p.role}`}))]);
for(const item of paths){
 const response=await fetch(new URL(item.path,root));assert.equal(response.status,200);const html=await response.text();const view=unpackRelease(data,item.key);
 assert.ok(html.includes(item.key.startsWith('team:')?'TEAM STATISTICS':'PLAYER STATISTICS'));assert.ok(!html.includes('仅本地预览'));
 for(const [key,m] of Object.entries(view.entity.metrics))assert.ok(html.includes(formatMetric(key,m.value)),`${item.path}: ${key}`);
 for(const marker of ['sourceGameId','missingGameIds','oe-player:','worlds-six-regions-2026-10-14-v1','TEAM_STATS_RELEASE_URL','TEAM_STATS_SNAPSHOT','/Users/'])assert.ok(!html.includes(marker));checked++;
}
for(const headers of [{RSC:'1'},{'x-forwarded-host':'external.invalid'},{'x-forwarded-for':'203.0.113.1'}]){
 const response=await fetch(new URL('/teams/gen',root),{headers});assert.equal(response.status,200);const text=await response.text();assert.ok(text.includes('TEAM STATISTICS'));assert.ok(!text.includes('worldsTeamsById'));checked++;
}
for(const path of ['/.team-stats-release/data.json','/data.json','/api/statistics','/lib/team-profile/gol-match-rows.json','/team-profile-data.json']){assert.equal((await fetch(new URL(path,root))).status,404);checked++;}
console.log(`生产发布HTTP验收通过：${checked}请求，19队95人数值、RSC、公开头部独立性及无JSON下载路径。`);
