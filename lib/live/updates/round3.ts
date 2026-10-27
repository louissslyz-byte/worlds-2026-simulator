// R3 facts and isolated conditional adapter; draw and match simulation use the existing engine.
import {readFile} from 'node:fs/promises';
import {z} from 'zod';
import {round2FactsSchema,loadRound2Facts,loadRound2History,createSwissRound3Session,type Round2Facts} from './round2';
import {stateSHA256} from './adapter';
import {advance,applyResult,makeMatch} from '../../sim/engine';
import {assertEventCounts,type EventCounts} from '../../sim/validation';
import {tournamentStateHash,tournamentStateInput} from '../../sim/oddsMetadata';
import {probabilitySnapshotSchema} from '../probability/schema';
import {EVENTS,LIVE_ODDS} from '../probability/config';
import {sha256,semanticSHA256,type FrozenSystem} from '../probability/model';
import type {OfficialSnapshot} from '../probability/adapter';
export const ROUND3_ID='worlds-2026-swiss-r3-probability-v1';
export const ROUND3_SEED=20261027;
export const ROUND3_FILES=['lib/live/updates/round3.ts','scripts/generate-live-round3.mjs'] as const;
export const round3FactsSchema=round2FactsSchema.extend({schemaVersion:z.literal('live-swiss-round3-facts-v1.0'),stateLabel:z.literal('SWISS_R3_COMPLETE_R4_DRAW_CONFIRMED'),completedRound:z.literal(3),matches:z.array(round2FactsSchema.shape.matches.element).length(30)});
export type Round3Facts=z.infer<typeof round3FactsSchema>;
export const round3ProbabilitySchema=probabilitySnapshotSchema.extend({schemaVersion:z.literal('live-probability-snapshot-v1.3'),label:z.literal('SWISS-R3-COMPLETE'),stateLabel:z.literal('SWISS_R3_COMPLETE_R4_DRAW_CONFIRMED'),conditionedStateSHA256:z.string().regex(/^[a-f0-9]{64}$/)});
export function round3FactsInput(f:Round3Facts){return {schemaVersion:f.schemaVersion,snapshotId:f.snapshotId,baseSnapshotId:f.baseSnapshotId,baseInputSHA256:f.baseInputSHA256,stateLabel:f.stateLabel,asOf:f.asOf,drawKnownBy:f.drawKnownBy,drawPublishedAt:f.drawPublishedAt,matches:[...f.matches].sort((a,b)=>a.matchId.localeCompare(b.matchId))};}
export function validateRound3Facts(input:unknown,previous:{update:Round2Facts;factsSHA256:string;prior:Awaited<ReturnType<typeof loadRound2Facts>>['prior']}){
 const f=round3FactsSchema.parse(input),base=previous.update;
 if(f.snapshotId!=='worlds-2026-swiss-r3-complete-r4-draw-v1'||f.baseSnapshotId!==base.snapshotId||f.baseInputSHA256!==previous.factsSHA256)throw Error('R3 prior facts mismatch');
 if(Date.parse(f.asOf)<=Date.parse(base.asOf)||Date.parse(f.asOf)>=Date.parse(f.nextRoundStartsAt)||Date.parse(f.drawKnownBy)>Date.parse(f.asOf)||Date.parse(f.sourceCheckedAt)<Date.parse(f.asOf)||f.drawPublishedAt&&Date.parse(f.drawPublishedAt)>Date.parse(f.drawKnownBy))throw Error('R3 historical boundary invalid');
 const sources=new Map(f.sources.map(s=>[s.sourceId,s]));
 if(sources.size!==f.sources.length||f.sources.some(s=>new URL(s.url).hostname!=='lolesports.com'||Date.parse(s.checkedAt)>Date.parse(f.sourceCheckedAt))||!f.sources.some(s=>Date.parse(s.checkedAt)<=Date.parse(f.drawKnownBy)))throw Error('R3 official evidence invalid');
 if(new Set(f.matches.map(m=>m.matchId)).size!==30||new Set(f.matches.map(m=>m.officialMatchId)).size!==30)throw Error('R3 duplicate match');
 const participants=previous.prior.official.state.swissParticipants,records:Record<string,{wins:number;losses:number}>=Object.fromEntries(participants.map(id=>[id,{wins:0,losses:0}]));const past=new Set<string>();
 for(const round of [1,2,3,4]){
  const group=f.matches.filter(m=>m.round===round);if(group.length!==(round===4?6:8))throw Error('Invalid round size');
  const active=participants.filter(id=>records[id].wins<3&&records[id].losses<3);
  if(group.flatMap(m=>[m.teamA,m.teamB]).sort().join('|')!==active.slice().sort().join('|'))throw Error('Invalid round participants');
  for(const m of group){
   if(!records[m.teamA]||!records[m.teamB]||m.teamA===m.teamB||m.sourceIds.some(id=>!sources.has(id)))throw Error('R3 identity/source invalid');
   const a=records[m.teamA],b=records[m.teamB],pair=[m.teamA,m.teamB].sort().join('|');
   if(past.has(pair)||a.wins!==b.wins||a.losses!==b.losses)throw Error('R3 record pool/rematch invalid');
   if(m.bestOf!==(a.wins===2||a.losses===2?3:1))throw Error('R3 BO format invalid');
   if(round<=3){
    const old=base.matches.find(x=>x.officialMatchId===m.officialMatchId);if(!old||old.matchId!==m.matchId||old.teamA!==m.teamA||old.teamB!==m.teamB||old.round!==m.round||old.bestOf!==m.bestOf||round<3&&semanticSHA256(old)!==semanticSHA256(m))throw Error('Previous facts/draw changed');
    const needed=(m.bestOf+1)/2;if(m.status!=='COMPLETED'||m.scoreA===null||m.scoreB===null||Math.max(m.scoreA,m.scoreB)!==needed||Math.min(m.scoreA,m.scoreB)>=needed||m.winnerId!==(m.scoreA>m.scoreB?m.teamA:m.teamB))throw Error('R3 score invalid');
    if(m.scheduledAt&&Date.parse(m.scheduledAt)>Date.parse(f.asOf))throw Error('Completed match after cutoff');
   }else if(m.status!=='SCHEDULED'||m.scoreA!==null||m.scoreB!==null||m.winnerId!==null||m.scheduledAt&&Date.parse(m.scheduledAt)<Date.parse(f.nextRoundStartsAt))throw Error('R4 must have no outcome');
  }
  if(round<=3)for(const m of group){records[m.winnerId!].wins++;records[m.winnerId===m.teamA?m.teamB:m.teamA].losses++;past.add([m.teamA,m.teamB].sort().join('|'));}
 }
 if(Object.values(records).filter(r=>r.wins===3).length!==2||Object.values(records).filter(r=>r.losses===3).length!==2||Object.values(records).filter(r=>r.wins===2&&r.losses===1).length!==6||Object.values(records).filter(r=>r.wins===1&&r.losses===2).length!==6)throw Error('R3 standings invalid');
 const times=f.matches.filter(m=>m.round===4&&m.scheduledAt).map(m=>Date.parse(m.scheduledAt!));if(!times.length||Math.min(...times)!==Date.parse(f.nextRoundStartsAt))throw Error('R4 earliest schedule invalid');
 return {update:f,records,factsSHA256:semanticSHA256(round3FactsInput(f))};
}
export async function loadRound3Facts(projectRoot=process.cwd(),verifiedOfficial?:OfficialSnapshot){
 const previous=await loadRound2Facts(projectRoot,verifiedOfficial),bytes=await readFile(`${projectRoot}/lib/live/updates/round3/facts.json`);
 return {...validateRound3Facts(JSON.parse(bytes.toString()),previous),previous,fileSHA256:sha256(bytes)};
}
export function createSwissRound4Session(f:Round3Facts,previous:Awaited<ReturnType<typeof loadRound2Facts>>,model:FrozenSystem){
 const {records}=validateRound3Facts(f,previous);let session=createSwissRound3Session(previous.update,previous.prior,model);
 for(const fact of f.matches.filter(m=>m.round===3)){
  const m=session.tournamentState.matches.find(m=>m.stage==='SWISS'&&m.round===3&&m.teamA===fact.teamA&&m.teamB===fact.teamB);if(!m)throw Error('Known R3 pairing missing');
  session=applyResult(session,m.id,fact.winnerId!,fact.scoreA!,fact.scoreB!,'OFFICIAL');
 }
 session=advance(session);session.tournamentState.matches=session.tournamentState.matches.filter(m=>m.stage!=='SWISS'||m.round!==4);
 for(const [i,m] of f.matches.filter(m=>m.round===4).entries())session.tournamentState.matches.push(makeMatch(session,`s4-${i+1}`,'SWISS',4,'官方瑞士轮第四轮',m.teamA,m.teamB,m.bestOf));session.rngState=session.randomSeed;
 const st=session.tournamentState;if(st.stage!=='SWISS'||st.round!==4||st.matches.length!==36||st.swissQualified.length!==2||st.swissEliminated.length!==2||semanticSHA256(st.swissRecords)!==semanticSHA256(records))throw Error('R4 conditioned state invalid');return session;
}
export function validateRound3Probability(input:unknown,facts:Awaited<ReturnType<typeof loadRound3Facts>>,model:FrozenSystem,generatorSHA:string){
 const s=round3ProbabilitySchema.parse(input),session=createSwissRound4Session(facts.update,facts.previous,model);
 const versions={rulesVersion:model.rulesVersion,stateVersion:model.stateVersion,strengthVersion:model.strengthVersion,modelVersion:model.modelVersion,probabilityModelVersion:model.modelVersion,ratingVersion:model.ratingVersion,ratingInputSHA256:model.ratingInputSHA256,frozenModelSHA256:semanticSHA256(model),rulesSHA256:model.rulesSHA256,engineSourceSHA256:model.engineSourceSHA256,strengthSourceSHA256:model.strengthSourceSHA256,rngVersion:model.rngVersion,samplingVersion:model.samplingVersion,eventDefinitionVersion:LIVE_ODDS.eventDefinitionVersion,generatorSourceSHA256:generatorSHA,generatorVersion:'live-swiss-round3-conditional-v1.0'};
 for(const[k,v]of Object.entries(versions))if(s[k as keyof typeof s]!==v)throw Error('R3 model/version mismatch: '+k);
 if(s.snapshotId!==ROUND3_ID||s.factsSnapshotId!==facts.update.snapshotId||s.factsInputSHA256!==facts.factsSHA256||s.asOf!==facts.update.asOf||s.randomSeed!==ROUND3_SEED||s.sessionSeed!==session.randomSeed||s.revisionOf!==null||s.knownDrawIds.join('|')!=='worlds-2026-swiss-r4-official-draw-v1')throw Error('R3 snapshot binding invalid');
 if(s.tournamentStateHash!==tournamentStateHash(session)||s.simulationInputSHA256!==sha256(tournamentStateInput(session))||s.conditionedStateSHA256!==stateSHA256(session))throw Error('R3 state hash invalid');
 if(s.calculation.method!=='SHARED_ENGINE_RUN'||s.calculation.sourceCacheSHA256!==null||Date.parse(s.generatedAt)<Date.parse(s.asOf)||Date.parse(s.calculation.calculatedAt)>Date.parse(s.generatedAt))throw Error('R3 calculation provenance invalid');
 if(s.teams.map(t=>t.teamId).sort().join('|')!==model.teams.map(t=>t.teamId).sort().join('|'))throw Error('R3 needs all 19 unique teams');
 const counts=Object.fromEntries(EVENTS.map(e=>[e,Object.fromEntries(s.teams.map(t=>[t.teamId,t[`${e}Count`]]))])) as EventCounts;assertEventCounts(counts,s.simulationCount);if(semanticSHA256(counts)!==s.countSHA256)throw Error('R3 count checksum invalid');
 for(const t of s.teams){for(const e of EVENTS)if(t[`${e}Probability`]!==t[`${e}Count`]/s.simulationCount)throw Error('R3 probability/count mismatch');const record=facts.records[t.teamId];if(t.swissCount!==(record?100000:0)||!record&&EVENTS.some(e=>t[`${e}Count`]!==0)||record?.wins===3&&t.knockoutCount!==100000||record?.losses===3&&EVENTS.slice(1).some(e=>t[`${e}Count`]!==0))throw Error('R3 elimination/qualification invalid');}
 return s;
}
export async function loadRound3History(model:FrozenSystem,projectRoot=process.cwd(),verifiedOfficial?:OfficialSnapshot){
 const previous=await loadRound2History(model,projectRoot,verifiedOfficial),facts=await loadRound3Facts(projectRoot,verifiedOfficial),root=`${projectRoot}/lib/live/updates/round3`;
 const index=JSON.parse(await readFile(`${root}/index.json`,'utf8'));
 if(index.schemaVersion!=='live-swiss-round3-index-v1.0'||index.baseHistorySHA256!==sha256(await readFile(`${projectRoot}/lib/live/updates/round2/index.json`))||index.facts.fileSHA256!==facts.fileSHA256||index.facts.factsSHA256!==facts.factsSHA256||previous.factsSHA256!==facts.previous.factsSHA256)throw Error('R3 history/facts lock invalid');
 const auditBytes=await readFile(`${root}/generation-source.json`);if(sha256(auditBytes)!==index.generationSourceSHA256)throw Error('R3 source audit checksum invalid');const audit=JSON.parse(auditBytes.toString());
 const sourceFiles=await Promise.all(ROUND3_FILES.map(async file=>[file,sha256(await readFile(`${projectRoot}/${file}`))]));const sourceSHA=semanticSHA256(sourceFiles);
 if(audit.schemaVersion!=='live-round3-generator-source-v1.0'||audit.generatorSourceSHA256!==sourceSHA||semanticSHA256(audit.sourceFiles)!==sourceSHA)throw Error('R3 generator fingerprint invalid');
 const bytes=await readFile(`${root}/probability.json`);if(sha256(bytes)!==index.snapshot.sha256)throw Error('R3 snapshot file checksum invalid');const snapshot=validateRound3Probability(JSON.parse(bytes.toString()),facts,model,sourceSHA);
 if(snapshot.generatorCommit!==audit.generatorCommit||['snapshotId','label','asOf','countSHA256'].some(k=>index.snapshot[k]!==snapshot[k as keyof typeof snapshot]))throw Error('R3 snapshot index invalid');return {...facts,index,snapshot};
}
