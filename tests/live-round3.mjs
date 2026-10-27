import assert from 'node:assert/strict';
import {loadRound3Facts,validateRound3Facts,createSwissRound4Session,loadRound3History,validateRound3Probability} from '../lib/live/updates/round3.ts';
import {readFile} from 'node:fs/promises';
import {execFileSync,spawnSync} from 'node:child_process';
import {loadFrozenSystem,semanticSHA256,sha256} from '../lib/live/probability/model.ts';
import {assertConditioningPreserved} from '../lib/live/probability/adapter.ts';
import {assertCompletedTournament} from '../lib/sim/validation.ts';
import {simulateEntireWorlds,applyResult} from '../lib/sim/engine.ts';
import {runMonteCarloFromState} from '../lib/sim/monteCarlo.ts';
const facts=await loadRound3Facts(),{model}=await loadFrozenSystem(),before=semanticSHA256(facts);
assert.equal(model.ratingInputSHA256,'50ecd08a842afff2cfb2146a92fa67b929c42c121f831a6e110de9185a7ed8cb');
const session=createSwissRound4Session(facts.update,facts.previous,model),st=session.tournamentState;
assert.equal(st.round,4);assert.equal(st.stage,'SWISS');assert.equal(st.matches.filter(m=>m.status==='COMPLETE'&&m.resultSource==='OFFICIAL'&&m.locked).length,30);
assert.equal(st.matches.filter(m=>m.round===4&&m.stage==='SWISS'&&m.winner===null&&m.format===3).length,6);
assert.deepEqual(st.swissQualified.toSorted(),['DK','GEN']);assert.deepEqual(st.swissEliminated.toSorted(),['AL','TSW']);
for(const mutate of [f=>f.matches[16].winnerId='MKOI',f=>f.matches[16].scoreA=1,f=>f.matches[24].winnerId='MKOI',f=>f.matches[24].bestOf=1,f=>f.matches[24].teamA='UNKNOWN',f=>f.matches[24].teamB=f.matches[24].teamA,f=>f.matches[24].officialMatchId=f.matches[0].officialMatchId,f=>f.asOf=f.nextRoundStartsAt,f=>f.baseInputSHA256='0'.repeat(64)]){const bad=structuredClone(facts.update);mutate(bad);assert.throws(()=>validateRound3Facts(bad,facts.previous));}
assert.throws(()=>applyResult(session,'s3-1','MKOI',0,2,'MANUAL'));
const future=facts.update.matches.filter(m=>m.round===4);
for(let i=0;i<256;i++){
 const sample=structuredClone(session);sample.rngState=(20261027+i*7919)>>>0;
 const result=simulateEntireWorlds(sample);assertCompletedTournament(result);assertConditioningPreserved(session,result);
 for(const[j,f]of future.entries()){const m=result.tournamentState.matches.find(m=>m.id===`s4-${j+1}`);assert.equal(m.teamA,f.teamA);assert.equal(m.teamB,f.teamB);assert.equal(m.format,3);assert.equal(m.resultSource,'SIMULATION');}
}
assert.deepEqual(runMonteCarloFromState(session,64,20261027).counts,runMonteCarloFromState(session,64,20261027).counts);assert.equal(semanticSHA256(facts),before);
console.log('Swiss R3 gates PASS: 30 locked results, 6 fixed R4 BO3, qualified/eliminated facts, 256 audited paths, fixed seed and negative tests.');

if(!process.argv.includes('--facts-only')){
 const h=await loadRound3History(model),audit=JSON.parse(await readFile('lib/live/updates/round3/generation-source.json','utf8'));
 for(const[file,hash]of audit.sourceFiles)assert.equal(sha256(execFileSync('git',['show',`${audit.generatorCommit}:${file}`])),hash);
 for(const mutate of [s=>s.teams.pop(),s=>s.completedCount=99999,s=>s.ratingInputSHA256='0'.repeat(64),s=>s.rulesVersion='old',s=>s.countSHA256='0'.repeat(64),s=>s.randomSeed++,s=>s.teams[0].championProbability+=.00001]){const bad=structuredClone(h.snapshot);mutate(bad);assert.throws(()=>validateRound3Probability(bad,facts,model,audit.generatorSourceSHA256));}
 const raw=await readFile('lib/live/updates/round3/probability.json'),refused=spawnSync(process.execPath,['--import','tsx','scripts/generate-live-round3.mjs','--candidate','lib/live/updates/round3'],{encoding:'utf8'});assert.notEqual(refused.status,0);assert.ok(refused.stderr.includes('EEXIST'));assert.ok(!refused.stdout.includes('Starting'));assert.deepEqual(raw,await readFile('lib/live/updates/round3/probability.json'));
 console.log('Swiss R3 formal 100K archive, prior history, frozen model and overwrite refusal PASS.');
}
