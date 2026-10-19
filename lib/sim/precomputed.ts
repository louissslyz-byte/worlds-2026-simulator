import odds from './precomputedOdds.json';
import {SIMULATION_COUNTS} from './oddsConfig';
import {riotGprSnapshot} from './gprSnapshot';
import {worlds2026} from './worlds2026';
import {createSession} from './engine';
import {SystemRatingProvider} from './ratings';
import {tournamentStateHash} from './oddsMetadata';
import {assertEventCounts,type EventCounts} from './validation';

type ProbabilityMaps={probabilities:Record<string,number>;swissProbabilities:Record<string,number>;knockoutProbabilities:Record<string,number>;semifinalProbabilities:Record<string,number>;finalProbabilities:Record<string,number>};
export const precomputedOdds:ProbabilityMaps & {counts:EventCounts;iterations:number;metadata:typeof odds.metadata}=odds;

/** All production readers share the corrected, fully audited pre-tournament result. */
export function assertPrecomputedOddsCurrent(candidate:typeof precomputedOdds=precomputedOdds){
 const currentHash=tournamentStateHash(createSession('SYSTEM_MODEL',new SystemRatingProvider().getRatings(),undefined,2026,undefined,'RANDOM'));
 const m=candidate.metadata;
 if(m.simulationCount!==SIMULATION_COUNTS.production||m.requestedCount!==SIMULATION_COUNTS.production||m.failedCount!==0||
  m.classification!=='OFFICIAL_RULES_CORRECTED'||m.modelVersion!==worlds2026.modelVersion||
  m.probabilityModelVersion!==worlds2026.modelVersion||m.strengthVersion!==riotGprSnapshot.strengthVersion||
  m.rulesVersion!==worlds2026.rulesVersion||m.tournamentStateVersion!==worlds2026.tournamentStateVersion||
  m.rngVersion!==worlds2026.rngVersion||m.samplingVersion!==worlds2026.samplingVersion||
  m.initialDrawMode!=='RANDOM'||m.randomSeed!==2026||m.sessionSeed!==2026||m.tournamentStateHash!==currentHash||candidate.iterations!==m.simulationCount){
  throw Error('Precomputed odds are stale or invalid. Run scripts/generate-odds.mjs before building.');
 }
 assertEventCounts(candidate.counts,m.simulationCount);
 const pairs=[['swiss','swissProbabilities'],['knockout','knockoutProbabilities'],['semifinal','semifinalProbabilities'],['final','finalProbabilities'],['champion','probabilities']] as const;
 for(const [event,field]of pairs)for(const [id,n]of Object.entries(candidate.counts[event])){
  if(candidate[field][id]!==n/m.simulationCount)throw Error('Precomputed probabilities do not match integer counts');
 }
}
