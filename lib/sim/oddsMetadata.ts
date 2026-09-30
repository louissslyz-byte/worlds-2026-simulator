import type {SimulationSession} from './types';
import {riotGprSnapshot} from './gprSnapshot';
import {worldsTeamSnapshot} from './teamSnapshot';
import {ratingConfig} from './ratingConfig';
import {worlds2026} from './worlds2026';

/** Hash of every input that can affect a conditional simulation. Not a security hash. */
export function tournamentStateHash(session:SimulationSession):string {
 // Match probabilities are derived from ratings. Omitting those floating-point
 // values keeps the cache key identical across Node runtimes and browsers.
 const state=session.tournamentState;
 const input=JSON.stringify({strengthSource:session.strengthSource,systemModelVersion:session.systemModelVersion,
  ratingSnapshot:session.ratingSnapshot,tierListSnapshot:session.tierListSnapshot,
  randomSeed:session.randomSeed,seedAssignments:session.seedAssignments,teamSnapshot:worldsTeamSnapshot,gprSnapshot:riotGprSnapshot,modelParameters:ratingConfig,tournamentState:{stage:state.stage,round:state.round,
   matches:state.matches.map(m=>({id:m.id,stage:m.stage,round:m.round,teamA:m.teamA,teamB:m.teamB,
    format:m.format,scoreA:m.scoreA,scoreB:m.scoreB,winner:m.winner,status:m.status,
    resultSource:m.resultSource,locked:m.locked})),swissRecords:state.swissRecords,
   swissQualified:state.swissQualified,swissEliminated:state.swissEliminated,
   champion:state.champion,playInWinner:state.playInWinner}});
 let h=2166136261;
 for(let i=0;i<input.length;i++){h^=input.charCodeAt(i);h=Math.imul(h,16777619)}
 return `${(h>>>0).toString(16).padStart(8,'0')}-${input.length.toString(16)}`;
}

export function strengthVersion(session:SimulationSession):string {
 return session.strengthSource==='CUSTOM_TIER_LIST'
  ?`custom-tier-${session.createdAt}`
  :session.systemModelVersion===worlds2026.modelVersion?riotGprSnapshot.strengthVersion:(session.systemModelVersion??'legacy-system');
}
