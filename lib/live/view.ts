import {liveTeams} from './identity';
import type {validateOfficialTournament} from './validate';
import type {ChartSnapshot} from './updates/probability';
import type {SwissUpdate} from './updates/facts';
import type {Round2Facts} from './updates/round2';
export const curveEvents=['swiss','knockout','champion'] as const;
export const curveLabels={swiss:'晋级正赛',knockout:'晋级八强',champion:'最终夺冠'};
export const regions=['ALL','LCK','LPL','LEC','LCS','LCP','CBLOL'] as const;
export function fullSnapshotLabel(kind:string){
 const labels:Record<string,string>={'PRE-TOURNAMENT':'赛前','POST-PLAY-IN':'入围赛后','SWISS-R1-COMPLETE':'瑞士轮首轮后','SWISS-R2-COMPLETE':'瑞士轮第二轮后','SWISS-R3-COMPLETE':'瑞士轮第三轮后','SWISS-R4-COMPLETE':'瑞士轮第四轮后','SWISS-R5-COMPLETE':'瑞士轮第五轮后','QUARTERFINALS-COMPLETE':'四分之一决赛后','SEMIFINALS-COMPLETE':'半决赛后','FINAL-COMPLETE':'决赛后'};
 return labels[kind]??kind;
}
export function probabilityText(p:number){return p===0?'0%':p<0.001?'<0.1%':`${(p*100).toFixed(1)}%`;}
export function deltaText(pp:number){if(pp===0)return '0 pp';const digits=Math.abs(pp)<0.1?3:1;return `${pp>0?'+':'−'}${Math.abs(pp).toFixed(digits).replace(/(\.\d*?)0+$/,'$1').replace(/\.$/,'')} pp`;}
export function projectLiveView(official:ReturnType<typeof validateOfficialTournament>,index:{snapshots:{snapshotId:string;label:string;asOf:string}[]},snapshots:ChartSnapshot[]){
 const {data,state}=official;
 return {
  phaseLabel:'入围赛结束 · 瑞士轮尚未开始',swissLabel:'ROUND 1 · 官方抽签对阵（非赛程顺序）',pendingLabel:'ROUND 2–5 · 待抽签',
  asOf:data.metadata.asOf,checkedAt:data.metadata.sourceCheckedAt,stageStartsAt:data.stageSchedule.swissRound1StartsAt,
  sources:data.sources.map(s=>({id:s.sourceId,name:s.sourceName,url:s.sourceUrl,type:s.sourceType})),
  matches:[...data.matches.playIn,...data.matches.swiss].map(m=>({id:m.matchId,stage:m.stage,round:m.round,position:m.bracketPosition,a:m.teamA,b:m.teamB,bestOf:m.bestOf,scoreA:m.scoreA,scoreB:m.scoreB,winner:m.winnerId,status:m.status,time:m.schedule.scheduledAt,date:m.competitionDate as string|null,zone:m.competitionTimeZone})),
  nodes:index.snapshots.map(s=>({id:s.snapshotId,kind:s.label,label:fullSnapshotLabel(s.label),asOf:s.asOf})),
  teams:liveTeams.map(t=>({...t,status:state.eliminatedTeams.includes(t.id)?'已淘汰':'已晋级 Swiss',eliminationNodeIndex:state.eliminatedTeams.includes(t.id)?verifiedEliminationNode(index.snapshots,data.metadata.asOf):null,points:snapshots.map(s=>{const row=s.teams.find(r=>r.teamId===t.id);if(!row)throw Error('Missing chart team');return {snapshotId:s.snapshotId,simulationCount:s.simulationCount,values:Object.fromEntries(curveEvents.map(e=>[e,{count:row[`${e}Count`],probability:row[`${e}Probability`]}])) as Record<typeof curveEvents[number],{count:number;probability:number}>};})})),
 };
}
// Only callers with verified official elimination facts may supply this cutoff.
// An observed zero probability is never elimination evidence.
export function verifiedEliminationNode(nodes:{asOf:string}[],factsAsOf:string){
 const i=nodes.findIndex(n=>Date.parse(n.asOf)>=Date.parse(factsAsOf));
 if(i<0)throw Error('Official elimination has no containing probability snapshot');
 return i;
}
export function applyOfficialEliminations(view:LiveView,ids:string[],factsAsOf:string){
 for(const id of ids){const team=view.teams.find(t=>t.id===id);if(!team)throw Error('Unknown eliminated team');
 const i=verifiedEliminationNode(view.nodes,factsAsOf);
 team.eliminationNodeIndex=team.eliminationNodeIndex===null?i:Math.min(i,team.eliminationNodeIndex);team.status='已淘汰';}
}
export type LiveView=ReturnType<typeof projectLiveView>;
export function visibleTeams(teams:LiveView['teams'],region:string){return teams.filter(t=>region==='ALL'||t.region===region).toSorted((a,b)=>b.points.at(-1)!.values.champion.count-a.points.at(-1)!.values.champion.count||a.id.localeCompare(b.id));}

