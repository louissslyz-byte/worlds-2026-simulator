import {createHash} from 'node:crypto';
import {validateOfficialTournament} from './validate';
import type {LiveMatch} from './schema';

// Object-key ordering and whitespace cannot change this input digest. Collection
// order is normalized separately; draw pool number remains meaningful.
export function canonicalStringify(value:unknown):string{
 if(value===null||typeof value==='string'||typeof value==='boolean')return JSON.stringify(value);
 if(typeof value==='number'){if(!Number.isFinite(value))throw Error('Non-finite canonical input');return JSON.stringify(value);}
 if(Array.isArray(value))return `[${value.map(canonicalStringify).join(',')}]`;
 if(typeof value==='object')return `{${Object.entries(value).sort(([a],[b])=>a.localeCompare(b,'en')).map(([key,v])=>`${JSON.stringify(key)}:${canonicalStringify(v)}`).join(',')}}`;
 throw Error('Unsupported canonical input');
}
function matchFacts(m:LiveMatch){
 return {matchId:m.matchId,stage:m.stage,round:m.round,bracketPosition:m.bracketPosition,teamA:m.teamA,teamB:m.teamB,bestOf:m.bestOf,teamAFrom:m.teamAFrom,teamBFrom:m.teamBFrom,competitionDate:m.competitionDate,competitionTimeZone:m.competitionTimeZone,scheduledAt:m.schedule.scheduledAt,status:m.status,scoreA:m.scoreA,scoreB:m.scoreB,winnerId:m.winnerId,loserId:m.loserId,startedAt:m.startedAt,completedAt:m.completedAt,knownBy:m.evidence.knownBy};
}
export function buildA2FactsInput(input:unknown){
 const {data,state,warnings}=validateOfficialTournament(input),m=data.metadata;
 const facts={schemaVersion:'live-a2-facts-input-v1.0',eventId:m.eventId,snapshotId:m.snapshotId,dataVersion:m.dataVersion,asOf:m.asOf,rulesVersion:m.rulesVersion,
  teamIds:[...data.teamIds].sort(),completedPlayIn:data.matches.playIn.map(matchFacts).sort((a,b)=>a.matchId.localeCompare(b.matchId,'en')),
  swissRound1:data.matches.swiss.map(matchFacts).sort((a,b)=>a.matchId.localeCompare(b.matchId,'en')),
  knownDraws:data.officialDraws.map(d=>({drawId:d.drawId,stage:d.stage,round:d.round,publishedAt:d.publishedAt,publishedDate:d.publishedDate,knownBy:d.evidence.knownBy,pools:d.pools.map(pool=>[...pool].sort()),matchIds:[...d.matchIds].sort()})).sort((a,b)=>a.drawId.localeCompare(b.drawId,'en')),
  swissRound1StartsAt:data.stageSchedule.swissRound1StartsAt,
  state:{...state,completedMatchIds:[...state.completedMatchIds].sort(),eliminatedTeams:[...state.eliminatedTeams].sort()},
 };
 return {facts,inputSHA256:createHash('sha256').update(canonicalStringify(facts)).digest('hex'),warnings};
}
