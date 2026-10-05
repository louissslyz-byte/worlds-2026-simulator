import {profileTeams,profileRoster,stage3Scopes,championPool,profileBiographies,regularSeasonRecord} from './data';
import {ageFromBirthDate} from './helpers';
import results from './qualification-results.json';
import type {ChampionPool,RegularSeasonStanding,Source} from './types';

function requireValue(ok:unknown,message:string):asserts ok{if(!ok)throw new Error(message);}
function validateSource(source:Source){
 requireValue(/^https:\/\//.test(source.url)&&source.label&&/^\d{4}-\d{2}-\d{2}$/.test(source.checkedAt),'Invalid profile source');
}
export function validateRegularSeasonStanding(record:RegularSeasonStanding){
 requireValue([record.wins,record.losses,record.rank].every(Number.isInteger)&&record.wins>=0&&record.losses>=0&&record.wins+record.losses>0&&record.rank>0,'Invalid regular season standing');
 requireValue(typeof record.rankTied==='boolean'&&record.scope&&(record.group===null||typeof record.group==='string'),'Invalid regular season scope');
 validateSource(record.source);if(record.recordSource)validateSource(record.recordSource);
 if(record.stageRecord)requireValue([record.stageRecord.wins,record.stageRecord.losses].every(n=>Number.isInteger(n)&&n>=0)&&record.stageRecord.wins<=record.wins&&record.stageRecord.losses<=record.losses,'Invalid regular season stage record');
}
export function validateChampionPool(pool:ChampionPool,expectedScope:string){
 requireValue(pool.scopeId===expectedScope,'Champion pool scope mismatch');
 if(pool.status==='UNAVAILABLE'){requireValue(pool.stats.length===0,'Unverified pool must not publish statistics');return;}
 requireValue(((pool.status==='VERIFIED'&&pool.completeness==='COMPLETE')||(pool.status==='PARTIAL'&&pool.completeness==='PARTIAL'&&Boolean(pool.reason)))&&pool.source,'Verified pool requires a complete source; partial pool requires a coverage explanation');
 validateSource(pool.source);
 requireValue(pool.stats.length>0,'Verified pool cannot be an empty placeholder');
 const champions=new Set<string>();
 for(const stat of pool.stats){
  requireValue(/^[A-Za-z0-9]+$/.test(stat.championId)&&stat.championName&&!champions.has(stat.championId),'Invalid or duplicate champion');
  champions.add(stat.championId);
  requireValue(Number.isInteger(stat.gamesPlayed)&&stat.gamesPlayed>0&&Number.isInteger(stat.wins)&&stat.wins>=0&&stat.wins<=stat.gamesPlayed,'Invalid champion games or wins');
 }
 if(pool.segments){
  requireValue(pool.segments.length>0,'Missing champion pool segments');
  requireValue(pool.stats.reduce((n,s)=>n+s.gamesPlayed,0)===pool.segments.reduce((n,s)=>n+s.totalGames,0),'Champion pool games total mismatch');
  requireValue(pool.stats.reduce((n,s)=>n+s.wins,0)===pool.segments.reduce((n,s)=>n+s.totalWins,0),'Champion pool wins total mismatch');
 }
}
export function validateTeamProfiles(){
 const teamIds=new Set<string>();const playerKeys=new Set<string>();let players=0,names=0,birthDates=0,ages=0,nationalities=0;
 for(const team of profileTeams){
  requireValue(!teamIds.has(team.id),'Duplicate profile team');teamIds.add(team.id);
  requireValue(stage3Scopes[team.region],'Missing regional scope');
  const regular=regularSeasonRecord(team.id);requireValue(regular,'Missing regular season standing');validateRegularSeasonStanding(regular);
  if(team.region==='CBLOL'){
   const series=results.cblolRegularSeason.filter(m=>m.teamA===team.id||m.teamB===team.id);
   requireValue(series.length===7&&new Set(series.map(m=>m.teamA===team.id?m.teamB:m.teamA)).size===7,'Incomplete CBLOL regular season');
   const wins=series.filter(m=>m.teamA===team.id?m.scoreA>m.scoreB:m.scoreB>m.scoreA).length;
   requireValue(wins===regular.wins&&7-wins===regular.losses,'CBLOL standing and match results disagree');
  }
  const roster=profileRoster(team.id);const slugs=new Set<string>();
  requireValue(roster.slots.length===5,'Invalid roster role count');
  for(const {player} of roster.slots){
   if(!player)continue;
   requireValue(!slugs.has(player.slug),'Duplicate player slug');slugs.add(player.slug);
   playerKeys.add(`${team.id}:${player.playerId}`);players++;
   for(const field of [player.realName,player.birthDate,player.reportedAge,player.nationalities]){
    if(field){validateSource(field.source);requireValue(field.source.kind==='OFFICIAL'||/^https:\/\/(?:liquipedia\.net\/leagueoflegends\/|lol\.fandom\.com\/wiki\/)/.test(field.source.url),'Biography field requires an official or trusted wiki source');}
   }
   if(player.realName)names++;
   if(player.birthDate){requireValue(ageFromBirthDate(player.birthDate.value)!==null,'Invalid birth date');birthDates++;ages++;}
   else if(player.reportedAge){requireValue(Number.isInteger(player.reportedAge.value)&&player.reportedAge.value>=0&&player.reportedAge.value<120,'Invalid reported age');ages++;}
   if(player.nationalities){
    if(player.nationalities.value.length>1)requireValue(player.nationalities.source.kind==='OFFICIAL','Multiple nationalities require official confirmation');
    const codes=new Set<string>();requireValue(player.nationalities.value.length>0,'Empty nationality');
    for(const nationality of player.nationalities.value){requireValue(/^[A-Z]{2}$/.test(nationality.countryCode)&&nationality.name&&!codes.has(nationality.countryCode),'Invalid nationality');codes.add(nationality.countryCode);}
    nationalities++;
   }
   validateChampionPool(championPool(player),stage3Scopes[team.region].id);
  }
 }
 for(const key of Object.keys(profileBiographies))requireValue(playerKeys.has(key),`Biography does not match current roster: ${key}`);
 const matchIds=new Set<string>();
 for(const match of [...results.matches,...results.cblolRegularSeason]){
  requireValue(!matchIds.has(match.id),'Duplicate qualification match');matchIds.add(match.id);
  requireValue(match.teamA!==match.teamB&&match.date<=results.checkedAt&&/^\d{4}-\d{2}-\d{2}$/.test(match.date),'Invalid qualification identity or date');
  requireValue([match.scoreA,match.scoreB].every(n=>Number.isInteger(n)&&n>=0)&&[2,3].includes(Math.max(match.scoreA,match.scoreB))&&match.scoreA!==match.scoreB,'Invalid qualification result');
  requireValue(stage3Scopes[match.region].source.url.includes(match.tournamentId),'Qualification tournament scope mismatch');
 }
 return {teams:teamIds.size,players,names,birthDates,ages,nationalities,qualificationSeries:results.matches.length};
}
