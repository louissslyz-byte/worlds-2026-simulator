import {readFile} from 'node:fs/promises';
import {precomputedOdds,assertPrecomputedOddsCurrent} from '../../sim/precomputed';
import {runMonteCarloFromState} from '../../sim/monteCarlo';
import {tournamentStateInput} from '../../sim/oddsMetadata';
import {LIVE_ODDS,EVENTS} from './config';
import {loadFrozenSystem,sha256,generatorSourceSHA256,semanticSHA256} from './model';
import {verifiedA1,createPreTournamentSession,createPostPlayInSession,assertPostPlayInSession} from './adapter';
import {makeSnapshot,compareSnapshots} from './snapshot';

export async function validateR1Baseline(){
 const bytes=await readFile(new URL('../../sim/precomputedOdds.json',import.meta.url));
 if(sha256(bytes)!==LIVE_ODDS.sourceCacheSHA256)throw Error('Original R1 baseline changed');
 assertPrecomputedOddsCurrent();return {odds:precomputedOdds,sha256:sha256(bytes)};
}
export async function generateLiveCandidate(generatorCommit:string,onProgress:(message:string)=>void=()=>{}){
 if(!/^[a-f0-9]{40}$/.test(generatorCommit))throw Error('A committed generator provenance is required');
 const official=await verifiedA1(),{model}=await loadFrozenSystem(),baseline=await validateR1Baseline(),sourceSHA256=await generatorSourceSHA256();
 const preSession=createPreTournamentSession(model),postSession=createPostPlayInSession(official,model),startInput=semanticSHA256(postSession);
 if(baseline.odds.metadata.strengthInputSHA256!==model.ratingInputSHA256||baseline.odds.metadata.engineSourceSHA256!==model.engineSourceSHA256||baseline.odds.metadata.rulesSHA256!==model.rulesSHA256||baseline.odds.metadata.inputSHA256!==sha256(tournamentStateInput(preSession)))throw Error('R1 baseline is not the same frozen pre-tournament experiment');
 const provenance={commit:generatorCommit,sourceSHA256};
 const pre=makeSnapshot('PRE-TOURNAMENT',baseline.odds,preSession,model,official,provenance,baseline.sha256);
 onProgress('PRE: verified and reused the exact R1 100,000-success integer counts for all five events.');
 assertPostPlayInSession(postSession,official,model);onProgress('POST: starting 100,000 simulations with completed Play-In and fixed official Swiss R1.');
 const result=runMonteCarloFromState(postSession,LIVE_ODDS.simulationCount,LIVE_ODDS.post.randomSeed);
 if(semanticSHA256(postSession)!==startInput)throw Error('Monte Carlo mutated its original official starting Session');
 const post=makeSnapshot('POST-PLAY-IN',result,postSession,model,official,provenance,null),comparison=compareSnapshots(pre,post);
 onProgress(`POST: ${result.iterations} successful, zero failures, ${result.metadata.durationMs}ms.`);
 const totals=(snapshot:typeof pre)=>Object.fromEntries(EVENTS.map(event=>[event,snapshot.teams.reduce((sum,t)=>sum+t[`${event}Count`],0)]));
 const audit={schemaVersion:'live-probability-generation-audit-v1.0',generatorCommit,generatorSourceSHA256:sourceSHA256,factsInputSHA256:official.inputSHA256,ratingInputSHA256:model.ratingInputSHA256,
  pre:{method:'REUSED_R1_VERIFIED',sourceCacheSHA256:baseline.sha256,sourceCalculatedAt:baseline.odds.metadata.generatedAt,countsExactlyEqualToR1:true,totalCounts:totals(pre)},
  post:{method:'SHARED_ENGINE_RUN',simulationCount:result.iterations,failedCount:0,durationMs:result.metadata.durationMs,peakProcessRssBytes:post.calculation.peakProcessRssBytes,totalCounts:totals(post)},
  preCountSHA256:pre.countSHA256,postCountSHA256:post.countSHA256,
  conditionalInvariants:'Start validated against A1. Existing engine only simulates undecided matches in current stage; known Play-In is complete/locked and Swiss R1 already materialized. Every final sample passes shared R1 tournament validation.',
  memoryMeasurement:'Node process.resourceUsage().maxRSS * 1024: process-lifetime high-water RSS; not isolated per-iteration memory. Original R1 peak RSS was not recorded.',
 };
 return {pre,post,comparison,audit};
}
