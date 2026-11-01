// Display-only official update. Never imported by the frozen strength/odds engine.
import {riotGprSnapshot} from '../sim/gprSnapshot';
export const currentOfficialGpr={
 sourceUrl:'https://lolesports.com/en-US/gpr/2026/current',
 updatedDate:'2026-10-31',sourceDisplayTime:'10/31/26, 5:00 AM',sourceTimeZone:null,
 checkedOn:'2026-11-01',
 entries:{HLE:{rank:1,score:1559},GEN:{rank:1,score:1559},T1:{rank:3,score:1495},BLG:{rank:4,score:1492},DK:{rank:5,score:1459},G2:{rank:6,score:1454},LYON:{rank:7,score:1435},KC:{rank:8,score:1415},TES:{rank:9,score:1402},IG:{rank:11,score:1392},AL:{rank:12,score:1376},TLAW:{rank:13,score:1364},TSW:{rank:15,score:1334},MKOI:{rank:16,score:1322},C9:{rank:16,score:1322},CFO:{rank:21,score:1301},LOS:{rank:24,score:1258},MVK:{rank:28,score:1250},FUR:{rank:30,score:1237}} as Record<string,{rank:number;score:number}>,
} as const;
export function compareGpr(teamId:string){
 const previous=(riotGprSnapshot.entries as Record<string,{rank:number;score:number}>)[teamId]??null,current=currentOfficialGpr.entries[teamId]??null;
 return {previous,current,scoreChange:previous&&current?current.score-previous.score:null,rankChange:previous&&current?previous.rank-current.rank:null};
}
export function signedGprChange(value:number|null){return value===null?'—':value>0?`+${value}`:String(value);}
