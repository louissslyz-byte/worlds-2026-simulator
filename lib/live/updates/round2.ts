// Second-round facts and conditional adapter. All draws/series/MC remain in the frozen engine.
import {readFile} from 'node:fs/promises';
import {z} from 'zod';
import {updateSchema,loadSwissUpdate,type SwissUpdate} from './facts';
import {createSwissRound2Session,stateSHA256} from './adapter';
import {advance,applyResult,makeMatch} from '../../sim/engine';
import {assertEventCounts,type EventCounts} from '../../sim/validation';
import {tournamentStateHash,tournamentStateInput} from '../../sim/oddsMetadata';
import {probabilitySnapshotSchema} from '../probability/schema';
import {EVENTS,LIVE_ODDS} from '../probability/config';
import {sha256,semanticSHA256,type FrozenSystem} from '../probability/model';
import type {OfficialSnapshot} from '../probability/adapter';
export const ROUND2_ID='worlds-2026-swiss-r2-probability-v1';
export const ROUND2_SEED=20261025;
export const ROUND2_FILES=['lib/live/updates/round2.ts','scripts/generate-live-round2.mjs'] as const;
export const round2FactsSchema=updateSchema.extend({schemaVersion:z.literal('live-swiss-round2-facts-v1.0'),stateLabel:z.literal('SWISS_R2_COMPLETE_R3_DRAW_CONFIRMED'),completedRound:z.literal(2),matches:updateSchema.shape.matches.length(24)});
export type Round2Facts=z.infer<typeof round2FactsSchema>;
export const round2ProbabilitySchema=probabilitySnapshotSchema.extend({schemaVersion:z.literal('live-probability-snapshot-v1.2'),label:z.literal('SWISS-R2-COMPLETE'),stateLabel:z.literal('SWISS_R2_COMPLETE_R3_DRAW_CONFIRMED'),conditionedStateSHA256:z.string().regex(/^[a-f0-9]{64}$/)});
export function round2FactsInput(f:Round2Facts){return {schemaVersion:f.schemaVersion,snapshotId:f.snapshotId,baseSnapshotId:f.baseSnapshotId,baseInputSHA256:f.baseInputSHA256,stateLabel:f.stateLabel,asOf:f.asOf,drawKnownBy:f.drawKnownBy,drawPublishedAt:f.drawPublishedAt,matches:[...f.matches].sort((a,b)=>a.matchId.localeCompare(b.matchId))};}
export function validateRound2Facts(input:unknown,prior:{update:SwissUpdate;factsSHA256:string;official:OfficialSnapshot}){
 const f=round2FactsSchema.parse(input),participants=prior.official.state.swissParticipants.slice().sort().join('|');
 if(f.snapshotId!=='worlds-2026-swiss-r2-complete-r3-draw-v1'||f.baseSnapshotId!==prior.update.snapshotId||f.baseInputSHA256!==prior.factsSHA256)throw Error('R2 prior facts mismatch');
 if(Date.parse(f.asOf)<=Date.parse(prior.update.asOf)||Date.parse(f.asOf)>=Date.parse(f.nextRoundStartsAt)||Date.parse(f.drawKnownBy)>Date.parse(f.asOf)||Date.parse(f.sourceCheckedAt)<Date.parse(f.asOf)||f.drawPublishedAt&&Date.parse(f.drawPublishedAt)>Date.parse(f.drawKnownBy))throw Error('R2 historical boundary invalid');
 const sources=new Map(f.sources.map(s=>[s.sourceId,s]));
 if(sources.size!==f.sources.length||f.sources.some(s=>new URL(s.url).hostname!=='lolesports.com'||Date.parse(s.checkedAt)>Date.parse(f.sourceCheckedAt))||!f.sources.some(s=>Date.parse(s.checkedAt)<=Date.parse(f.drawKnownBy)))throw Error('R2 official evidence invalid');
 if(new Set(f.matches.map(m=>m.matchId)).size!==24||new Set(f.matches.map(m=>m.officialMatchId)).size!==24)throw Error('R2 duplicate match');
 const records:Record<string,{wins:number;losses:number}>=Object.fromEntries(prior.official.state.swissParticipants.map(id=>[id,{wins:0,losses:0}]));
 const past=new Set<string>();
 for(const round of [1,2,3]){
  const matches=f.matches.filter(m=>m.round===round);
  if(matches.length!==8||matches.flatMap(m=>[m.teamA,m.teamB]).sort().join('|')!==participants)throw Error('R2 incomplete round/unknown team');
  for(const m of matches){
   if(m.teamA===m.teamB||m.sourceIds.some(id=>!sources.has(id)))throw Error('R2 identity/source invalid');
   const pair=[m.teamA,m.teamB].sort().join('|'),a=records[m.teamA],b=records[m.teamB];
   if(past.has(pair)||a.wins!==b.wins||a.losses!==b.losses)throw Error('R2 record pool/rematch invalid');
   if(m.bestOf!==(a.wins===2||a.losses===2?3:1))throw Error('R2 BO format invalid');
   if(round<=2){
    const old=prior.update.matches.find(x=>x.officialMatchId===m.officialMatchId);
    if(!old||old.matchId!==m.matchId||old.teamA!==m.teamA||old.teamB!==m.teamB||old.round!==m.round||round===1&&semanticSHA256(old)!==semanticSHA256(m))throw Error('Previously known facts/draw changed');
    if(m.status!=='COMPLETED'||m.scoreA===null||m.scoreB===null||![0,1].includes(m.scoreA)||m.scoreA+m.scoreB!==1||m.winnerId!==(m.scoreA?m.teamA:m.teamB))throw Error('R2 result invalid');
    if(m.scheduledAt&&Date.parse(m.scheduledAt)>Date.parse(f.asOf))throw Error('Completed match after cutoff');
   }else if(m.status!=='SCHEDULED'||m.scoreA!==null||m.scoreB!==null||m.winnerId!==null||m.scheduledAt&&Date.parse(m.scheduledAt)<Date.parse(f.nextRoundStartsAt))throw Error('R3 must have no outcome');
  }
  if(round<=2)for(const m of matches){records[m.winnerId!].wins++;records[m.winnerId===m.teamA?m.teamB:m.teamA].losses++;past.add([m.teamA,m.teamB].sort().join('|'));}
 }
 for(const [wins,count] of [[2,4],[1,8],[0,4]])if(Object.values(records).filter(r=>r.wins===wins&&r.wins+r.losses===2).length!==count)throw Error('R2 standings invalid');
 const times=f.matches.filter(m=>m.round===3&&m.scheduledAt).map(m=>Date.parse(m.scheduledAt!));
 if(!times.length||Math.min(...times)!==Date.parse(f.nextRoundStartsAt))throw Error('R3 earliest schedule invalid');
 return {update:f,records,factsSHA256:semanticSHA256(round2FactsInput(f))};
}
export async function loadRound2Facts(projectRoot=process.cwd(),verifiedOfficial?:OfficialSnapshot){
 const prior=await loadSwissUpdate(`${projectRoot}/lib/live/updates`,verifiedOfficial);
 const bytes=await readFile(`${projectRoot}/lib/live/updates/round2/facts.json`);
 return {...validateRound2Facts(JSON.parse(bytes.toString()),prior),prior,fileSHA256:sha256(bytes)};
}
export function createSwissRound3Session(f:Round2Facts,prior:Awaited<ReturnType<typeof loadSwissUpdate>>,model:FrozenSystem){
 const {records}=validateRound2Facts(f,prior);let session=createSwissRound2Session(prior.update,prior.official,model);
 for(const fact of f.matches.filter(m=>m.round===2)){
  const m=session.tournamentState.matches.find(m=>m.stage==='SWISS'&&m.round===2&&m.teamA===fact.teamA&&m.teamB===fact.teamB);
  if(!m)throw Error('Known R2 pairing missing');
  session=applyResult(session,m.id,fact.winnerId!,fact.scoreA!,fact.scoreB!,'OFFICIAL');
 }
 session=advance(session);
 session.tournamentState.matches=session.tournamentState.matches.filter(m=>m.stage!=='SWISS'||m.round!==3);
 for(const [i,m]of f.matches.filter(m=>m.round===3).entries())session.tournamentState.matches.push(makeMatch(session,`s3-${i+1}`,'SWISS',3,'官方瑞士轮第三轮',m.teamA,m.teamB,m.bestOf));
 session.rngState=session.randomSeed;
 const st=session.tournamentState;
 if(st.stage!=='SWISS'||st.round!==3||st.matches.length!==30||st.swissQualified.length||st.swissEliminated.length||semanticSHA256(st.swissRecords)!==semanticSHA256(records))throw Error('R3 conditioned state invalid');
 return session;
}
export function validateRound2Probability(input:unknown,facts:Awaited<ReturnType<typeof loadRound2Facts>>,model:FrozenSystem,generatorSHA:string){
 const s=round2ProbabilitySchema.parse(input),session=createSwissRound3Session(facts.update,facts.prior,model);
 const versions={rulesVersion:model.rulesVersion,stateVersion:model.stateVersion,strengthVersion:model.strengthVersion,modelVersion:model.modelVersion,probabilityModelVersion:model.modelVersion,ratingVersion:model.ratingVersion,ratingInputSHA256:model.ratingInputSHA256,frozenModelSHA256:semanticSHA256(model),rulesSHA256:model.rulesSHA256,engineSourceSHA256:model.engineSourceSHA256,strengthSourceSHA256:model.strengthSourceSHA256,rngVersion:model.rngVersion,samplingVersion:model.samplingVersion,eventDefinitionVersion:LIVE_ODDS.eventDefinitionVersion,generatorSourceSHA256:generatorSHA,generatorVersion:'live-swiss-round2-conditional-v1.0'};
 for(const[k,v]of Object.entries(versions))if(s[k as keyof typeof s]!==v)throw Error('R2 model/version mismatch: '+k);
 if(s.snapshotId!==ROUND2_ID||s.factsSnapshotId!==facts.update.snapshotId||s.factsInputSHA256!==facts.factsSHA256||s.asOf!==facts.update.asOf||s.randomSeed!==ROUND2_SEED||s.sessionSeed!==session.randomSeed||s.revisionOf!==null||s.knownDrawIds.join('|')!=='worlds-2026-swiss-r3-official-draw-v1')throw Error('R2 snapshot binding invalid');
 if(s.tournamentStateHash!==tournamentStateHash(session)||s.simulationInputSHA256!==sha256(tournamentStateInput(session))||s.conditionedStateSHA256!==stateSHA256(session))throw Error('R2 state hash invalid');
 if(s.calculation.method!=='SHARED_ENGINE_RUN'||s.calculation.sourceCacheSHA256!==null||Date.parse(s.generatedAt)<Date.parse(s.asOf)||Date.parse(s.calculation.calculatedAt)>Date.parse(s.generatedAt))throw Error('R2 calculation provenance invalid');
 if(s.teams.map(t=>t.teamId).sort().join('|')!==model.teams.map(t=>t.teamId).sort().join('|'))throw Error('R2 needs all 19 unique teams');
 const counts=Object.fromEntries(EVENTS.map(e=>[e,Object.fromEntries(s.teams.map(t=>[t.teamId,t[`${e}Count`]]))])) as EventCounts;assertEventCounts(counts,s.simulationCount);
 if(semanticSHA256(counts)!==s.countSHA256)throw Error('R2 count checksum invalid');
 for(const t of s.teams){for(const e of EVENTS)if(t[`${e}Probability`]!==t[`${e}Count`]/s.simulationCount)throw Error('R2 probability/count mismatch');const inSwiss=Object.hasOwn(facts.records,t.teamId);if(t.swissCount!==(inSwiss?100000:0)||!inSwiss&&EVENTS.some(e=>t[`${e}Count`]!==0))throw Error('R2 elimination/qualification invalid');}
 return s;
}
export async function loadRound2History(model:FrozenSystem,projectRoot=process.cwd(),verifiedOfficial?:OfficialSnapshot){
 const facts=await loadRound2Facts(projectRoot,verifiedOfficial),root=`${projectRoot}/lib/live/updates/round2`;
 const index=JSON.parse(await readFile(`${root}/index.json`,'utf8'));
 if(index.schemaVersion!=='live-swiss-round2-index-v1.0'||index.baseHistorySHA256!==sha256(await readFile(`${projectRoot}/lib/live/updates/snapshots/index.json`))||index.facts.fileSHA256!==facts.fileSHA256||index.facts.factsSHA256!==facts.factsSHA256)throw Error('R2 history/facts lock invalid');
 const auditBytes=await readFile(`${root}/generation-source.json`);if(sha256(auditBytes)!==index.generationSourceSHA256)throw Error('R2 source audit checksum invalid');
 const audit=JSON.parse(auditBytes.toString());
 const sourceFiles=await Promise.all(ROUND2_FILES.map(async file=>[file,sha256(await readFile(`${projectRoot}/${file}`))]));
 const sourceSHA=semanticSHA256(sourceFiles);if(audit.schemaVersion!=='live-round2-generator-source-v1.0'||audit.generatorSourceSHA256!==sourceSHA||semanticSHA256(audit.sourceFiles)!==sourceSHA)throw Error('R2 generator fingerprint invalid');
 const bytes=await readFile(`${root}/probability.json`);if(sha256(bytes)!==index.snapshot.sha256)throw Error('R2 snapshot file checksum invalid');
 const snapshot=validateRound2Probability(JSON.parse(bytes.toString()),facts,model,sourceSHA);
 if(snapshot.generatorCommit!==audit.generatorCommit||['snapshotId','label','asOf','countSHA256'].some(k=>index.snapshot[k]!==snapshot[k as keyof typeof snapshot]))throw Error('R2 snapshot index invalid');
 return {...facts,index,snapshot};
}
