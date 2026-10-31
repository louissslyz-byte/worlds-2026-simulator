// Actual final Build Output projection; local HTTP only, no generation or writes.
import assert from 'node:assert/strict';
import {loadLiveView} from '../lib/live/view-server.ts';
const base=process.env.LIVE_UPDATE_BASE_URL??'http://127.0.0.1:3061';
const url=new URL(base);assert.ok(url.protocol==='http:'&&['127.0.0.1','localhost'].includes(url.hostname));
const expected=await loadLiveView();let actual;
function visit(value){if(!value||typeof value!=='object')return;if(value.data?.teams?.length===19&&value.data?.nodes)actual=value.data;for(const v of Object.values(value))visit(v);}
const response=await fetch(base+'/live?_rsc=liveops',{headers:{RSC:'1'}});assert.equal(response.status,200);const text=await response.text();
for(const line of text.split('\n'))try{visit(JSON.parse(line.slice(line.indexOf(':')+1)));}catch{}
assert.deepEqual(actual,expected);assert.equal(actual.nodes.length,6);assert.equal(actual.matches.length,39);
assert.equal(actual.matches.filter(m=>m.status==='COMPLETED').length,36);assert.equal(actual.matches.filter(m=>m.round===5&&m.stage==='SWISS'&&m.winner===null&&m.scoreA===null).length,3);
for(const team of actual.teams)assert.equal(team.points.length,6);
const rendered=actual.teams.reduce((n,t)=>n+(t.eliminationNodeIndex===null?actual.nodes.length:t.eliminationNodeIndex+1)*3,0);
const html=await (await fetch(base+'/live')).text();assert.equal((html.match(/data-live-team=/g)||[]).length,19);assert.equal((html.match(/data-curve=/g)||[]).length,57);
assert.equal((html.match(/pointer-events="none" cx=/g)||[]).length,rendered);assert.equal((html.match(/role="button"/g)||[]).length,rendered);
let checked=2;
for(const path of ['/','/rankings','/simulator','/simulator/new','/methodology','/teams','/teams/gen','/teams/gen/chovy']){const r=await fetch(base+path);assert.equal(r.status,200);const body=await r.text();for(const s of ['/Users/','worlds-six-regions-2026-10-14-v1','TEAM_STATS_SNAPSHOT'])assert.ok(!body.includes(s));checked++;}
for(const path of ['/lib/live/updates/round2/facts.json','/lib/live/updates/round2/probability.json','/lib/live/updates/round3/facts.json','/lib/live/updates/round3/probability.json','/lib/live/updates/round4/facts.json','/lib/live/updates/round4/probability.json','/team-profile-data.json','/.env','/api/statistics','/lib/live/updates/facts/swiss-r1-v1.json','/lib/live/updates/snapshots/swiss-r1-v1.json','/lib/team-profile/gol-match-rows.json','/.team-stats-release/data.json']){assert.equal((await fetch(base+path)).status,404);checked++;}
console.log(`Live HTTP/RSC PASS: ${checked} requests, exact source projection, 39 matches, 19 teams / 57 curves / ${rendered} rendered points (342 preserved history values), no raw-data download route.`);
