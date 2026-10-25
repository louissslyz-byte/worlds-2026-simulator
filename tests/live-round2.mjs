import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync,spawnSync} from 'node:child_process';
import {loadRound2Facts,validateRound2Facts,createSwissRound3Session,loadRound2History,validateRound2Probability,ROUND2_FILES} from '../lib/live/updates/round2.ts';
import {loadFrozenSystem,semanticSHA256,sha256} from '../lib/live/probability/model.ts';
import {assertConditioningPreserved} from '../lib/live/probability/adapter.ts';
import {assertCompletedTournament} from '../lib/sim/validation.ts';
import {simulateEntireWorlds,applyResult} from '../lib/sim/engine.ts';
import {runMonteCarloFromState} from '../lib/sim/monteCarlo.ts';
const facts=await loadRound2Facts(),{model}=await loadFrozenSystem(),before=semanticSHA256(facts);
assert.equal(model.ratingInputSHA256,'50ecd08a842afff2cfb2146a92fa67b929c42c121f831a6e110de9185a7ed8cb');
const session=createSwissRound3Session(facts.update,facts.prior,model),st=session.tournamentState;
assert.equal(st.round,3);assert.equal(st.stage,'SWISS');assert.equal(st.matches.filter(m=>m.status==='COMPLETE'&&m.resultSource==='OFFICIAL'&&m.locked).length,22);
assert.equal(st.matches.filter(m=>m.round===3&&m.stage==='SWISS'&&m.winner===null).length,8);
assert.equal(st.matches.filter(m=>m.round===3&&m.stage==='SWISS'&&m.format===3).length,4);
for(const[w,count]of [[2,4],[1,8],[0,4]])assert.equal(Object.values(facts.records).filter(r=>r.wins===w).length,count);
assert.throws(()=>applyResult(session,'s2-1','CFO',0,1,'MANUAL'),/官方/);
for(const mutate of [f=>f.matches[8].winnerId='CFO',f=>f.matches[8].scoreA=0,f=>f.matches[16].winnerId='DK',f=>f.matches[16].bestOf=1,f=>f.matches[16].teamA='UNKNOWN',f=>f.matches[16].teamB=f.matches[16].teamA,f=>f.matches[16].officialMatchId=f.matches[0].officialMatchId,f=>f.matches[16].sourceIds=['missing'],f=>f.asOf=f.nextRoundStartsAt,f=>f.drawKnownBy=f.nextRoundStartsAt,f=>f.baseInputSHA256='0'.repeat(64)]){const bad=structuredClone(facts.update);mutate(bad);assert.throws(()=>validateRound2Facts(bad,facts.prior));}
const future=facts.update.matches.filter(m=>m.round===3);
for(let i=0;i<256;i++){
 const sample=structuredClone(session);sample.rngState=(20261025+i*7919)>>>0;
 const result=simulateEntireWorlds(sample);assertCompletedTournament(result);assertConditioningPreserved(session,result);
 for(const[i,f]of future.entries()){const m=result.tournamentState.matches.find(m=>m.id===`s3-${i+1}`);assert.equal(m.teamA,f.teamA);assert.equal(m.teamB,f.teamB);assert.equal(m.format,f.bestOf);assert.equal(m.resultSource,'SIMULATION');}
}
assert.deepEqual(runMonteCarloFromState(session,64,20261025).counts,runMonteCarloFromState(session,64,20261025).counts);
assert.equal(semanticSHA256(facts),before);
console.log('Swiss R2 gates PASS: 22 locked results / 8 fixed R3 matches / 4 BO3 / 4-8-4 standings / 256 audited paths / seed reproducibility / invalid state refusal.');
if(!process.argv.includes('--facts-only')){
 const h=await loadRound2History(model),audit=JSON.parse(await readFile('lib/live/updates/round2/generation-source.json','utf8'));
 for(const[file,hash]of audit.sourceFiles)assert.equal(sha256(execFileSync('git',['show',`${audit.generatorCommit}:${file}`])),hash);
 assert.equal(audit.sourceFiles.length,ROUND2_FILES.length);
 for(const mutate of [s=>s.teams.pop(),s=>s.completedCount=99999,s=>s.ratingInputSHA256='0'.repeat(64),s=>s.rulesVersion='old',s=>s.countSHA256='0'.repeat(64),s=>s.randomSeed++,s=>s.teams[0].championProbability+=.00001]){const bad=structuredClone(h.snapshot);mutate(bad);assert.throws(()=>validateRound2Probability(bad,facts,model,audit.generatorSourceSHA256));}
 const raw=await readFile('lib/live/updates/round2/probability.json');const refused=spawnSync(process.execPath,['--import','tsx','scripts/generate-live-round2.mjs','--candidate','lib/live/updates/round2'],{encoding:'utf8'});assert.notEqual(refused.status,0);assert.ok(refused.stderr.includes('EEXIST'));assert.ok(!refused.stdout.includes('Starting'));assert.deepEqual(raw,await readFile('lib/live/updates/round2/probability.json'));
 console.log('Swiss R2 formal 100K archive, source/strength/old history locks and rejection of overwrite PASS.');
}
