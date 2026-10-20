// Offline unit/regression tests. No formal 100k run or archive writes here.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {loadFrozenSystem,assertFrozenSystem,generatorSourceSHA256,semanticSHA256,sha256} from '../lib/live/probability/model.ts';
import {verifiedA1,createPostPlayInSession,createPreTournamentSession,assertPostPlayInSession,assertConditioningPreserved} from '../lib/live/probability/adapter.ts';
import {makeSnapshot,validateProbabilitySnapshot,countsFromSnapshot,compareSnapshots} from '../lib/live/probability/snapshot.ts';
import {validateR1Baseline} from '../lib/live/probability/generate.ts';
import {LIVE_ODDS} from '../lib/live/probability/config.ts';
import {createSession,makeMatch,applyResult,advance,simulateEntireWorlds} from '../lib/sim/engine.ts';
import {runMonteCarloFromState,SimulationFailure} from '../lib/sim/monteCarlo.ts';
import {assertCompletedTournament,assertEventCounts} from '../lib/sim/validation.ts';
import {tournamentStateInput,tournamentStateHash} from '../lib/sim/oddsMetadata.ts';
const {model}=await loadFrozenSystem(),official=await verifiedA1(),before=semanticSHA256(official);
assert.equal(official.inputSHA256,LIVE_ODDS.factsInputSHA256);assert.equal(model.parameters.gprScale,0.85);assert.equal(model.parameters.eloDivisor,400);
assert.equal(model.ratingInputSHA256,LIVE_ODDS.ratingInputSHA256);assert.equal(Object.keys(model.ratings).length,19);
assert.equal(model.teams.find(t=>t.teamId==='FUR').gprScore,null);assert.equal(model.ratings.FUR,1575);
const pre=createPreTournamentSession(model),post=createPostPlayInSession(official,model);
assert.equal(pre.playInDrawMode,'RANDOM');assert.equal(pre.tournamentState.matches.length,0);assert.equal(pre.tournamentState.playInWinner,null);
assert.deepEqual(post.ratingSnapshot,pre.ratingSnapshot);assert.equal(post.tournamentState.stage,'SWISS');assert.equal(post.tournamentState.round,1);
assert.equal(post.tournamentState.playInWinner,official.state.qualifiedToSwiss[0]);assert.equal(post.tournamentState.matches.length,14);
assert.equal(post.tournamentState.matches.filter(m=>m.stage==='PLAY_IN'&&m.status==='COMPLETE'&&m.locked&&m.resultSource==='OFFICIAL').length,6);
assert.equal(post.tournamentState.matches.filter(m=>m.stage==='SWISS'&&m.status==='UNDECIDED'&&m.winner===null&&m.scoreA===null&&m.scoreB===null).length,8);
assert.deepEqual(Object.keys(post.tournamentState.swissRecords).sort(),official.state.swissParticipants);
assert.equal(post.rngState,LIVE_ODDS.post.sessionSeed,'Adapter must not consume random draws');
const unrelated=structuredClone(official);unrelated.state.qualifiedToSwiss=['MVK'];unrelated.state.swissParticipants=[];
assert.deepEqual(createPostPlayInSession(unrelated,model).tournamentState,post.tournamentState,'Never trust caller-derived state over validated A1 facts');
assert.equal(semanticSHA256(official),before);
const alteredFacts=structuredClone(official);alteredFacts.data.matches.playIn[0].scoreB=1;assert.throws(()=>createPostPlayInSession(alteredFacts,model),/hash/);
let invalid=0;
for(const change of [
 s=>s.strengthSource='CUSTOM_TIER_LIST',s=>s.ratingSnapshot.KC++,s=>s.rulesVersion='legacy',s=>s.tournamentState.stage='PLAY_IN',s=>s.tournamentState.round=2,s=>s.playInDrawMode='RANDOM',
 s=>s.tournamentState.playInWinner='MVK',s=>s.tournamentState.swissRecords.C9={wins:0,losses:0},s=>s.tournamentState.swissRecords.GEN.wins=1,
 s=>s.tournamentState.swissQualified.push('GEN'),s=>s.tournamentState.swissEliminated.push('C9'),s=>s.tournamentState.champion='GEN',
 s=>s.tournamentState.matches[0].scoreB=1,s=>s.tournamentState.matches[0].resultSource='SIMULATION',s=>s.tournamentState.matches[0].locked=false,
 s=>s.tournamentState.matches[6].teamB='C9',s=>s.tournamentState.matches[6].winner='AL',s=>s.tournamentState.matches[6].scoreA=0,
 s=>s.tournamentState.matches[6].id='duplicate',s=>s.seedAssignments={C9:1},
]){const bad=structuredClone(post);change(bad);assert.throws(()=>assertPostPlayInSession(bad,official,model));invalid++;}
// Compare direct Swiss bootstrap against the existing full Play-In advance path.
let replay=createSession('SYSTEM_MODEL',model.ratings,undefined,2026,undefined,'RANDOM');replay.playInDrawMode='FIXED';
for(const id of ['p1a','p1b']){const m=post.tournamentState.matches.find(m=>m.id===id);replay.tournamentState.matches.push(makeMatch(replay,id,'PLAY_IN',1,'replay audit',m.teamA,m.teamB,5));}
while(replay.tournamentState.stage==='PLAY_IN'){
 for(const m of replay.tournamentState.matches.filter(m=>m.round===replay.tournamentState.round&&m.status==='UNDECIDED')){
  const fact=post.tournamentState.matches.find(p=>p.id===m.id);assert.ok(fact);
  const same=m.teamA===fact.teamA;replay=applyResult(replay,m.id,fact.winner,same?fact.scoreA:fact.scoreB,same?fact.scoreB:fact.scoreA,'OFFICIAL');
 }replay=advance(replay);
}
assert.deepEqual(replay.tournamentState.swissRecords,post.tournamentState.swissRecords);assert.equal(replay.tournamentState.playInWinner,post.tournamentState.playInWinner);
// Test-only replay draws are replaced with A1 pairings; production adapter never draws.
replay.tournamentState.matches=[...replay.tournamentState.matches.filter(m=>m.stage==='PLAY_IN'),...structuredClone(post.tournamentState.matches.filter(m=>m.stage==='SWISS'))];
const nextA=structuredClone(post),nextB=structuredClone(replay);
let a=nextA,b=nextB;
for(const m of nextA.tournamentState.matches.filter(m=>m.stage==='SWISS')){a=applyResult(a,m.id,m.teamA,1,0,'MANUAL');b=applyResult(b,m.id,m.teamA,1,0,'MANUAL');}
a.rngState=b.rngState=77;a=advance(a);b=advance(b);
assert.deepEqual(a.tournamentState.swissRecords,b.tournamentState.swissRecords);assert.deepEqual(a.tournamentState.matches.filter(m=>m.stage==='SWISS'),b.tournamentState.matches.filter(m=>m.stage==='SWISS'));
let laterSameRegion=false;
for(let seed=1;seed<=200;seed++){
 const input=structuredClone(post);input.rngState=seed;const result=simulateEntireWorlds(input);assertCompletedTournament(result);assertConditioningPreserved(post,result);
 const ids=Object.keys(result.tournamentState.swissRecords);assert.ok(official.state.eliminatedTeams.every(t=>!ids.includes(t)));assert.ok(!official.state.eliminatedTeams.includes(result.tournamentState.champion));
 if(result.tournamentState.matches.some(m=>m.stage==='SWISS'&&m.round>1&&model.teams.find(t=>t.teamId===m.teamA).region===model.teams.find(t=>t.teamId===m.teamB).region))laterSameRegion=true;
}assert.ok(laterSameRegion);
const originalSession=semanticSHA256(post);const one=runMonteCarloFromState(post,100,20261019);assertEventCounts(one.counts,100);
const identityChanged=structuredClone(post);identityChanged.id='another-session-uuid';identityChanged.createdAt='2099-01-01T00:00:00.000Z';
const two=runMonteCarloFromState(identityChanged,100,20261019);assert.deepEqual(one.counts,two.counts);assert.equal(semanticSHA256(post),originalSession);assert.equal(semanticSHA256(official),before);
for(const id of official.state.eliminatedTeams)for(const event of Object.keys(one.counts))assert.equal(one.counts[event][id],0);
for(const id of official.state.swissParticipants)assert.equal(one.counts.swiss[id],100);
const broken=structuredClone(post);broken.tournamentState.matches[6].teamA='C9';
assert.throws(()=>runMonteCarloFromState(broken,100,20261019),error=>error instanceof SimulationFailure&&error.context.sampleIndex===0&&error.context.sampleSeed===20261019&&error.context.completedCount===0&&error.context.requestedCount===100);
const baseline=await validateR1Baseline();assert.equal(sha256(tournamentStateInput(pre)),baseline.odds.metadata.inputSHA256);
assert.equal(tournamentStateHash(pre),baseline.odds.metadata.tournamentStateHash);
const provenance={commit:'65026d71c51f5c6a772fe4310edd6b752f71e3f2',sourceSHA256:await generatorSourceSHA256()};
const snapshot=makeSnapshot('PRE-TOURNAMENT',baseline.odds,pre,model,official,provenance,baseline.sha256);
assert.deepEqual(countsFromSnapshot(snapshot),baseline.odds.counts);assert.throws(()=>makeSnapshot('POST-PLAY-IN',one,post,model,official,provenance,null),/Incomplete/);
for(const change of [s=>s.teams.pop(),s=>s.teams[0].teamId='UNKNOWN',s=>s.teams[0].swissCount--,s=>s.teams[0].championProbability+=0.001,s=>s.failedCount=1,s=>s.simulationCount=99999,s=>s.rulesVersion='legacy',s=>s.ratingInputSHA256='0'.repeat(64),s=>s.factsSnapshotId=official.data.metadata.snapshotId,s=>s.simulationInputSHA256='0'.repeat(64),s=>s.randomSeed=1,s=>s.rawGames=[]]){
 const bad=structuredClone(snapshot);change(bad);assert.throws(()=>validateProbabilitySnapshot(bad,model,official,provenance.sourceSHA256));invalid++;
}
assert.throws(()=>compareSnapshots(snapshot,snapshot));const modelBad=structuredClone(model);modelBad.ratings.KC++;assert.throws(()=>assertFrozenSystem(modelBad));
for(const path of ['lib/sim/precomputedOdds.json','lib/sim/engine.ts','lib/sim/monteCarlo.ts','lib/sim/worlds2026.ts','lib/sim/ratingConfig.ts','lib/sim/ratings.ts','lib/sim/gprSnapshot.ts','lib/live/snapshots/post-play-in-v1.json','lib/live/snapshots/index.json','lib/team-profile/champion-pools.json'])assert.equal(sha256(await readFile(new URL(`../${path}`,import.meta.url))),sha256(execFileSync('git',['show',`65026d7:${path}`])),path);
console.log(`Live概率单元通过：独立中间状态、完整推进等价、200场官方条件逐项审计、同种子/不同UUID复现、${invalid}组状态/快照反例、R1赛前精确复用、核心和A1未改。`);
