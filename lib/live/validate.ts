import {liveTournamentSchema,type LiveTournamentData,type Evidence,type LiveSource,type DerivedOfficialState} from './schema';
import {liveTeams} from './identity';
import {worlds2026} from '../sim/worlds2026';

function requireFact(condition:unknown,message:string):asserts condition{if(!condition)throw Error(`Live validation: ${message}`);}
const sameSet=(a:string[],b:string[])=>a.length===b.length&&new Set(a).size===a.length&&[...a].sort().join('|')===[...b].sort().join('|');
const instant=(value:string)=>Date.parse(value);
// A date-only publication with unknown timezone is bounded conservatively by
// the end of that date at UTC-12. This is an upper bound, not a publication time.
export function publicationUpperBound(source:LiveSource):number|null{
 if(source.publishedAt)return instant(source.publishedAt);
 return source.publishedDate?instant(`${source.publishedDate}T00:00:00.000Z`)+36*3600000:null;
}
export function dateInZone(value:string,timeZone:string){return new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));}
export function formatBeijingTime(value:string|null){return value===null?null:new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value))+' CST';}

export function validateOfficialTournament(input:unknown):{data:LiveTournamentData;state:DerivedOfficialState;warnings:string[]}{
 const data=liveTournamentSchema.parse(input),{metadata:meta}=data,cutoff=instant(meta.asOf);
 requireFact(meta.rulesVersion===worlds2026.rulesVersion,'rules version mismatch');
 requireFact(meta.revisionOf!==meta.snapshotId,'snapshot cannot revise itself');
 requireFact(instant(meta.sourceCheckedAt)>=cutoff,'sourceCheckedAt precedes historical cutoff');
 requireFact(cutoff<instant(data.stageSchedule.swissRound1StartsAt),'POST_PLAY_IN cutoff reaches Swiss');
 requireFact(sameSet(data.teamIds,liveTeams.map(t=>t.id)),'19 unique existing team IDs required');
 const teamById=new Map(liveTeams.map(t=>[t.id,t]));
 for(const t of liveTeams)requireFact(t.logo&&t.region&&t.officialSeed,'incomplete team identity');
 const sources=new Map(data.sources.map(s=>[s.sourceId,s]));
 requireFact(sources.size===data.sources.length,'duplicate source ID');
 for(const s of sources.values()){
  requireFact(instant(s.checkedAt)<=instant(meta.sourceCheckedAt),'source check exceeds metadata');
  if(s.publishedAt){requireFact(instant(s.publishedAt)<=instant(s.checkedAt),'publication after check');if(s.publishedDate)requireFact(s.publishedDate===s.publishedAt.slice(0,10),'publication date mismatch');}
 }
 function evidence(e:Evidence,label:string,claim:LiveSource['supports'][number]){
  requireFact(e.verificationStatus!=='UNVERIFIED',`${label}: unverified fact`);
  requireFact(instant(e.knownBy)<=cutoff,`${label}: future knowledge`);
  requireFact(new Set(e.sourceIds).size===e.sourceIds.length&&new Set(e.temporalSourceIds).size===e.temporalSourceIds.length,`${label}: duplicate source reference`);
  const cited=e.sourceIds.map(id=>{const s=sources.get(id);requireFact(s&&s.accessStatus==='READABLE'&&s.verificationStatus!=='UNVERIFIED',`${label}: missing/unverified source`);return s;});
  if(e.verificationStatus==='OFFICIAL_VERIFIED')requireFact(cited.some(s=>s.sourceType==='OFFICIAL'&&s.verificationStatus==='OFFICIAL_VERIFIED'&&s.supports.includes(claim)),`${label}: no official evidence`);
  else requireFact(cited.length>=2&&new Set(cited.map(s=>new URL(s.sourceUrl).hostname)).size>=2,`${label}: cross verification needs independent sources`);
  for(const id of e.temporalSourceIds){
   requireFact(e.sourceIds.includes(id),`${label}: temporal source not cited`);
   const s=sources.get(id)!;requireFact(s.supports.includes(claim),`${label}: temporal source does not support this fact`);const bound=publicationUpperBound(s);
   requireFact(bound!==null&&bound<=instant(e.knownBy),`${label}: no dated pre-cutoff evidence`);
  }
 }
 const all=[...data.matches.playIn,...data.matches.swiss,...data.matches.knockout],byId=new Map(all.map(m=>[m.matchId,m]));
 requireFact(byId.size===all.length,'duplicate match ID');
 const officials=all.map(m=>m.officialMatchId).filter((x):x is string=>x!==null);
 requireFact(new Set(officials).size===officials.length,'duplicate official match ID');
 for(const m of all){
  requireFact(teamById.has(m.teamA)&&teamById.has(m.teamB)&&m.teamA!==m.teamB,`${m.matchId}: invalid team`);
  requireFact(instant(m.updatedAt)<=instant(meta.sourceCheckedAt),`${m.matchId}: future update timestamp`);
  evidence(m.evidence,m.matchId,m.stage==='PLAY_IN'?'PLAY_IN_RESULTS':'SWISS_DRAW');
  if(m.status==='COMPLETED'){
   const a=m.scoreA,b=m.scoreB,target=(m.bestOf+1)/2;
   requireFact(a!==null&&b!==null&&Math.max(a,b)===target&&Math.min(a,b)<target,`${m.matchId}: invalid completed score`);
   requireFact(m.winnerId===(a>b?m.teamA:m.teamB)&&m.loserId===(a>b?m.teamB:m.teamA),`${m.matchId}: winner/score mismatch`);
   requireFact(m.competitionDate<=dateInZone(meta.asOf,m.competitionTimeZone),`${m.matchId}: future result`);
  }else requireFact(m.scoreA===null&&m.scoreB===null&&m.winnerId===null&&m.loserId===null&&m.startedAt===null&&m.completedAt===null,`${m.matchId}: scheduled match has result`);
  for(const time of [m.startedAt,m.completedAt])if(time)requireFact(instant(time)<=instant(m.evidence.knownBy),`${m.matchId}: future actual event time`);
  if(m.startedAt&&m.completedAt)requireFact(instant(m.startedAt)<=instant(m.completedAt),`${m.matchId}: completion before start`);
  if(m.schedule.scheduledAt===null)requireFact(m.schedule.timeStatus==='TIME_TBD'&&m.schedule.evidence===null&&m.schedule.originalLocalTime===null,`${m.matchId}: unknown time must stay null`);
  else{
   requireFact(m.schedule.timeStatus==='CONFIRMED'&&m.schedule.evidence&&m.schedule.originalLocalTime,`${m.matchId}: schedule missing provenance`);
   evidence(m.schedule.evidence,`${m.matchId} schedule`,'STAGE_SCHEDULE');
   requireFact(m.schedule.originalTimeZone===m.competitionTimeZone&&dateInZone(m.schedule.scheduledAt,m.competitionTimeZone)===m.competitionDate,`${m.matchId}: wrong local competition date`);
   requireFact(m.schedule.originalLocalTime===localMinute(m.schedule.scheduledAt,m.schedule.originalTimeZone),`${m.matchId}: local/UTC mismatch`);
   if(m.status==='SCHEDULED')requireFact(instant(m.schedule.scheduledAt)>cutoff,`${m.matchId}: scheduled time before cutoff`);
   else requireFact(instant(m.schedule.scheduledAt)<=instant(m.evidence.knownBy),`${m.matchId}: completed before scheduled time`);
  }
 }
 // Fixed official fact bracket topology, independent of simulator Match/Session.
 const topology=[
  {position:'UPPER_SEMIFINAL_1',round:1,a:null,b:null},
  {position:'UPPER_SEMIFINAL_2',round:1,a:null,b:null},
  {position:'UPPER_FINAL',round:2,a:[0,'WINNER'],b:[1,'WINNER']},
  {position:'LOWER_SEMIFINAL',round:2,a:[1,'LOSER'],b:[0,'LOSER']},
  {position:'LOWER_FINAL',round:3,a:[2,'LOSER'],b:[3,'WINNER']},
  {position:'QUALIFICATION_FINAL',round:4,a:[2,'WINNER'],b:[4,'WINNER']},
 ] as const;
 const playIn=topology.map(t=>{const found=data.matches.playIn.filter(m=>m.bracketPosition===t.position);requireFact(found.length===1,'missing/duplicate Play-In position');return found[0];});
 const entrants=liveTeams.filter(t=>t.playIn).map(t=>t.id);
 requireFact(sameSet(entrants,['KC','C9','MVK','FUR']),'unexpected existing Play-In identities');
 requireFact(sameSet(playIn.slice(0,2).flatMap(m=>[m.teamA,m.teamB]),entrants),'Play-In entrants mismatch');
 for(const [i,m] of playIn.entries()){
  requireFact(m.competitionTimeZone==='America/Los_Angeles'&&m.competitionDate>='2026-10-15'&&m.competitionDate<='2026-10-18','Play-In date/timezone outside event scope');
  const t=topology[i];requireFact(m.stage==='PLAY_IN'&&m.status==='COMPLETED'&&m.bestOf===5&&m.round===t.round,'Play-In stage/format/status');
  for(const [side,ref] of [['A',t.a],['B',t.b]] as const){
   const from=m[side==='A'?'teamAFrom':'teamBFrom'];
   if(ref===null)requireFact(from===null,'unexpected opening dependency');
   else{
    const parent=playIn[ref[0]],outcome=ref[1];
    requireFact(from?.matchId===parent.matchId&&from.outcome===outcome,`${m.matchId}: invalid bracket dependency`);
    requireFact(m[side==='A'?'teamA':'teamB']===(outcome==='WINNER'?parent.winnerId:parent.loserId),`${m.matchId}: wrong advancing participant`);
    requireFact(m.competitionDate>=parent.competitionDate&&instant(m.evidence.knownBy)>=instant(parent.evidence.knownBy),'Play-In dependency chronology');
    if(m.schedule.scheduledAt&&parent.schedule.scheduledAt)requireFact(instant(m.schedule.scheduledAt)>instant(parent.schedule.scheduledAt),'Play-In schedule dependency chronology');
   }
  }
 }
 const winner=playIn[5].winnerId!;
 const eliminated=[playIn[3].loserId!,playIn[4].loserId!,playIn[5].loserId!];
 requireFact(sameSet([winner,...eliminated],entrants),'one qualifier and three eliminated required');
 evidence(data.officialQualification.evidence,'official qualification','QUALIFICATION');
 requireFact(sameSet([winner],data.officialQualification.qualifiedToSwiss),'derived winner contradicts official qualification');
 const direct=liveTeams.filter(t=>!t.playIn).map(t=>t.id),swiss=[...direct,winner].sort();
 requireFact(direct.length===15&&new Set(swiss).size===16,'15 direct plus one qualifier required');
 const draw=data.officialDraws[0];evidence(draw.evidence,'official Swiss draw','SWISS_DRAW');
 if(draw.publishedAt)requireFact(instant(draw.publishedAt)<=instant(draw.evidence.knownBy),'future draw publication');
 else requireFact(draw.publishedDate<=meta.asOf.slice(0,10),'future draw date');
 const pools=worlds2026.swissDrawPools.map(pool=>pool.map(([region,seed])=>{
  if(region==='PLAY_IN_WINNER')return winner;
  const team=liveTeams.find(t=>!t.playIn&&t.region===region&&t.officialSeed===seed);requireFact(team,'pool identity missing');return team.id;
 }));
 requireFact(draw.pools.every((pool,i)=>sameSet(pool,pools[i])),'official draw conflicts with R1 pools');
 requireFact(sameSet(draw.matchIds,data.matches.swiss.map(m=>m.matchId)),'draw/match references mismatch');
 const seen:string[]=[],poolCounts=[0,0];
 for(const m of data.matches.swiss){
  requireFact(m.stage==='SWISS'&&m.round===1&&m.bestOf===1&&m.bracketPosition==='ROUND_1'&&m.status==='SCHEDULED','POST_PLAY_IN cannot contain Swiss results or later rounds');
  requireFact(m.competitionTimeZone==='America/Chicago','Swiss timezone must be America/Chicago');
  requireFact(m.teamAFrom===null&&m.teamBFrom===null,'Swiss draw is fixed official pairing, not a simulated dependency');
  const a=pools.findIndex(p=>p.includes(m.teamA)),b=pools.findIndex(p=>p.includes(m.teamB));
  requireFact(a>=0&&b>=0&&((a===0&&b===3)||(a===3&&b===0)||(a===1&&b===2)||(a===2&&b===1)),'Swiss first-round pool pairing');
  poolCounts[a===0||a===3?0:1]++;
  requireFact(teamById.get(m.teamA)!.region!==teamById.get(m.teamB)!.region,'Swiss first-round same-region pairing');
  seen.push(m.teamA,m.teamB);
 }
 requireFact(sameSet(seen,swiss)&&poolCounts.every(n=>n===4),'Swiss round must contain all 16 teams exactly once');
 evidence(data.stageSchedule.evidence,'Swiss day-one schedule','STAGE_SCHEDULE');
 requireFact(localMinute(data.stageSchedule.swissRound1StartsAt,data.stageSchedule.originalTimeZone)===data.stageSchedule.originalLocalTime,'Swiss stage timezone mismatch');
 for(const m of data.matches.swiss){requireFact(m.competitionDate===dateInZone(data.stageSchedule.swissRound1StartsAt,'America/Chicago'),'Swiss round-one date mismatch');if(m.schedule.scheduledAt)requireFact(instant(m.schedule.scheduledAt)>=instant(data.stageSchedule.swissRound1StartsAt),'match precedes stage start');}
 const state:DerivedOfficialState={completedMatchIds:playIn.map(m=>m.matchId),qualifiedToSwiss:[winner],eliminatedTeams:eliminated,directToSwiss:[...direct].sort(),swissParticipants:swiss,currentStage:'SWISS',currentRound:1,upcomingMatchIds:data.matches.swiss.map(m=>m.matchId).sort(),swissRecords:Object.fromEntries(swiss.map(id=>[id,{wins:0,losses:0}]))};
 return {data,state,warnings:data.limitations.map(item=>`${item.code}: ${item.description}`)};
}
function localMinute(value:string,timeZone:string){
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(value)).map(p=>[p.type,p.value]));
 return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function deriveOfficialTournamentState(input:unknown):DerivedOfficialState{return validateOfficialTournament(input).state;}
