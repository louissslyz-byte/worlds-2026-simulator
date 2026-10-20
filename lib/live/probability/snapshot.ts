import {assertEventCounts,type EventCounts} from '../../sim/validation';
import {tournamentStateInput,tournamentStateHash} from '../../sim/oddsMetadata';
import type {SimulationSession} from '../../sim/types';
import {probabilitySnapshotSchema,type ProbabilitySnapshot} from './schema';
import {sha256,semanticSHA256,type FrozenSystem,assertFrozenSystem} from './model';
import {createPreTournamentSession,createPostPlayInSession,type OfficialSnapshot} from './adapter';
import {EVENTS,LIVE_ODDS} from './config';
export type MonteCarloResult={counts:EventCounts;iterations:number;metadata:{simulationCount:number;requestedCount:number;failedCount:number;generatedAt:string;durationMs:number;rulesVersion:string;modelVersion:string;strengthVersion:string;randomSeed:number;sessionSeed:number;tournamentStateHash:string}};
export function countsFromSnapshot(snapshot:ProbabilitySnapshot):EventCounts{
 return Object.fromEntries(EVENTS.map(event=>[event,Object.fromEntries(snapshot.teams.map(t=>[t.teamId,t[`${event}Count`]]))])) as EventCounts;
}
export function makeSnapshot(label:ProbabilitySnapshot['label'],result:MonteCarloResult,session:SimulationSession,model:FrozenSystem,official:OfficialSnapshot,provenance:{commit:string;sourceSHA256:string},sourceCacheSHA256:string|null):ProbabilitySnapshot{
 if(result.iterations!==LIVE_ODDS.simulationCount||result.metadata.simulationCount!==LIVE_ODDS.simulationCount||result.metadata.requestedCount!==LIVE_ODDS.simulationCount||result.metadata.failedCount!==0)throw Error('Incomplete Monte Carlo cannot become a snapshot');
 assertEventCounts(result.counts,LIVE_ODDS.simulationCount);
 const pre=label==='PRE-TOURNAMENT',config=pre?LIVE_ODDS.pre:LIVE_ODDS.post;
 if(result.metadata.rulesVersion!==model.rulesVersion||result.metadata.modelVersion!==model.modelVersion||result.metadata.strengthVersion!==model.strengthVersion||result.metadata.randomSeed!==config.randomSeed||result.metadata.sessionSeed!==config.sessionSeed||result.metadata.tournamentStateHash!==tournamentStateHash(session))throw Error('Monte Carlo result belongs to different model/state/seed');
 const snapshot=probabilitySnapshotSchema.parse({schemaVersion:'live-probability-snapshot-v1.0',snapshotId:config.id,label,asOf:config.asOf,revisionOf:null,
  conditioningDescription:pre?'R1 pre-tournament baseline: 19 teams; unknown Play-In draw/results and unknown Swiss R1 draw. Timeline anchor is before first series, not a claim to include every public draw then known.':'All six verified Play-In results AND the published Swiss R1 draw, through A1 historical cutoff. Strength remains frozen; Swiss results unknown.',
  factsSnapshotId:pre?null:official.data.metadata.snapshotId,factsInputSHA256:pre?null:official.inputSHA256,knownDrawIds:pre?[]:official.data.officialDraws.map(d=>d.drawId).sort(),
  rulesVersion:model.rulesVersion,stateVersion:model.stateVersion,strengthVersion:model.strengthVersion,modelVersion:model.modelVersion,probabilityModelVersion:model.modelVersion,ratingVersion:model.ratingVersion,ratingInputSHA256:model.ratingInputSHA256,frozenModelSHA256:semanticSHA256(model),rulesSHA256:model.rulesSHA256,engineSourceSHA256:model.engineSourceSHA256,strengthSourceSHA256:model.strengthSourceSHA256,rngVersion:model.rngVersion,samplingVersion:model.samplingVersion,eventDefinitionVersion:LIVE_ODDS.eventDefinitionVersion,
  simulationCount:result.iterations,requestedCount:result.metadata.requestedCount,completedCount:result.iterations,failedCount:result.metadata.failedCount,randomSeed:config.randomSeed,sessionSeed:config.sessionSeed,
  tournamentStateHash:tournamentStateHash(session),simulationInputSHA256:sha256(tournamentStateInput(session)),countSHA256:semanticSHA256(result.counts),
  generatedAt:new Date().toISOString(),generatorVersion:LIVE_ODDS.generatorVersion,generatorCommit:provenance.commit,generatorSourceSHA256:provenance.sourceSHA256,
  calculation:{method:pre?'REUSED_R1_VERIFIED':'SHARED_ENGINE_RUN',calculatedAt:result.metadata.generatedAt,durationMs:result.metadata.durationMs,peakProcessRssBytes:pre?null:process.resourceUsage().maxRSS*1024,sourceCacheSHA256},
  teams:model.teams.map(t=>({teamId:t.teamId,...Object.fromEntries(EVENTS.flatMap(event=>[[`${event}Count`,result.counts[event][t.teamId]],[`${event}Probability`,result.counts[event][t.teamId]/result.iterations]]))})),
 });
 validateProbabilitySnapshot(snapshot,model,official,provenance.sourceSHA256);return snapshot;
}
export function validateProbabilitySnapshot(input:unknown,model:FrozenSystem,official:OfficialSnapshot,expectedGeneratorSHA256:string):ProbabilitySnapshot{
 const snapshot=probabilitySnapshotSchema.parse(input);assertFrozenSystem(model);
 const common={rulesVersion:model.rulesVersion,stateVersion:model.stateVersion,strengthVersion:model.strengthVersion,modelVersion:model.modelVersion,probabilityModelVersion:model.modelVersion,ratingVersion:model.ratingVersion,ratingInputSHA256:model.ratingInputSHA256,frozenModelSHA256:semanticSHA256(model),rulesSHA256:model.rulesSHA256,engineSourceSHA256:model.engineSourceSHA256,strengthSourceSHA256:model.strengthSourceSHA256,rngVersion:model.rngVersion,samplingVersion:model.samplingVersion,eventDefinitionVersion:LIVE_ODDS.eventDefinitionVersion,generatorVersion:LIVE_ODDS.generatorVersion,generatorSourceSHA256:expectedGeneratorSHA256};
 for(const [key,expected] of Object.entries(common))if(snapshot[key as keyof ProbabilitySnapshot]!==expected)throw Error(`Live snapshot version mismatch: ${key}`);
 const pre=snapshot.label==='PRE-TOURNAMENT',config=pre?LIVE_ODDS.pre:LIVE_ODDS.post;
 const session=pre?createPreTournamentSession(model):createPostPlayInSession(official,model);
 if(snapshot.snapshotId!==config.id||snapshot.asOf!==config.asOf||snapshot.revisionOf!==null||snapshot.randomSeed!==config.randomSeed||snapshot.sessionSeed!==config.sessionSeed)throw Error('Snapshot identity/time/seed mismatch');
 if(Date.parse(snapshot.generatedAt)<Date.parse(snapshot.asOf)||Date.parse(snapshot.calculation.calculatedAt)>Date.parse(snapshot.generatedAt))throw Error('Snapshot generation chronology invalid');
 const expectedIds=model.teams.map(t=>t.teamId).sort(),actualIds=snapshot.teams.map(t=>t.teamId).sort();
 if(actualIds.join('|')!==expectedIds.join('|'))throw Error('Snapshot must retain all 19 unique team IDs');
 const counts=countsFromSnapshot(snapshot);assertEventCounts(counts,snapshot.simulationCount);
 if(snapshot.countSHA256!==semanticSHA256(counts))throw Error('Snapshot integer-count checksum mismatch');
 for(const team of snapshot.teams)for(const event of EVENTS)if(team[`${event}Probability`]!==team[`${event}Count`]/snapshot.simulationCount)throw Error('Probability/denominator mismatch');
 if(pre){
  if(snapshot.factsSnapshotId!==null||snapshot.factsInputSHA256!==null||snapshot.knownDrawIds.length||snapshot.calculation.method!=='REUSED_R1_VERIFIED'||snapshot.calculation.sourceCacheSHA256!==LIVE_ODDS.sourceCacheSHA256)throw Error('Pre-tournament snapshot contains later facts or incorrect baseline provenance');
 }else{
  if(snapshot.factsSnapshotId!==official.data.metadata.snapshotId||snapshot.factsInputSHA256!==official.inputSHA256||snapshot.factsInputSHA256!==LIVE_ODDS.factsInputSHA256||snapshot.asOf!==official.data.metadata.asOf||snapshot.knownDrawIds.join('|')!==official.data.officialDraws.map(d=>d.drawId).sort().join('|')||snapshot.calculation.method!=='SHARED_ENGINE_RUN'||snapshot.calculation.sourceCacheSHA256!==null)throw Error('Post snapshot official condition mismatch');
  for(const team of snapshot.teams){
   const qualified=Object.hasOwn(session.tournamentState.swissRecords,team.teamId);
   if(team.swissCount!==(qualified?snapshot.simulationCount:0)||!qualified&&EVENTS.some(event=>team[`${event}Count`]!==0))throw Error('Known Swiss qualification/elimination not respected');
  }
 }
 if(snapshot.tournamentStateHash!==tournamentStateHash(session)||snapshot.simulationInputSHA256!==sha256(tournamentStateInput(session)))throw Error('Snapshot starting-state hash mismatch');
 return snapshot;
}
export function compareSnapshots(pre:ProbabilitySnapshot,post:ProbabilitySnapshot){
 const keys=['rulesVersion','stateVersion','modelVersion','probabilityModelVersion','strengthVersion','ratingVersion','ratingInputSHA256','frozenModelSHA256','rulesSHA256','engineSourceSHA256','strengthSourceSHA256','rngVersion','samplingVersion','eventDefinitionVersion','simulationCount'] as const;
 if(pre.label!=='PRE-TOURNAMENT'||post.label!=='POST-PLAY-IN'||Date.parse(pre.asOf)>=Date.parse(post.asOf)||keys.some(key=>pre[key]!==post[key]))throw Error('Snapshots are not comparable');
 if(pre.teams.map(t=>t.teamId).sort().join('|')!==post.teams.map(t=>t.teamId).sort().join('|'))throw Error('Snapshot team identities differ');
 return {schemaVersion:'live-probability-comparison-v1.0',preSnapshotId:pre.snapshotId,postSnapshotId:post.snapshotId,unit:'PERCENTAGE_POINTS',conditioning:'Play-In results plus known Swiss R1 draw; no strength update',
  teams:pre.teams.map(a=>{const b=post.teams.find(t=>t.teamId===a.teamId)!;return {teamId:a.teamId,events:Object.fromEntries(EVENTS.map(event=>[event,{preCount:a[`${event}Count`],postCount:b[`${event}Count`],preProbability:a[`${event}Probability`],postProbability:b[`${event}Probability`],deltaPercentagePoints:(b[`${event}Count`]-a[`${event}Count`])*100/pre.simulationCount}]))};}),
 };
}
