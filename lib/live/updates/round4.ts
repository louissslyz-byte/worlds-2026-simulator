// R4 facts and isolated conditional adapter; draw and match simulation use the existing engine.
import {readFile} from 'node:fs/promises';
import {z} from 'zod';
import {round3FactsSchema,loadRound3Facts,loadRound3History,createSwissRound4Session,type Round3Facts} from './round3';
import {stateSHA256} from './adapter';
import {advance,applyResult,makeMatch} from '../../sim/engine';
import {assertEventCounts,type EventCounts} from '../../sim/validation';
import {tournamentStateHash,tournamentStateInput} from '../../sim/oddsMetadata';
import {probabilitySnapshotSchema} from '../probability/schema';
import {EVENTS,LIVE_ODDS} from '../probability/config';
import {sha256,semanticSHA256,type FrozenSystem} from '../probability/model';
import type {OfficialSnapshot} from '../probability/adapter';
export const ROUND4_ID='worlds-2026-swiss-r4-probability-v1';
export const ROUND4_SEED=20261031;
export const ROUND4_FILES=['lib/live/updates/round4.ts','scripts/generate-live-round4.mjs'] as const;
export const round4FactsSchema=round3FactsSchema.extend({schemaVersion:z.literal('live-swiss-round4-facts-v1.0'),stateLabel:z.literal('SWISS_R4_COMPLETE_R5_DRAW_CONFIRMED'),completedRound:z.literal(4),matches:z.array(round3FactsSchema.shape.matches.element).length(33)});
export type Round4Facts=z.infer<typeof round4FactsSchema>;
export const round4ProbabilitySchema=probabilitySnapshotSchema.extend({schemaVersion:z.literal('live-probability-snapshot-v1.4'),label:z.literal('SWISS-R4-COMPLETE'),stateLabel:z.literal('SWISS_R4_COMPLETE_R5_DRAW_CONFIRMED'),conditionedStateSHA256:z.string().regex(/^[a-f0-9]{64}$/)});
export function round4FactsInput(f:Round4Facts){return {schemaVersion:f.schemaVersion,snapshotId:f.snapshotId,baseSnapshotId:f.baseSnapshotId,baseInputSHA256:f.baseInputSHA256,stateLabel:f.stateLabel,asOf:f.asOf,drawKnownBy:f.drawKnownBy,drawPublishedAt:f.drawPublishedAt,matches:[...f.matches].sort((a,b)=>a.matchId.localeCompare(b.matchId))};}
export function validateRound4Facts(input:unknown,previous:{update:Round3Facts;factsSHA256:string;previous:Awaited<ReturnType<typeof loadRound3Facts>>['previous']}){
 const f=round4FactsSchema.parse(input),base=previous.update;
 if(f.snapshotId!=='worlds-2026-swiss-r4-complete-r5-draw-v1'||f.baseSnapshotId!==base.snapshotId||f.baseInputSHA256!==previous.factsSHA256)throw Error('R4 prior facts mismatch');
 if(Date.parse(f.asOf)<=Date.parse(base.asOf)||Date.parse(f.asOf)>=Date.parse(f.nextRoundStartsAt)||Date.parse(f.drawKnownBy)>Date.parse(f.asOf)||Date.parse(f.sourceCheckedAt)<Date.parse(f.asOf)||f.drawPublishedAt&&Date.parse(f.drawPublishedAt)>Date.parse(f.drawKnownBy))throw Error('R4 historical boundary invalid');
 const sources=new Map(f.sources.map(s=>[s.sourceId,s]));
 if(sources.size!==f.sources.length||f.sources.some(s=>new URL(s.url).hostname!=='lolesports.com'||Date.parse(s.checkedAt)>Date.parse(f.sourceCheckedAt))||!f.sources.some(s=>Date.parse(s.checkedAt)<=Date.parse(f.drawKnownBy)))throw Error('R4 official evidence invalid');
 if(new Set(f.matches.map(m=>m.matchId)).size!==33||new Set(f.matches.map(m=>m.officialMatchId)).size!==33)throw Error('R4 duplicate match');
 const participants=previous.previous.prior.official.state.swissParticipants,records:Record<string,{wins:number;losses:number}>=Object.fromEntries(participants.map(id=>[id,{wins:0,losses:0}]));const past=new Set<string>();
 for(const round of [1,2,3,4,5]){
  const group=f.matches.filter(m=>m.round===round);if(group.length!==(round===5?3:round===4?6:8))throw Error('Invalid round size');
  const active=participants.filter(id=>records[id].wins<3&&records[id].losses<3);
  if(group.flatMap(m=>[m.teamA,m.teamB]).sort().join('|')!==active.slice().sort().join('|'))throw Error('Invalid round participants');
  for(const m of group){
   if(!records[m.teamA]||!records[m.teamB]||m.teamA===m.teamB||m.sourceIds.some(id=>!sources.has(id)))throw Error('R4 identity/source invalid');
   const a=records[m.teamA],b=records[m.teamB],pair=[m.teamA,m.teamB].sort().join('|');
   if(past.has(pair)||a.wins!==b.wins||a.losses!==b.losses)throw Error('R4 record pool/rematch invalid');
   if(m.bestOf!==(a.wins===2||a.losses===2?3:1))throw Error('R4 BO format invalid');
   if(round<=4){
    const old=base.matches.find(x=>x.officialMatchId===m.officialMatchId);if(!old||old.matchId!==m.matchId||old.teamA!==m.teamA||old.teamB!==m.teamB||old.round!==m.round||old.bestOf!==m.bestOf||round<4&&semanticSHA256(old)!==semanticSHA256(m))throw Error('Previous facts/draw changed');
    const needed=(m.bestOf+1)/2;if(m.status!=='COMPLETED'||m.scoreA===null||m.scoreB===null||Math.max(m.scoreA,m.scoreB)!==needed||Math.min(m.scoreA,m.scoreB)>=needed||m.winnerId!==(m.scoreA>m.scoreB?m.teamA:m.teamB))throw Error('R4 score invalid');
    if(m.scheduledAt&&Date.parse(m.scheduledAt)>Date.parse(f.asOf))throw Error('Completed match after cutoff');
   }else if(m.status!=='SCHEDULED'||m.scoreA!==null||m.scoreB!==null||m.winnerId!==null||m.scheduledAt&&Date.parse(m.scheduledAt)<Date.parse(f.nextRoundStartsAt))throw Error('R5 must have no outcome');
  }
  if(round<=4)for(const m of group){records[m.winnerId!].wins++;records[m.winnerId===m.teamA?m.teamB:m.teamA].losses++;past.add([m.teamA,m.teamB].sort().join('|'));}
 }
 if(Object.values(records).filter(r=>r.wins===3).length!==5||Object.values(records).filter(r=>r.losses===3).length!==5||Object.values(records).filter(r=>r.wins===2&&r.losses===2).length!==6)throw Error('R4 standings invalid');
 const times=f.matches.filter(m=>m.round===5&&m.scheduledAt).map(m=>Date.parse(m.scheduledAt!));if(!times.length||Math.min(...times)!==Date.parse(f.nextRoundStartsAt))throw Error('R5 earliest schedule invalid');
 return {update:f,records,factsSHA256:semanticSHA256(round4FactsInput(f))};
}
export async function loadRound4Facts(projectRoot=process.cwd(),verifiedOfficial?:OfficialSnapshot){
 const previous=await loadRound3Facts(projectRoot,verifiedOfficial),bytes=await readFile(`${projectRoot}/lib/live/updates/round4/facts.json`);
 return {...validateRound4Facts(JSON.parse(bytes.toString()),previous),previous,fileSHA256:sha256(bytes)};
}
export function createSwissRound5Session(f:Round4Facts,previous:Awaited<ReturnType<typeof loadRound3Facts>>,model:FrozenSystem){
 const {records}=validateRound4Facts(f,previous);let session=createSwissRound4Session(previous.update,previous.previous,model);
 for(const fact of f.matches.filter(m=>m.round===4)){
  const m=session.tournamentState.matches.find(m=>m.stage==='SWISS'&&m.round===4&&m.teamA===fact.teamA&&m.teamB===fact.teamB);if(!m)throw Error('Known R4 pairing missing');
  session=applyResult(session,m.id,fact.winnerId!,fact.scoreA!,fact.scoreB!,'OFFICIAL');
 }
 session=advance(session);session.tournamentState.matches=session.tournamentState.matches.filter(m=>m.stage!=='SWISS'||m.round!==5);
 for(const [i,m] of f.matches.filter(m=>m.round===5).entries())session.tournamentState.matches.push(makeMatch(session,`s5-${i+1}`,'SWISS',5,'官方瑞士轮第五轮',m.teamA,m.teamB,m.bestOf));session.rngState=session.randomSeed;
 const st=session.tournamentState;if(st.stage!=='SWISS'||st.round!==5||st.matches.length!==39||st.swissQualified.length!==5||st.swissEliminated.length!==5||semanticSHA256(st.swissRecords)!==semanticSHA256(records))throw Error('R5 conditioned state invalid');return session;
}
export function validateRound4Probability(input:unknown,facts:Awaited<ReturnType<typeof loadRound4Facts>>,model:FrozenSystem,generatorSHA:string){
 const s=round4ProbabilitySchema.parse(input),session=createSwissRound5Session(facts.update,facts.previous,model);
 const versions={rulesVersion:model.rulesVersion,stateVersion:model.stateVersion,strengthVersion:model.strengthVersion,modelVersion:model.modelVersion,probabilityModelVersion:model.modelVersion,ratingVersion:model.ratingVersion,ratingInputSHA256:model.ratingInputSHA256,frozenModelSHA256:semanticSHA256(model),rulesSHA256:model.rulesSHA256,engineSourceSHA256:model.engineSourceSHA256,strengthSourceSHA256:model.strengthSourceSHA256,rngVersion:model.rngVersion,samplingVersion:model.samplingVersion,eventDefinitionVersion:LIVE_ODDS.eventDefinitionVersion,generatorSourceSHA256:generatorSHA,generatorVersion:'live-swiss-round4-conditional-v1.0'};
 for(const[k,v]of Object.entries(versions))if(s[k as keyof typeof s]!==v)throw Error('R4 model/version mismatch: '+k);
 if(s.snapshotId!==ROUND4_ID||s.factsSnapshotId!==facts.update.snapshotId||s.factsInputSHA256!==facts.factsSHA256||s.asOf!==facts.update.asOf||s.randomSeed!==ROUND4_SEED||s.sessionSeed!==session.randomSeed||s.revisionOf!==null||s.knownDrawIds.join('|')!=='worlds-2026-swiss-r5-official-draw-v1')throw Error('R4 snapshot binding invalid');
 if(s.tournamentStateHash!==tournamentStateHash(session)||s.simulationInputSHA256!==sha256(tournamentStateInput(session))||s.conditionedStateSHA256!==stateSHA256(session))throw Error('R4 state hash invalid');
 if(s.calculation.method!=='SHARED_ENGINE_RUN'||s.calculation.sourceCacheSHA256!==null||Date.parse(s.generatedAt)<Date.parse(s.asOf)||Date.parse(s.calculation.calculatedAt)>Date.parse(s.generatedAt))throw Error('R4 calculation provenance invalid');
 if(s.teams.map(t=>t.teamId).sort().join('|')!==model.teams.map(t=>t.teamId).sort().join('|'))throw Error('R4 needs all 19 unique teams');
 const counts=Object.fromEntries(EVENTS.map(e=>[e,Object.fromEntries(s.teams.map(t=>[t.teamId,t[`${e}Count`]]))])) as EventCounts;assertEventCounts(counts,s.simulationCount);if(semanticSHA256(counts)!==s.countSHA256)throw Error('R4 count checksum invalid');
 for(const t of s.teams){for(const e of EVENTS)if(t[`${e}Probability`]!==t[`${e}Count`]/s.simulationCount)throw Error('R4 probability/count mismatch');const record=facts.records[t.teamId];if(t.swissCount!==(record?100000:0)||!record&&EVENTS.some(e=>t[`${e}Count`]!==0)||record?.wins===3&&t.knockoutCount!==100000||record?.losses===3&&EVENTS.slice(1).some(e=>t[`${e}Count`]!==0))throw Error('R4 elimination/qualification invalid');}
 return s;
}
export async function loadRound4History(model:FrozenSystem,projectRoot=process.cwd(),verifiedOfficial?:OfficialSnapshot){
 const previous=await loadRound3History(model,projectRoot,verifiedOfficial),facts=await loadRound4Facts(projectRoot,verifiedOfficial),root=`${projectRoot}/lib/live/updates/round4`;
 const index=JSON.parse(await readFile(`${root}/index.json`,'utf8'));
 if(index.schemaVersion!=='live-swiss-round4-index-v1.0'||index.baseHistorySHA256!==sha256(await readFile(`${projectRoot}/lib/live/updates/round3/index.json`))||index.facts.fileSHA256!==facts.fileSHA256||index.facts.factsSHA256!==facts.factsSHA256||previous.factsSHA256!==facts.previous.factsSHA256)throw Error('R4 history/facts lock invalid');
 const auditBytes=await readFile(`${root}/generation-source.json`);if(sha256(auditBytes)!==index.generationSourceSHA256)throw Error('R4 source audit checksum invalid');const audit=JSON.parse(auditBytes.toString());
 const sourceFiles=await Promise.all(ROUND4_FILES.map(async file=>[file,sha256(await readFile(`${projectRoot}/${file}`))]));const sourceSHA=semanticSHA256(sourceFiles);
 if(audit.schemaVersion!=='live-round4-generator-source-v1.0'||audit.generatorSourceSHA256!==sourceSHA||semanticSHA256(audit.sourceFiles)!==sourceSHA)throw Error('R4 generator fingerprint invalid');
 const bytes=await readFile(`${root}/probability.json`);if(sha256(bytes)!==index.snapshot.sha256)throw Error('R4 snapshot file checksum invalid');const snapshot=validateRound4Probability(JSON.parse(bytes.toString()),facts,model,sourceSHA);
 if(snapshot.generatorCommit!==audit.generatorCommit||['snapshotId','label','asOf','countSHA256'].some(k=>index.snapshot[k]!==snapshot[k as keyof typeof snapshot]))throw Error('R4 snapshot index invalid');return {...facts,index,snapshot};
}
