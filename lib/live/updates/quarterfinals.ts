import {readFile} from 'node:fs/promises';
import {z} from 'zod';
import {advance,applyResult,makeMatch} from '../../sim/engine';
import {loadDrawFacts,createAfterDrawSession,drawProbabilitySchema,validateDrawSnapshot,DRAW_ID,DRAW_SEED} from './knockout-draw';
import {sha256,semanticSHA256,type FrozenSystem} from '../probability/model';
import {stateSHA256} from './adapter';

export const QF_ID='worlds-2026-quarterfinals-probability-v1';
export const QF_KIND='QUARTERFINALS-COMPLETE';
export const QF_LABEL='八强赛后';
export const QF_SEED=20261107;
export const QF_NEW_GPR_SEED=20261108;
const matchSchema=z.object({id:z.string().regex(/^\d+$/),a:z.string(),b:z.string(),scheduledAt:z.string().datetime()});
const factsSchema=z.object({
 snapshotId:z.literal('worlds-2026-quarterfinal-results-v1'),
 baseFactsSHA256:z.string().length(64),asOf:z.string().datetime(),
 sourceUrl:z.literal('https://lolesports.com/en-SG/tournament/115660540725177488/stage/115660540725570707'),
 evidenceSHA256:z.string().regex(/^[a-f0-9]{64}$/),
 quarterfinals:z.array(matchSchema.extend({
  position:z.enum(['QF1','QF2','QF3','QF4']),scoreA:z.number().int().min(0).max(3),
  scoreB:z.number().int().min(0).max(3),winner:z.string(),
 }).strict()).length(4),
 semifinals:z.array(matchSchema.extend({position:z.enum(['SF1','SF2']),structuralId:z.string()}).strict()).length(2),
}).strict();
export const quarterfinalProbabilitySchema=drawProbabilitySchema.extend({
 schemaVersion:z.literal('live-probability-snapshot-v1.7'),label:z.literal(QF_KIND),
});

export async function loadQuarterfinalFacts(root=process.cwd(),draw?:Awaited<ReturnType<typeof loadDrawFacts>>){
 const base=draw??await loadDrawFacts(root);
 const facts=factsSchema.parse(JSON.parse(await readFile(`${root}/lib/live/updates/quarterfinals/facts.json`,'utf8')));
 const allMatches=[...facts.quarterfinals,...facts.semifinals];
 if(facts.baseFactsSHA256!==base.factsSHA256||Date.parse(facts.asOf)<=Date.parse(base.facts.asOf)
    ||new Set(allMatches.map(m=>m.id)).size!==6)throw Error('Quarterfinal history binding invalid');
 for(const [i,m] of facts.quarterfinals.entries()){
  const expected=base.ordered[i];
  if(m.id!==expected.id||m.position!==expected.position||m.a!==expected.a||m.b!==expected.b
     ||m.scheduledAt!==expected.scheduledAt||Date.parse(m.scheduledAt)>=Date.parse(facts.asOf)
     ||Math.max(m.scoreA,m.scoreB)!==3||Math.min(m.scoreA,m.scoreB)>=3
     ||m.winner!==(m.scoreA>m.scoreB?m.a:m.b))throw Error('Quarterfinal result invalid');
 }
 for(const [i,m] of facts.semifinals.entries()){
  const half=facts.quarterfinals.slice(i*2,i*2+2);
  if(m.position!==`SF${i+1}`||m.structuralId!==base.ordered[i*2].semifinalId
     ||Date.parse(m.scheduledAt)<=Date.parse(facts.asOf)
     ||[m.a,m.b].sort().join()!==half.map(q=>q.winner).sort().join())throw Error('Semifinal progression invalid');
 }
 return {facts,base,factsSHA256:semanticSHA256(facts)};
}
type QuarterfinalFacts=Awaited<ReturnType<typeof loadQuarterfinalFacts>>;

export function createQuarterfinalSession(input:QuarterfinalFacts,model:FrozenSystem,strength?:{ratings:Record<string,number>;strengthVersion:string}){
 let session=createAfterDrawSession(input.base,model);
 for(const [i,m] of input.facts.quarterfinals.entries()){
  session=applyResult(session,`k1-${i+1}`,m.winner,m.scoreA,m.scoreB,'OFFICIAL');
 }
 if(strength){
  session.ratingSnapshot={...strength.ratings};
  session.strengthVersion=strength.strengthVersion;
 }
 const next=advance(session);
 for(const [i,m] of input.facts.semifinals.entries()){
  const id=`k2-${i+1}`;
  const generated=next.tournamentState.matches.find(match=>match.id===id);
  if(!generated||[generated.teamA,generated.teamB].sort().join()!==[m.a,m.b].sort().join())throw Error('Engine semifinal differs from verified bracket');
  // Preserve the official team order while using the shared match factory.
  next.tournamentState.matches[next.tournamentState.matches.indexOf(generated)]=makeMatch(next,id,'KNOCKOUT',2,'官方半决赛',m.a,m.b,5);
 }
 return next;
}
type CountRow={teamId:string;semifinalCount:number;finalCount:number;championCount:number};
export function assertQuarterfinalConditioning(teams:CountRow[],winners:readonly string[]){
 if(new Set(winners).size!==4)throw Error('Expected four semifinalists');
 for(const t of teams){
  const qualified=winners.includes(t.teamId);
  if(t.semifinalCount!==(qualified?100000:0)||!qualified&&(t.finalCount!==0||t.championCount!==0))throw Error('Quarterfinal elimination count invalid');
 }
}

export function validateQuarterfinalSnapshot(input:unknown,f:QuarterfinalFacts,model:FrozenSystem){
 const s=quarterfinalProbabilitySchema.parse(input);
 if(s.snapshotId!==QF_ID||s.randomSeed!==QF_SEED||s.asOf!==f.facts.asOf
    ||s.factsSnapshotId!==f.facts.snapshotId||s.factsInputSHA256!==f.factsSHA256
    ||s.knownDrawIds.join()!==f.base.facts.snapshotId
    ||s.simulationInputSHA256!==stateSHA256(createQuarterfinalSession(f,model)))throw Error('Quarterfinal conditioning mismatch');
 validateDrawSnapshot({...s,schemaVersion:'live-probability-snapshot-v1.6',label:'KNOCKOUT-DRAW-CONFIRMED',
  snapshotId:DRAW_ID,randomSeed:DRAW_SEED,asOf:f.base.facts.asOf,factsSnapshotId:f.base.facts.snapshotId,
  factsInputSHA256:f.base.factsSHA256,simulationInputSHA256:stateSHA256(createAfterDrawSession(f.base,model))},f.base,model);
 assertQuarterfinalConditioning(s.teams,f.facts.quarterfinals.map(m=>m.winner));
 return s;
}

export async function loadQuarterfinalHistory(model:FrozenSystem,root:string,draw:Awaited<ReturnType<typeof loadDrawFacts>>){
 const f=await loadQuarterfinalFacts(root,draw);
 const dir=`${root}/lib/live/updates/quarterfinals`;
 const index=JSON.parse(await readFile(dir+'/index.json','utf8'));
 const bytes=await readFile(dir+'/probability.json');
 if(index.sha256!==sha256(bytes)||index.factsSHA256!==f.factsSHA256
    ||index.baseHistorySHA256!==sha256(await readFile(`${root}/lib/live/updates/knockout-draw/index.json`)))throw Error('Quarterfinal archive checksum mismatch');
 return {...f,snapshot:validateQuarterfinalSnapshot(JSON.parse(bytes.toString()),f,model)};
}
