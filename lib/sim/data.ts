import type { Team,Match } from './types';
import { worlds2026 } from './worlds2026';
// Illustrative candidate roster only. All 2026 qualification slots and seeds must be replaced from official feeds.
export const teams:Team[] = [
 ['GEN','Gen.G','LCK',1,1900],['BLG','Bilibili Gaming','LPL',1,1875],['T1','T1','LCK',2,1850],['HLE','Hanwha Life Esports','LCK',3,1825],
 ['AL','Anyone’s Legend','LPL',2,1805],['G2','G2 Esports','LEC',1,1780],['TES','Top Esports','LPL',3,1755],['FLY','FlyQuest','LCS',1,1730],
 ['CFO','CTBC Flying Oyster','LCP',1,1710],['MKOI','Movistar KOI','LEC',2,1690],['TL','Team Liquid','LCS',2,1680],['PSG','PSG Talon','LCP',2,1665],
 ['FNC','Fnatic','LEC',3,1650],['C9','Cloud9','LCS',3,1635],['GAM','GAM Esports','LCP',3,1620],
 ['PNG','paiN Gaming','CBLOL',1,1600],['RED','RED Canids','CBLOL',2,1575],['DK','Dplus KIA','LCK',4,1660],['JDG','JD Gaming','LPL',4,1670],
 ].map(([id,name,region,seed,rating],i)=>({id:String(id),name:String(name),shortName:String(id),logo:`/team-logos/${String(id).toLowerCase()}.png`,region:String(region),seed:Number(seed),rating:Number(rating),playIn:i>=15,slug:String(id).toLowerCase()}));
export interface EsportsDataProvider { getTeams():Team[]; getMatches():Match[]; getTournament():typeof worlds2026 }
export class StaticDataProvider implements EsportsDataProvider { getTeams(){return teams} getMatches(){return []} getTournament(){return worlds2026} }
export const teamById = (id:string)=>teams.find(t=>t.id===id);
