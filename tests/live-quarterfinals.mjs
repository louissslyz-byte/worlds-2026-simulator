import assert from 'node:assert/strict';
import {loadFrozenSystem} from '../lib/live/probability/model.ts';
import {loadQuarterfinalFacts,createQuarterfinalSession,validateQuarterfinalSnapshot,QF_ID} from '../lib/live/updates/quarterfinals.ts';
import {stateSHA256} from '../lib/live/updates/adapter.ts';
import {readLiveView} from '../lib/live/view-server.ts';
import {loadKnockoutForecast} from '../lib/live/knockout-forecast/load.ts';
import {runMonteCarloFromState} from '../lib/sim/monteCarlo.ts';
import {readFile} from 'node:fs/promises';

const {model}=await loadFrozenSystem();
const facts=await loadQuarterfinalFacts();
const view=await readLiveView();
const forecast=await loadKnockoutForecast(view);
const legacy=validateQuarterfinalSnapshot(JSON.parse(await readFile('lib/live/updates/quarterfinals/probability.json','utf8')),facts,model);
const current=forecast.snapshots.at(-1);
assert.equal(view.nodes.at(-1).id,QF_ID);
assert.equal(current.legacySnapshotId,QF_ID);
assert.equal(current.factsInputSHA256,legacy.factsInputSHA256);
assert.equal(current.stateSHA256,stateSHA256(createQuarterfinalSession(facts,model,forecast.strength)));
const winners=new Set(facts.facts.quarterfinals.map(match=>match.winner));
for(const strength of [undefined,forecast.strength]){
 const session=createQuarterfinalSession(facts,model,strength);
 const {matches,round,stage}=session.tournamentState;
 assert.equal(round,2);
 assert.equal(stage,'KNOCKOUT');
 const knockout=matches.filter(m=>m.stage==='KNOCKOUT');
 assert.equal(knockout.length,6);
 for(const [i,m] of knockout.slice(0,4).entries()){
  const fact=facts.facts.quarterfinals[i];
  assert.deepEqual([m.scoreA,m.scoreB,m.winner,m.locked,m.resultSource],[fact.scoreA,fact.scoreB,fact.winner,true,'OFFICIAL']);
 }
 for(const [i,m] of knockout.slice(4).entries()){
  const fact=facts.facts.semifinals[i];
  assert.deepEqual([m.teamA,m.teamB,m.scoreA,m.scoreB,m.winner],[fact.a,fact.b,null,null,null]);
 }
 const before=stateSHA256(session);
 const result=runMonteCarloFromState(session,128,17);
 assert.equal(stateSHA256(session),before);
 for(const [id,count] of Object.entries(result.counts.semifinal))assert.equal(count,winners.has(id)?128:0);
}
for(const m of facts.facts.quarterfinals){
 const projected=view.matches.find(x=>x.id===m.id);
 assert.deepEqual([projected.status,projected.scoreA,projected.scoreB,projected.winner],['COMPLETED',m.scoreA,m.scoreB,m.winner]);
}
for(const m of facts.facts.semifinals){
 const projected=view.matches.find(x=>x.id===m.id);
 assert.deepEqual([projected.status,projected.scoreA,projected.scoreB,projected.time],['SCHEDULED',null,null,m.scheduledAt]);
}
for(const id of ['DK','KC','TES','LYON']){
 assert.equal(view.teams.find(t=>t.id===id).eliminationNodeIndex,8);
 assert.equal(forecast.view.teams.find(t=>t.id===id).eliminationNodeIndex,2);
}
for(const snapshot of [legacy,current]){
 assert.equal(snapshot.simulationCount,100000);
 assert.equal(snapshot.failedCount,0);
 assert.equal(snapshot.teams.reduce((total,t)=>total+t.championCount,0),100000);
 for(const t of snapshot.teams)assert.equal(t.semifinalCount,winners.has(t.teamId)?100000:0);
}
const bad=structuredClone(legacy);
bad.simulationInputSHA256='0'.repeat(64);
assert.throws(()=>validateQuarterfinalSnapshot(bad,facts,model),/conditioning mismatch/);
console.log('Quarterfinals PASS: fixed official results, two pending semifinals, paired 100K snapshots, four elimination endpoints and frozen state bindings');
