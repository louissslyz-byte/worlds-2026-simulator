import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {profileTeams,profileRoster,teamsByRegion,qualificationPath,regularSeasonRecord,championPool,stage3Scopes} from '../lib/team-profile/data.ts';
import {ageFromBirthDate,countryFlag,sortedChampionStats,championWinRate} from '../lib/team-profile/helpers.ts';
import {validateTeamProfiles,validateChampionPool} from '../lib/team-profile/validate.ts';
import {worldsTeamSnapshot} from '../lib/sim/teamSnapshot.ts';
import {teamRosters,playerRoles} from '../lib/sim/rosters.ts';

const coverage=validateTeamProfiles();assert.equal(coverage.teams,19);assert.equal(coverage.players,95);
const allPlayers=profileTeams.flatMap(t=>profileRoster(t.id).slots.flatMap(s=>s.player?[s.player]:[]));
assert.equal(allPlayers.filter(p=>championPool(p).status==='VERIFIED').length,79);
const chovy=allPlayers.find(p=>p.playerId==='Chovy');
assert.equal(championPool(chovy).stats.reduce((n,s)=>n+s.gamesPlayed,0),30);
assert.equal(championPool(allPlayers.find(p=>p.playerId==='JoJo')).status,'UNAVAILABLE');
assert.deepEqual(teamsByRegion('LCK').map(t=>t.id),['GEN','HLE','T1','DK']);
assert.ok(teamsByRegion('LCS').every(t=>t.worldsSeed===null));
for(const team of profileTeams){
 const original=worldsTeamSnapshot.find(t=>t.id===team.id);
 assert.equal(team.name,original.name);assert.equal(team.worldsSeed,original.officialSeed);
 assert.equal('rating' in team,false);assert.equal('officialGprScore' in team,false);
 const roster=profileRoster(team.id);assert.deepEqual(roster.slots.map(s=>s.role.key),playerRoles.map(r=>r.key));
 if(teamRosters[team.id])assert.deepEqual(roster.slots.map(s=>s.player.playerId),teamRosters[team.id].players);
 assert.ok(qualificationPath(team.id).length>0);
 for(const {player} of roster.slots)if(player){const pool=championPool(player);validateChampionPool(pool,stage3Scopes[team.region].id);if(pool.status==='VERIFIED'){assert.equal(pool.source.kind,'SECONDARY');assert.ok(pool.source.url.startsWith('https://gol.gg/'));assert.equal(pool.snapshotDate,'2026-10-05');}}
}
assert.equal(profileRoster('C9').slots[2].player.playerId,'Loki');assert.equal(profileRoster('C9').slots[3].player.playerId,'Tactical');
assert.ok(stage3Scopes.LPL.includes.includes('区域资格赛'));
for(const [teamId,games] of [['TES',4],['IG',8]])for(const {player} of profileRoster(teamId).slots){
 const pool=championPool(player);assert.equal(pool.status,'VERIFIED');
 assert.equal(pool.segments.find(s=>s.tournament==='LPL 2026 Regional Finals').totalGames,games);
}
for(const teamId of ['AL','BLG'])for(const {player} of profileRoster(teamId).slots){
 const pool=championPool(player);assert.ok(!pool.segments?.some(s=>s.tournament==='LPL 2026 Regional Finals'));
}
const tactical=championPool(allPlayers.find(p=>p.playerId==='Tactical'));
assert.equal(tactical.stats.reduce((n,s)=>n+s.gamesPlayed,0),32);
assert.equal(tactical.segments.find(s=>s.tournament==='LCS 2026 Summer Playoffs').totalGames,15);
assert.equal(ageFromBirthDate('2000-11-02',new Date('2026-11-01T15:59:59Z')),25);
assert.equal(ageFromBirthDate('2000-11-02',new Date('2026-11-01T16:00:00Z')),26);
assert.equal(ageFromBirthDate('2004-02-29',new Date('2026-03-01T00:00:00Z')),22);
assert.equal(ageFromBirthDate('2003-02-29'),null);assert.equal(ageFromBirthDate('2030-01-01'),null);
assert.equal(countryFlag('KR'),'🇰🇷');assert.equal(countryFlag('XXZ'),'');
assert.ok(qualificationPath('GEN').some(s=>s.opponent==='HLE'&&s.stage==='决赛'&&s.score[0]===3&&s.score[1]===1));
assert.deepEqual([regularSeasonRecord('LOS').wins,regularSeasonRecord('LOS').losses],[6,1]);
assert.equal(regularSeasonRecord('GEN'),null);
const source={label:'Test fixture only',url:'https://example.com',checkedAt:'2026-10-05',kind:'OFFICIAL'};
const stats=[{championId:'Zed',championName:'Zed',gamesPlayed:8,wins:6},{championId:'Azir',championName:'Azir',gamesPlayed:8,wins:5},{championId:'Lux',championName:'Lux',gamesPlayed:2,wins:1}];
assert.deepEqual(sortedChampionStats(stats).map(s=>s.championId),['Azir','Zed','Lux']);assert.equal(championWinRate(stats[0]),'75.0%');
const verified={status:'VERIFIED',scopeId:'test',completeness:'COMPLETE',source,stats};validateChampionPool(verified,'test');
assert.throws(()=>validateChampionPool(verified,'other'),/scope/);
assert.throws(()=>validateChampionPool({...verified,stats:[{...stats[0],wins:9}]},'test'),/wins/);
assert.throws(()=>validateChampionPool({...verified,status:'UNAVAILABLE'},'test'),/Unverified/);
assert.throws(()=>validateChampionPool({...verified,segments:[{tournament:'Fixture',sourceUrl:source.url,totalGames:19,totalWins:12}]},'test'),/games total/);
// Shared roster/champion UI does not import or render extended biographies.
for(const file of ['components/tournament/roster-strip.tsx','components/tournament/champion-card.tsx','app/page.tsx','app/rankings/page.tsx','app/simulator/page.tsx'])assert.equal(/team-profile|realName|nationalit|birthDate/.test(readFileSync(file,'utf8')),false,file);
console.log('战队档案通过：身份复用、种子与位置、首发待核验、CST 年龄、国旗、真实赛果、英雄统计校验及模块隔离。',coverage);