/** Display projection only; official facts never become a user Simulator session. */
export function projectUpdatedLiveView(official:ReturnType<typeof validateOfficialTournament>,index:{snapshots:{snapshotId:string;label:string;asOf:string}[]},snapshots:ChartSnapshot[],update:SwissUpdate,records:Record<string,{wins:number;losses:number}>){
 const view=projectLiveView(official,index,snapshots);
 view.asOf=update.asOf;view.checkedAt=update.sourceCheckedAt;
 view.phaseLabel='瑞士轮首轮结束 · 第二轮对阵已确认';view.swissLabel='ROUND 1 已结束 · ROUND 2 官方签表已确认';view.pendingLabel='ROUND 3–5 · 待抽签';
 view.sources.push(...update.sources.map(s=>({id:s.sourceId,name:s.sourceId==='swiss'?'LoL Esports · Swiss官方签表与赛果':'LoL Esports · 官方赛程（计划时间）',url:s.url,type:'OFFICIAL' as const})));
 view.matches=[...view.matches.filter(m=>m.stage!=='SWISS'),...update.matches.map(m=>({id:m.matchId,stage:m.stage,round:m.round,position:m.bracketPosition,a:m.teamA,b:m.teamB,bestOf:m.bestOf,scoreA:m.scoreA,scoreB:m.scoreB,winner:m.winnerId,status:m.status,time:m.scheduledAt,date:new Intl.DateTimeFormat('en-CA',{timeZone:m.competitionTimeZone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(m.scheduledAt!)),zone:m.competitionTimeZone}))];
 for(const team of view.teams)if(records[team.id])team.status=`${records[team.id].wins}–${records[team.id].losses}`;
 applyOfficialEliminations(view,Object.keys(records).filter(id=>records[id].losses>=3),update.asOf);
 return view;
}

/** Append today's observed facts to the same presentation, never a user session. */
export function projectRound2LiveView(view:LiveView,update:Round2Facts,records:Record<string,{wins:number;losses:number}>){
 view.asOf=update.asOf;view.checkedAt=update.sourceCheckedAt;
 view.phaseLabel='瑞士轮第二轮结束 · 第三轮对阵已确认';view.swissLabel='ROUND 1–2 已结束 · ROUND 3 官方签表已确认';view.pendingLabel='ROUND 4–5 · 待抽签';
 view.sources=[...view.sources.filter(s=>!['swiss','schedule'].includes(s.id)),...update.sources.map(s=>({id:s.sourceId,name:s.sourceId==='swiss'?'LoL Esports · Swiss官方签表与赛果':'LoL Esports · 官方赛程（计划时间）',url:s.url,type:'OFFICIAL' as const}))];
 view.matches=[...view.matches.filter(m=>m.stage!=='SWISS'),...update.matches.map(m=>({id:m.matchId,stage:m.stage,round:m.round,position:m.bracketPosition,a:m.teamA,b:m.teamB,bestOf:m.bestOf,scoreA:m.scoreA,scoreB:m.scoreB,winner:m.winnerId,status:m.status,time:m.scheduledAt,date:m.scheduledAt?new Intl.DateTimeFormat('en-CA',{timeZone:m.competitionTimeZone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(m.scheduledAt)):null,zone:m.competitionTimeZone}))];
 for(const team of view.teams)if(records[team.id])team.status=`${records[team.id].wins}–${records[team.id].losses}`;
 applyOfficialEliminations(view,Object.keys(records).filter(id=>records[id].losses>=3),update.asOf);
 return view;
}

/** Project verified R3 facts without changing any archived probability or user session. */
export function projectRound3LiveView(view:LiveView,update:import('./updates/round3').Round3Facts,records:Record<string,{wins:number;losses:number}>){
 view.asOf=update.asOf;view.checkedAt=update.sourceCheckedAt;
 view.phaseLabel='瑞士轮第三轮结束 · 第四轮对阵已确认';view.swissLabel='ROUND 1–3 已结束 · ROUND 4 官方签表已确认';view.pendingLabel='ROUND 5 · 待抽签';
 view.sources=[...view.sources.filter(s=>!['swiss','schedule'].includes(s.id)),...update.sources.map(s=>({id:s.sourceId,name:s.sourceId==='swiss'?'LoL Esports · Swiss官方签表与赛果':'LoL Esports · 官方赛程（计划时间）',url:s.url,type:'OFFICIAL' as const}))];
 view.matches=[...view.matches.filter(m=>m.stage!=='SWISS'),...update.matches.map(m=>({id:m.matchId,stage:m.stage,round:m.round,position:m.bracketPosition,a:m.teamA,b:m.teamB,bestOf:m.bestOf,scoreA:m.scoreA,scoreB:m.scoreB,winner:m.winnerId,status:m.status,time:m.scheduledAt,date:m.scheduledAt?new Intl.DateTimeFormat('en-CA',{timeZone:m.competitionTimeZone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(m.scheduledAt)):null,zone:m.competitionTimeZone}))];
 for(const team of view.teams)if(records[team.id])team.status=records[team.id].wins===3?'3–0 · 已晋级八强':`${records[team.id].wins}–${records[team.id].losses}`;
 applyOfficialEliminations(view,Object.keys(records).filter(id=>records[id].losses>=3),update.asOf);
 return view;
}
