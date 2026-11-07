import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {loadFrozenSystem,semanticSHA256} from '../lib/live/probability/model.ts';
import {loadRound5Facts,createBeforeDrawSession,loadRound5History,validateRound5Snapshot} from '../lib/live/updates/round5.ts';
import {runMonteCarloFromState} from '../lib/sim/monteCarlo.ts';
import {readLiveView} from '../lib/live/view-server.ts';
const {model}=await loadFrozenSystem(),f=await loadRound5Facts(),s=createBeforeDrawSession(f,model),before=semanticSHA256(s);
assert.equal(s.tournamentState.stage,'SWISS');assert.equal(s.tournamentState.round,5);assert.equal(s.tournamentState.matches.filter(m=>m.stage==='KNOCKOUT').length,0);
assert.equal(s.tournamentState.matches.filter(m=>m.stage==='SWISS'&&m.round===5&&m.resultSource==='OFFICIAL'&&m.locked).length,3);
const a=runMonteCarloFromState(s,128,42);assert.deepEqual(a.counts,runMonteCarloFromState(s,128,42).counts);assert.equal(semanticSHA256(s),before);
const h=await loadRound5History(model);assert.equal(h.snapshot.completedCount,100000);assert.equal(h.snapshot.failedCount,0);
for(const mutate of [x=>x.randomSeed++,x=>x.knownDrawIds.push('future-draw'),x=>x.ratingInputSHA256='0'.repeat(64),x=>x.teams.pop(),x=>x.teams[0].championCount++]){const bad=structuredClone(h.snapshot);mutate(bad);assert.throws(()=>validateRound5Snapshot(bad,f,model));}
const view=await readLiveView();assert.equal(view.nodes.length,9);assert.equal(view.teams.length,19);for(const t of view.teams)assert.equal(t.points.length,9);
for(const id of ['MKOI','LOS','HLE']){const t=view.teams.find(t=>t.id===id);assert.equal(t.eliminationNodeIndex,6);assert.equal(t.points.at(-1).values.champion.count,0);}
for(const id of ['KC','LYON','BLG'])assert.equal(view.teams.find(t=>t.id===id).qualificationNodes.knockout,6);
assert.equal((await readFile('lib/sim/precomputedOdds.json')).length>0,true);
console.log('R5 before-draw: 100K archive, counts, negative cases, fixed outcomes, independent draw, seven-node projection and official endpoints PASS');
