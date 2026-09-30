import type {SimulationSession} from './types';
import {riotGprSnapshot} from './gprSnapshot';
import {worlds2026} from './worlds2026';

/** Hash of every input that can affect a conditional simulation. Not a security hash. */
export function tournamentStateHash(session:SimulationSession):string {
 const input=JSON.stringify({strengthSource:session.strengthSource,systemModelVersion:session.systemModelVersion,
  ratingSnapshot:session.ratingSnapshot,tierListSnapshot:session.tierListSnapshot,
  randomSeed:session.randomSeed,tournamentState:session.tournamentState});
 let h=2166136261;
 for(let i=0;i<input.length;i++){h^=input.charCodeAt(i);h=Math.imul(h,16777619)}
 return `${(h>>>0).toString(16).padStart(8,'0')}-${input.length.toString(16)}`;
}

export function strengthVersion(session:SimulationSession):string {
 return session.strengthSource==='CUSTOM_TIER_LIST'
  ?`custom-tier-${session.createdAt}`
  :session.systemModelVersion===worlds2026.modelVersion?riotGprSnapshot.strengthVersion:(session.systemModelVersion??'legacy-system');
}
