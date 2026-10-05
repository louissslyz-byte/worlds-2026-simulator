import {worldsTeamSnapshot} from '../sim/teamSnapshot';
import {playerRoles,teamRosters} from '../sim/rosters';
import {additionalRosters,biographies,official,officialRosterSources,secondary} from './snapshot';
import results from './qualification-results.json';
import poolsSnapshot from './champion-pools.json';
import regularSnapshot from './regular-season.json';
import supplementalSnapshot from './supplemental-biographies.json';
import {playerSlug} from './helpers';
import type {ChampionPool,PlayerBiography,ProfilePlayer,QualificationStep,RegularSeasonStanding,Stage3Scope} from './types';

// Supplement missing fields only; preserve previously verified official values.
const supplements=supplementalSnapshot.biographies as Record<string,PlayerBiography>;
export const profileBiographies:Readonly<Record<string,PlayerBiography>>=Object.fromEntries(
 [...new Set([...Object.keys(biographies),...Object.keys(supplements)])].map(key=>[key,{...supplements[key],...biographies[key]}]),
);

// Only objective identity fields cross into this module; internal strength and
// configurable simulation seeds are deliberately not part of its public view.
export const profileTeams=worldsTeamSnapshot.filter(t=>t.confirmed).map(t=>({
 id:t.id,name:t.name,shortName:t.shortName,slug:t.slug,region:t.region,logo:t.logo,
 worldsSeed:t.officialSeed,sourceUrl:t.sourceUrl,
}));
export const profileRegions=['LCK','LPL','LEC','LCP','LCS','CBLOL'] as const;
export function teamsByRegion(region:string){
 return profileTeams.filter(t=>t.region===region).sort((a,b)=>(a.worldsSeed??Infinity)-(b.worldsSeed??Infinity)||a.shortName.localeCompare(b.shortName,'en'));
}
export function profileRoster(teamId:string){
 const existing=teamRosters[teamId];const extra=additionalRosters[teamId];
 const names=existing?.players??extra?.players;
 const source=existing?(officialRosterSources[teamId]??secondary('现有公开阵容 · Liquipedia',existing.source)):extra?.source;
 const slots=playerRoles.map((role,i)=>{
  const playerId=names?.[i];
  const player:ProfilePlayer|null=playerId?{id:`${teamId}:${role.key}`,slug:playerSlug(playerId),playerId,teamId,role:role.key,...profileBiographies[`${teamId}:${playerId}`]}:null;
  return {role,player};
 });
 return {slots,source,note:extra?.note??'当前公开阵容；Worlds 正式登记名单与首发仍待核验。'};
}
export function qualificationPath(teamId:string):QualificationStep[]{
 return results.matches.filter(m=>m.teamA===teamId||m.teamB===teamId).map(m=>{
  const isA=m.teamA===teamId;
  return {stage:m.stage,date:m.date,opponent:isA?m.teamB:m.teamA,score:(isA?[m.scoreA,m.scoreB]:[m.scoreB,m.scoreA]) as [number,number],source:official('LoL Esports 官方赛程',m.sourceUrl)};
 });
}
export function regularSeasonRecord(teamId:string):RegularSeasonStanding|null{
 return (regularSnapshot.records as Record<string,RegularSeasonStanding>)[teamId]??null;
}
export function regularSeasonSummary(record:RegularSeasonStanding){
 const placement=`${record.group?`${record.group} · `:''}${record.rankTied?'并列':''}第 ${record.rank} 名`;
 return `${record.wins} 胜 ${record.losses} 负 · ${placement}`;
}
const excluded=['Worlds','MSI','First Stand','前两个赛段','Esports World Cup','KeSPA Cup','其他杯赛'];
export const stage3Scopes:Readonly<Record<string,Stage3Scope>>={
 LCK:{id:'lck-2026-stage3',region:'LCK',label:'2026 LCK 第三赛段',includes:['Rounds 3–4','Season Play-In','Season Playoffs'],excludes:excluded,status:'VERIFIED',source:official('Riot 第三赛段赛事页','https://lolesports.com/en-US/tournament/115548147890329817/overview')},
 LPL:{id:'lpl-2026-stage3',region:'LPL',label:'2026 LPL 第三赛段及区域资格赛',includes:['常规赛','季后赛资格赛','季后赛','区域资格赛'],excludes:excluded,status:'VERIFIED',source:official('Riot 第三赛段赛事页','https://lolesports.com/en-US/tournament/115616254668930796/overview')},
 LEC:{id:'lec-2026-summer',region:'LEC',label:'2026 LEC Summer',includes:['常规赛','季后赛'],excludes:excluded,status:'VERIFIED',source:official('Riot 第三赛段赛事页','https://lolesports.com/en-US/tournament/115548681802226458/overview')},
 LCS:{id:'lcs-2026-summer',region:'LCS',label:'2026 LCS Summer',includes:['常规赛','季后赛'],excludes:excluded,status:'VERIFIED',source:official('Riot 第三赛段赛事页','https://lolesports.com/en-US/tournament/115564797158840434/overview')},
 LCP:{id:'lcp-2026-split3',region:'LCP',label:'2026 LCP Split 3',includes:['瑞士轮','资格赛','季后赛'],excludes:excluded,status:'VERIFIED',source:official('Riot 第三赛段赛事页','https://lolesports.com/en-US/tournament/115570728597462574/overview')},
 CBLOL:{id:'cblol-2026-split2',region:'CBLOL',label:'2026 CBLOL Split 2 / Etapa 2',includes:['常规赛','季后赛（截至资料核对日）'],excludes:excluded,status:'VERIFIED',source:official('Riot 第三赛段赛事页','https://lolesports.com/en-GB/tournament/115565671525288828/overview')},
};
export function championPool(player:ProfilePlayer):ChampionPool{
 const region=profileTeams.find(t=>t.id===player.teamId)!.region;
 const pools=poolsSnapshot.pools as Record<string,ChampionPool>;
 return pools[player.id]??{status:'UNAVAILABLE',scopeId:stage3Scopes[region].id,source:null,completeness:'UNVERIFIED',stats:[],reason:poolsSnapshot.availability.reason};
}
