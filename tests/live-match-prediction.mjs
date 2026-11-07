import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {matchPrediction} from '../lib/live/match-prediction.ts';
import {SystemRatingProvider,gameProbability,seriesProbability} from '../lib/sim/ratings.ts';
import {readLiveView} from '../lib/live/view-server.ts';
const pre=new SystemRatingProvider().getRatings(),strength=JSON.parse(await readFile('lib/live/knockout-forecast/strength.json','utf8'));
for(const stage of ['PLAY_IN','SWISS','KNOCKOUT'])for(const bestOf of [1,3,5]){
 const m={stage,a:'GEN',b:'T1',bestOf},r=stage==='KNOCKOUT'?strength.ratings:pre,p=matchPrediction(m,pre,strength.ratings,strength.gpr.updatedDate);
 assert.equal(p.a,seriesProbability(gameProbability(r.GEN,r.T1),bestOf));assert.equal(p.a+p.b,1);
 assert.ok(Math.abs(matchPrediction({...m,a:'T1',b:'GEN'},pre,strength.ratings,strength.gpr.updatedDate).b-p.a)<1e-12);
 assert.deepEqual(matchPrediction({...m,scoreA:0,scoreB:3,winner:'T1'},pre,strength.ratings,strength.gpr.updatedDate),p);
}
assert.throws(()=>matchPrediction({stage:'SWISS',a:'TBD',b:'T1',bestOf:1},pre,strength.ratings,strength.gpr.updatedDate));
const view=await readLiveView();assert.equal(view.matches.length,45);for(const m of view.matches){assert.ok(m.prediction);assert.ok(m.prediction.a>0&&m.prediction.a<1);assert.equal(m.prediction.a+m.prediction.b,1);assert.equal(m.prediction.basis,m.stage==='KNOCKOUT'?'2026-10-31 GPR':'赛前 GPR');}
console.log('Match prediction: all 45 completed/scheduled matches, stage models, BO formats and result independence passed');
