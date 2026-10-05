import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {profileTeams,profileRoster,teamsByRegion,qualificationPath,regularSeasonRecord,regularSeasonSummary,championPool,stage3Scopes} from '../lib/team-profile/data.ts';
import {ageFromBirthDate,countryFlag,sortedChampionStats,championWinRate} from '../lib/team-profile/helpers.ts';
import {validateTeamProfiles,validateChampionPool,validateRegularSeasonStanding} from '../lib/team-profile/validate.ts';
import {biographies} from '../lib/team-profile/snapshot.ts';
import {worldsTeamSnapshot} from '../lib/sim/teamSnapshot.ts';
import {teamRosters,playerRoles} from '../lib/sim/rosters.ts';

const coverage=validateTeamProfiles();assert.equal(coverage.teams,19);assert.equal(coverage.players,95);
const allPlayers=profileTeams.flatMap(t=>profileRoster(t.id).slots.flatMap(s=>s.player?[s.player]:[]));
assert.equal(allPlayers.filter(p=>championPool(p).status==='VERIFIED').length,87);
assert.equal(allPlayers.filter(p=>championPool(p).status==='PARTIAL').length,8);
assert.ok(allPlayers.every(p=>championPool(p).stats.length>0));
const chovy=allPlayers.find(p=>p.playerId==='Chovy');
assert.equal(championPool(chovy).stats.reduce((n,s)=>n+s.gamesPlayed,0),30);
assert.equal(championPool(allPlayers.find(p=>p.playerId==='JoJo')).status,'PARTIAL');
for(const name of ['Thanatos','Loki','Vulcan','Guigo','Tatu','Tutsz','Ayu','JoJo']){
 const pool=championPool(allPlayers.find(p=>p.playerId===name));assert.equal(pool.status,'PARTIAL');assert.equal(pool.completeness,'PARTIAL');assert.ok(pool.reason&&pool.source&&pool.stats.length);
}
assert.equal(championPool(allPlayers.find(p=>p.playerId==='Harky')).stats.reduce((n,s)=>n+s.gamesPlayed,0),28);
assert.equal(championPool(allPlayers.find(p=>p.playerId==='Feisty')).segments.find(s=>s.tournament==='CBLOL 2026 Split 2 Playoffs').totalGames,9);
assert.equal(championPool(allPlayers.find(p=>p.playerId==='Thanatos')).segments.find(s=>s.tournament==='LCS 2026 Summer Playoffs').totalGames,14);
assert.equal(championPool(allPlayers.find(p=>p.playerId==='JoJo')).segments.find(s=>s.tournament==='CBLOL 2026 Split 2 Playoffs').totalGames,6);
assert.deepEqual(teamsByRegion('LCK').map(t=>t.id),['GEN','HLE','T1','DK']);
assert.ok(teamsByRegion('LCS').every(t=>t.worldsSeed===null));
for(const team of profileTeams){
 const original=worldsTeamSnapshot.find(t=>t.id===team.id);
 assert.equal(team.name,original.name);assert.equal(team.worldsSeed,original.officialSeed);
 assert.equal('rating' in team,false);assert.equal('officialGprScore' in team,false);
 const roster=profileRoster(team.id);assert.deepEqual(roster.slots.map(s=>s.role.key),playerRoles.map(r=>r.key));
 if(teamRosters[team.id])assert.deepEqual(roster.slots.map(s=>s.player.playerId),teamRosters[team.id].players);
 assert.ok(qualificationPath(team.id).length>0);
 for(const {player} of roster.slots)if(player){const pool=championPool(player);validateChampionPool(pool,stage3Scopes[team.region].id);if(pool.status==='VERIFIED'){assert.equal(pool.source.kind,'SECONDARY');assert.ok(pool.source.url.startsWith('https://gol.gg/'));assert.ok(['2026-10-05','2026-10-06'].includes(pool.snapshotDate));}}
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
assert.deepEqual([regularSeasonRecord('GEN').wins,regularSeasonRecord('GEN').losses,regularSeasonRecord('GEN').rank],[19,7,1]);
assert.deepEqual(regularSeasonRecord('GEN').stageRecord,{wins:5,losses:3});
assert.equal(regularSeasonRecord('IG').group,'涅槃组');assert.equal(regularSeasonRecord('IG').rank,2);
assert.equal(regularSeasonRecord('KC').rank,1);assert.equal(regularSeasonRecord('FUR').rank,4);
assert.equal(regularSeasonRecord('UNKNOWN'),null);
assert.equal(regularSeasonSummary(regularSeasonRecord('CFO')),'3 胜 1 负 · 瑞士轮 · 并列第 2 名');
for(const team of profileTeams)validateRegularSeasonStanding(regularSeasonRecord(team.id));
assert.throws(()=>validateRegularSeasonStanding({...regularSeasonRecord('GEN'),wins:-1}),/standing/);
assert.throws(()=>validateRegularSeasonStanding({...regularSeasonRecord('GEN'),rank:0}),/standing/);
assert.throws(()=>validateRegularSeasonStanding({...regularSeasonRecord('GEN'),stageRecord:{wins:30,losses:1}}),/stage record/);
for(const player of allPlayers){
 const original=biographies[`${player.teamId}:${player.playerId}`];
 for(const field of ['realName','birthDate','reportedAge','nationalities'])if(original?.[field])assert.deepEqual(player[field],original[field],'Preserve existing official biography fields');
}
assert.equal(allPlayers.find(p=>p.playerId==='Loki').birthDate.value,'2005-03-26');
assert.equal(allPlayers.find(p=>p.playerId==='JoJo').realName.value,'Gabriel Dzelme de Oliveira');
assert.equal(allPlayers.find(p=>p.playerId==='JoJo').role,'SUPPORT');
assert.equal(allPlayers.find(p=>p.playerId==='Ayu').birthDate.value,'2005-10-06');
assert.equal(ageFromBirthDate('2005-10-06',new Date('2026-10-05T15:59:59Z')),20);
assert.equal(ageFromBirthDate('2005-10-06',new Date('2026-10-05T16:00:00Z')),21);
assert.equal(allPlayers.find(p=>p.playerId==='Yike').nationalities,undefined);
assert.equal(coverage.names,95);assert.equal(coverage.birthDates,95);assert.equal(coverage.ages,95);assert.equal(coverage.nationalities,92);
assert.equal(allPlayers.find(p=>p.playerId==='Curse').realName.value,'Raí Yamada');
assert.equal(allPlayers.find(p=>p.playerId==='Saint').realName.value,'Kang Seong-in');
assert.equal(allPlayers.find(p=>p.playerId==='Busio').nationalities,undefined);
assert.equal(allPlayers.find(p=>p.playerId==='Dhokla').nationalities,undefined);
for(const [name,games,wins] of [['Kael',16,9],['BrokenBlade',10,9],['Jojopyun',15,9],['Yike',11,4],['kyeahoo',11,4],['Busio',11,4]]){
 const pool=championPool(allPlayers.find(p=>p.playerId===name));
 assert.equal(pool.status,'VERIFIED');assert.equal(pool.snapshotDate,'2026-10-06');
 const postseason=pool.segments.find(s=>/Playoffs|Grand Finals/.test(s.tournament));
 assert.equal(postseason.totalGames,games);assert.equal(postseason.totalWins,wins);
 assert.ok(pool.sources.length>2,'Keep newly reviewed game sources');
}
const source={label:'Test fixture only',url:'https://example.com',checkedAt:'2026-10-05',kind:'OFFICIAL'};
const stats=[{championId:'Zed',championName:'Zed',gamesPlayed:8,wins:6},{championId:'Azir',championName:'Azir',gamesPlayed:8,wins:5},{championId:'Lux',championName:'Lux',gamesPlayed:2,wins:1}];
assert.deepEqual(sortedChampionStats(stats).map(s=>s.championId),['Azir','Zed','Lux']);assert.equal(championWinRate(stats[0]),'75.0%');
const verified={status:'VERIFIED',scopeId:'test',completeness:'COMPLETE',source,stats};validateChampionPool(verified,'test');
const partial={...verified,status:'PARTIAL',completeness:'PARTIAL',reason:'Latest series not yet reviewed'};validateChampionPool(partial,'test');
assert.throws(()=>validateChampionPool({...partial,reason:undefined},'test'),/coverage explanation/);
assert.throws(()=>validateChampionPool({...partial,completeness:'COMPLETE'},'test'),/coverage explanation/);
assert.throws(()=>validateChampionPool(verified,'other'),/scope/);
assert.throws(()=>validateChampionPool({...verified,stats:[{...stats[0],wins:9}]},'test'),/wins/);
assert.throws(()=>validateChampionPool({...verified,status:'UNAVAILABLE'},'test'),/Unverified/);
assert.throws(()=>validateChampionPool({...verified,segments:[{tournament:'Fixture',sourceUrl:source.url,totalGames:19,totalWins:12}]},'test'),/games total/);
// Shared roster/champion UI does not import or render extended biographies.
for(const file of ['components/tournament/roster-strip.tsx','components/tournament/champion-card.tsx','app/page.tsx','app/rankings/page.tsx','app/simulator/page.tsx'])assert.equal(/team-profile|realName|nationalit|birthDate/.test(readFileSync(file,'utf8')),false,file);
console.log('战队档案通过：身份复用、种子与位置、首发待核验、CST 年龄、国旗、真实赛果、英雄统计校验及模块隔离。',coverage);
