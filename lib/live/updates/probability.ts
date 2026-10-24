import {readFile} from 'node:fs/promises';
import {z} from 'zod';
import {probabilitySnapshotSchema,type ProbabilitySnapshot} from '../probability/schema';
import {EVENTS,LIVE_ODDS} from '../probability/config';
import {sha256,semanticSHA256,type FrozenSystem} from '../probability/model';
import type {OfficialSnapshot} from '../probability/adapter';
import {assertEventCounts,type EventCounts} from '../../sim/validation';
import {tournamentStateHash,tournamentStateInput} from '../../sim/oddsMetadata';
import {createSwissRound2Session,stateSHA256} from './adapter';
import {loadSwissUpdate,validateSwissUpdate,type SwissUpdate} from './facts';
export const UPDATE_SEED=20261024;
export const UPDATE_ID='worlds-2026-swiss-r1-probability-v1';
export const UPDATE_FILES=['lib/live/updates/facts.ts','lib/live/updates/adapter.ts','lib/live/updates/probability.ts','scripts/generate-live-update.mjs'] as const;
export const updateProbabilitySchema=probabilitySnapshotSchema.extend({label:z.literal('SWISS-R1-COMPLETE'),schemaVersion:z.literal('live-probability-snapshot-v1.1'),conditionedStateSHA256:z.string().regex(/^[a-f0-9]{64}$/),stateLabel:z.literal('SWISS_R1_COMPLETE_R2_DRAW_CONFIRMED')});
export type UpdateProbability=z.infer<typeof updateProbabilitySchema>;
export type ChartSnapshot=Pick<ProbabilitySnapshot,'snapshotId'|'asOf'|'teams'|'simulationCount'> & {label:string};
export async function updateGeneratorSHA256(projectRoot=process.cwd()){
 return semanticSHA256(await Promise.all(UPDATE_FILES.map(async path=>[path,sha256(await readFile(`${projectRoot}/${path}`))])));
}
export function updateCounts(snapshot:UpdateProbability):EventCounts{return Object.fromEntries(EVENTS.map(e=>[e,Object.fromEntries(snapshot.teams.map(t=>[t.teamId,t[`${e}Count`]]))])) as EventCounts;}
export function validateUpdateProbability(input:unknown,update:SwissUpdate,official:OfficialSnapshot,model:FrozenSystem,generatorSHA:string){
 const s=updateProbabilitySchema.parse(input),checked=validateSwissUpdate(update,official),session=createSwissRound2Session(update,official,model);
 const versions={rulesVersion:model.rulesVersion,stateVersion:model.stateVersion,strengthVersion:model.strengthVersion,modelVersion:model.modelVersion,probabilityModelVersion:model.modelVersion,ratingVersion:model.ratingVersion,ratingInputSHA256:model.ratingInputSHA256,frozenModelSHA256:semanticSHA256(model),rulesSHA256:model.rulesSHA256,engineSourceSHA256:model.engineSourceSHA256,strengthSourceSHA256:model.strengthSourceSHA256,rngVersion:model.rngVersion,samplingVersion:model.samplingVersion,eventDefinitionVersion:LIVE_ODDS.eventDefinitionVersion,generatorSourceSHA256:generatorSHA,generatorVersion:'live-swiss-conditional-v1.0'};
 for(const [k,v]of Object.entries(versions))if(s[k as keyof UpdateProbability]!==v)throw Error(`Update model/version mismatch: ${k}`);
 if(s.snapshotId!==UPDATE_ID||s.factsSnapshotId!==update.snapshotId||s.factsInputSHA256!==checked.factsSHA256||s.asOf!==update.asOf||s.randomSeed!==UPDATE_SEED||s.sessionSeed!==session.randomSeed||s.revisionOf!==null||s.knownDrawIds.join('|')!=='worlds-2026-swiss-r2-official-draw-v1')throw Error('Update identity/fact/seed binding mismatch');
 if(s.tournamentStateHash!==tournamentStateHash(session)||s.simulationInputSHA256!==sha256(tournamentStateInput(session))||s.conditionedStateSHA256!==stateSHA256(session))throw Error('Conditioned state checksum mismatch');
 if(s.calculation.method!=='SHARED_ENGINE_RUN'||s.calculation.sourceCacheSHA256!==null||Date.parse(s.generatedAt)<Date.parse(s.asOf)||Date.parse(s.calculation.calculatedAt)>Date.parse(s.generatedAt))throw Error('Update calculation provenance invalid');
 if(s.teams.map(t=>t.teamId).sort().join('|')!==model.teams.map(t=>t.teamId).sort().join('|'))throw Error('All 19 unique teams required');
 const counts=updateCounts(s);assertEventCounts(counts,s.simulationCount);
 if(semanticSHA256(counts)!==s.countSHA256)throw Error('Update count checksum mismatch');
 for(const t of s.teams){
  for(const e of EVENTS)if(t[`${e}Probability`]!==t[`${e}Count`]/s.simulationCount)throw Error('Probability/count mismatch');
  const inSwiss=Object.hasOwn(session.tournamentState.swissRecords,t.teamId);
  if(t.swissCount!==(inSwiss?100000:0)||!inSwiss&&EVENTS.some(e=>t[`${e}Count`]!==0))throw Error('Known elimination/qualification violated');
 }
 return s;
}
export async function loadUpdateHistory(model:FrozenSystem,projectRoot=process.cwd()){
 const facts=await loadSwissUpdate(new URL(`file://${projectRoot}/lib/live/updates/`));
 const read=async(path:string)=>readFile(`${projectRoot}/lib/live/updates/${path}`,'utf8');
 const index=JSON.parse(await read('snapshots/index.json'));
 if(index.schemaVersion!=='live-probability-extension-v1.0'||index.baseHistorySHA256!==sha256(await readFile(`${projectRoot}/lib/live/probability/snapshots/index.json`))||index.snapshots.length!==1)throw Error('History extension/base lock mismatch');
 const snapshots:UpdateProbability[]=[];
 const generatorSHA=await updateGeneratorSHA256(projectRoot);
 for(const e of index.snapshots){
  if(!/^[-a-z0-9]+\.json$/.test(e.file))throw Error('Unsafe update archive path');
  const bytes=await read('snapshots/'+e.file);if(sha256(bytes)!==e.sha256)throw Error('Update snapshot file checksum mismatch');
  const s=validateUpdateProbability(JSON.parse(bytes),facts.update,facts.official,model,generatorSHA);
  if(e.snapshotId!==s.snapshotId||e.countSHA256!==s.countSHA256||e.asOf!==s.asOf||e.label!==s.label)throw Error('Update index mismatch');
  snapshots.push(s);
 }
 return {...facts,index,snapshots};
}
