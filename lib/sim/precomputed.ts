import odds from './precomputedOdds.json';
import {SIMULATION_COUNTS} from './oddsConfig';
import {riotGprSnapshot} from './gprSnapshot';
import {worlds2026} from './worlds2026';
import {createSession} from './engine';
import {SystemRatingProvider} from './ratings';
import {tournamentStateHash} from './oddsMetadata';

export const precomputedOdds: {
 probabilities:Record<string,number>;
 knockoutProbabilities:Record<string,number>;
 iterations:number;
 metadata:typeof odds.metadata;
}=odds;

/** Production pages read this checked-in result; they never run 100k samples on request. */
export function assertPrecomputedOddsCurrent(){
 const currentHash=tournamentStateHash(createSession('SYSTEM_MODEL',new SystemRatingProvider().getRatings(),undefined,2026));
 if(odds.metadata.simulationCount<SIMULATION_COUNTS.production ||
  odds.metadata.modelVersion!==worlds2026.modelVersion ||
  odds.metadata.strengthVersion!==riotGprSnapshot.strengthVersion ||
  odds.metadata.tournamentStateHash!==currentHash){
  throw new Error('Precomputed odds are stale. Run scripts/generate-odds.mjs before building.');
 }
}
