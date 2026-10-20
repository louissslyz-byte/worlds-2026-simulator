import {liveTeams} from './identity';
import type {validateOfficialTournament} from './validate';
import type {ProbabilitySnapshot,ProbabilityHistoryIndex} from './probability/schema';
export const curveEvents=['swiss','knockout','champion'] as const;
export const curveLabels={swiss:'晋级正赛',knockout:'晋级八强',champion:'最终夺冠'};
export const regions=['ALL','LCK','LPL','LEC','LCS','LCP','CBLOL'] as const;
export function probabilityText(p:number){return p===0?'0%':p<0.001?'<0.1%':`${(p*100).toFixed(1)}%`;}
export function deltaText(pp:number){if(pp===0)return '0 pp';const digits=Math.abs(pp)<0.1?3:1;return `${pp>0?'+':'−'}${Math.abs(pp).toFixed(digits).replace(/(\.\d*?)0+$/,'$1').replace(/\.$/,'')} pp`;}
export function projectLiveView(official:ReturnType<typeof validateOfficialTournament>,index:ProbabilityHistoryIndex,snapshots:ProbabilitySnapshot[]){
 const {data,state}=official;
 return {
  asOf:data.metadata.asOf,checkedAt:data.metadata.sourceCheckedAt,stageStartsAt:data.stageSchedule.swissRound1StartsAt,
  sources:data.sources.map(s=>({id:s.sourceId,name:s.sourceName,url:s.sourceUrl,type:s.sourceType})),
  matches:[...data.matches.playIn,...data.matches.swiss].map(m=>({id:m.matchId,stage:m.stage,round:m.round,position:m.bracketPosition,a:m.teamA,b:m.teamB,bestOf:m.bestOf,scoreA:m.scoreA,scoreB:m.scoreB,winner:m.winnerId,status:m.status,time:m.schedule.scheduledAt,date:m.competitionDate,zone:m.competitionTimeZone})),
  nodes:index.snapshots.map(s=>({id:s.snapshotId,label:s.label==='PRE-TOURNAMENT'?'赛前':s.label==='POST-PLAY-IN'?'入围赛后':s.label,asOf:s.asOf})),
  teams:liveTeams.map(t=>({...t,status:state.eliminatedTeams.includes(t.id)?'已淘汰':'已晋级 Swiss',points:snapshots.map(s=>{const row=s.teams.find(r=>r.teamId===t.id);if(!row)throw Error('Missing chart team');return {snapshotId:s.snapshotId,simulationCount:s.simulationCount,values:Object.fromEntries(curveEvents.map(e=>[e,{count:row[`${e}Count`],probability:row[`${e}Probability`]}])) as Record<typeof curveEvents[number],{count:number;probability:number}>};})})),
 };
}
export type LiveView=ReturnType<typeof projectLiveView>;
export function visibleTeams(teams:LiveView['teams'],region:string){return teams.filter(t=>region==='ALL'||t.region===region).toSorted((a,b)=>b.points.at(-1)!.values.champion.count-a.points.at(-1)!.values.champion.count||a.id.localeCompare(b.id));}
