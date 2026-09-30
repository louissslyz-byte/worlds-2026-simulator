import type {Team,Match} from './types';
import {worlds2026} from './worlds2026';
import {RiotGprProvider} from './riotGpr';

// Confirmed identities follow LoL Esports. LPL/LCK/LEC seed order is user supplied;
// LCP seed order follows completed regional results. LCS/CBLOL team-to-seed
// assignments remain placeholders until confirmed. `rating` is the preserved
// fallback input, not an official Riot value.
type RosterRow = [id:string,name:string,region:string,seed:number,rating:number,playIn:boolean,confirmed:boolean];
const roster:RosterRow[] = [
 ['GEN','Gen.G','LCK',1,1900,false,true],
 ['HLE','Hanwha Life Esports','LCK',2,1825,false,true],
 ['T1','T1','LCK',3,1850,false,true],
 ['DK','Dplus KIA','LCK',4,1660,false,true],
 ['AL','Anyone’s Legend','LPL',1,1805,false,true],
 ['BLG','Bilibili Gaming','LPL',2,1875,false,true],
 ['TES','Top Esports','LPL',3,1755,false,true],
 ['IG','Invictus Gaming','LPL',4,1670,false,true],
 ['G2','G2 Esports','LEC',1,1780,false,true],
 ['MKOI','Movistar KOI','LEC',2,1690,false,true],
 ['KC','Karmine Corp','LEC',3,1650,true,true],
 ['TSW','Team Secret Whales','LCP',1,1710,false,true],
 ['CFO','CTBC Flying Oyster','LCP',2,1665,false,true],
 ['MVK','MVK Esports','LCP',3,1620,true,true],
 ['LCS#1','LCS 第 1 种子（待定）','LCS',1,1730,false,false],
 ['LCS#2','LCS 第 2 种子（待定）','LCS',2,1680,false,false],
 ['LCS#3','LCS 第 3 种子（待定）','LCS',3,1635,true,false],
 ['CBLOL#1','CBLOL 第 1 种子（待定）','CBLOL',1,1600,false,false],
 ['CBLOL#2','CBLOL 第 2 种子（待定）','CBLOL',2,1575,true,false],
];
const gpr=new RiotGprProvider();
export const TEAMS_UPDATED_AT='2026-09-29';
export const teams:Team[] = roster.map(([id,name,region,seed,rating,playIn,confirmed])=>{
 const official=gpr.get(id);
 return {id,name,shortName:id,logo:confirmed?`/team-logos/${id.toLowerCase()}.png`:'',
  region,seed,rating,playIn,slug:id.toLowerCase().replace('#','-'),confirmed,
  ...(official?{officialGprRank:official.rank,officialGprScore:official.score,gprUpdatedAt:gpr.updatedAt,gprSource:gpr.source}:{})};
});
export interface EsportsDataProvider { getTeams():Team[]; getMatches():Match[]; getTournament():typeof worlds2026 }
export class StaticDataProvider implements EsportsDataProvider { getTeams(){return teams} getMatches(){return []} getTournament(){return worlds2026} }
export const teamById = (id:string)=>teams.find(t=>t.id===id);
