import assert from 'node:assert/strict';
import {loadSwissUpdate,validateSwissUpdate,factsInput} from '../lib/live/updates/facts.ts';
import {createSwissRound2Session,stateSHA256} from '../lib/live/updates/adapter.ts';
import {loadFrozenSystem,semanticSHA256} from '../lib/live/probability/model.ts';
import {assertConditioningPreserved} from '../lib/live/probability/adapter.ts';
import {runMonteCarloFromState} from '../lib/sim/monteCarlo.ts';
import {simulateEntireWorlds} from '../lib/sim/engine.ts';
import {assertCompletedTournament} from '../lib/sim/validation.ts';
import {loadUpdateHistory,validateUpdateProbability,archivedGeneratorSHA256} from '../lib/live/updates/probability.ts';
const {update,official,records,factsSHA256}=await loadSwissUpdate(),{model}=await loadFrozenSystem(),before=semanticSHA256({update,official});
const session=createSwissRound2Session(update,official,model);
assert.equal(semanticSHA256({update,official}),before);
assert.equal(session.tournamentState.round,2);assert.equal(session.tournamentState.stage,'SWISS');
assert.equal(session.tournamentState.matches.filter(m=>m.status==='COMPLETE'&&m.resultSource==='OFFICIAL'&&m.locked).length,14);
assert.equal(session.tournamentState.matches.filter(m=>m.round===2&&m.stage==='SWISS'&&m.winner===null).length,8);
assert.equal(Object.values(records).filter(r=>r.wins===1).length,8);assert.equal(Object.values(records).filter(r=>r.losses===1).length,8);
assert.equal(stateSHA256(session),stateSHA256(createSwissRound2Session(update,official,model)));
const reordered=structuredClone(update);reordered.sourceCheckedAt='2026-10-24T05:00:00.000Z';reordered.matches.reverse();assert.equal(semanticSHA256(factsInput(reordered)),factsSHA256);
for(const mutate of [u=>u.matches[0].scoreA=0,u=>u.matches[8].winnerId='MKOI',u=>u.matches[8].teamB='GEN',u=>u.matches[8].teamA='UNKNOWN',u=>u.matches[8].bestOf=3,u=>u.asOf='2026-10-24T18:00:00.000Z',u=>u.drawKnownBy='2026-10-24T18:00:00.000Z',u=>u.matches[8].sourceIds=['missing'],u=>u.matches[8].officialMatchId=u.matches[0].officialMatchId]){
 const bad=structuredClone(update);mutate(bad);assert.throws(()=>validateSwissUpdate(bad,official));
}
const sessionBefore=semanticSHA256(session);
for(let i=0;i<256;i++){
 const sample=structuredClone(session);sample.rngState=(20261024+i*7919)>>>0;
 const result=simulateEntireWorlds(sample);assertCompletedTournament(result);assertConditioningPreserved(session,result);
 for(const id of ['C9','MVK','FUR'])assert.ok(!result.tournamentState.swissQualified.includes(id));
 const future=result.tournamentState.matches.filter(m=>m.stage==='SWISS'&&m.round===2);
 assert.equal(future.length,8);assert.ok(future.every(m=>m.resultSource==='SIMULATION'));
}
assert.equal(semanticSHA256(session),sessionBefore);
const a=runMonteCarloFromState(session,64,9876),b=runMonteCarloFromState(session,64,9876);assert.deepEqual(a.counts,b.counts);
assert.throws(()=>runMonteCarloFromState({...session,tournamentState:{...session.tournamentState,matches:session.tournamentState.matches.slice(0,-1)}},1,1));
console.log('LiveOps small gates PASS: 256 fully audited paths, 2 x 64 repeatability; fixed 14 results and 8 R2 pairings; invalid states rejected.');
if(!process.argv.includes('--facts-only')){
 const {readFile}=await import('node:fs/promises');const {execFileSync}=await import('node:child_process');const {sha256}=await import('../lib/live/probability/model.ts');
 const audit=JSON.parse(await readFile('lib/live/updates/generation-source-v1.json','utf8'));for(const [file,hash]of audit.sourceFiles)assert.equal(sha256(execFileSync('git',['show',`${audit.generatorCommit}:${file}`])),hash);
 const h=await loadUpdateHistory(model),s=h.snapshots[0],sourceSHA=await archivedGeneratorSHA256();
 assert.equal(s.simulationCount,100000);assert.equal(s.failedCount,0);
 for(const mutate of [x=>x.teams.pop(),x=>x.ratingInputSHA256='0'.repeat(64),x=>x.countSHA256='0'.repeat(64),x=>x.rulesVersion='old',x=>x.completedCount=99999,x=>x.teams[0].championProbability+=0.00001,x=>x.conditionedStateSHA256='0'.repeat(64),x=>x.randomSeed++]){const bad=structuredClone(s);mutate(bad);assert.throws(()=>validateUpdateProbability(bad,update,official,model,sourceSHA));}
 console.log('LiveOps formal archive and negative snapshot validation PASS.');
}
