// Production-mode, loopback-only verification of the existing displayed pools.
import assert from 'node:assert/strict';
import {profileTeams,profileRoster,championPool} from '../lib/team-profile/data.ts';
import {sortedChampionStats,championWinRate} from '../lib/team-profile/helpers.ts';
const root=new URL(process.env.PROFILE_AUDIT_URL??'http://127.0.0.1:3023');
assert.equal(root.protocol,'http:');assert.ok(['127.0.0.1','localhost','[::1]'].includes(root.hostname));
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#x27;');
const release=process.env.PROFILE_STATS_RELEASE==='1';
let teams=0,players=0,rows=0;
for(const team of profileTeams){
 const response=await fetch(new URL(`/teams/${team.slug}`,root));assert.equal(response.status,200);
 const html=await response.text();assert.ok(html.includes('选手阵容'));assert.ok(html.includes('晋级之路'));assert.equal(html.includes('TEAM STATISTICS'),release);teams++;
 for(const {player} of profileRoster(team.id).slots){
  assert.ok(player);const response=await fetch(new URL(`/teams/${team.slug}/${player.slug}`,root));assert.equal(response.status,200);
  const html=await response.text();assert.equal(html.includes('PLAYER STATISTICS'),release);assert.ok(html.includes('STAGE 3 CHAMPION POOL'));
  const body=html.match(/<tbody>(.*?)<\/tbody>/s)?.[1];assert.ok(body,player.id);
  const actual=[...body.matchAll(/<tr>(.*?)<\/tr>/gs)].map(m=>m[1]),expected=sortedChampionStats(championPool(player).stats);
  assert.equal(actual.length,expected.length,player.id);
  for(const [i,stat] of expected.entries()){
   assert.ok(actual[i].includes(escape(stat.championName)),`${player.id}: champion/order`);
   assert.ok(actual[i].endsWith(`<td>${stat.gamesPlayed}</td><td>${championWinRate(stat)}</td>`),`${player.id}: games/win rate`);rows++;
  }players++;
 }
}
assert.equal(teams,19);assert.equal(players,95);
console.log(`生产英雄池验收通过：${teams}队、${players}人、${rows}条英雄行；阵容／晋级之路正常，发布统计${release?'开启':'关闭'}。`);
