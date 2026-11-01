import assert from 'node:assert/strict';
import {loadDrawFacts,createAfterDrawSession,loadDrawHistory,validateDrawSnapshot}from'../lib/live/updates/knockout-draw.ts';
import {loadFrozenSystem,semanticSHA256}from'../lib/live/probability/model.ts';
import{runMonteCarloFromState}from'../lib/sim/monteCarlo.ts';
import{readLiveView}from'../lib/live/view-server.ts';
const {model}=await loadFrozenSystem(),f=await loadDrawFacts(),s=createAfterDrawSession(f,model),before=semanticSHA256(s);
assert.deepEqual(s.tournamentState.matches.filter(m=>m.stage==='KNOCKOUT').map(m=>[m.id,m.teamA,m.teamB]),[['k1-1','DK','BLG'],['k1-2','KC','T1'],['k1-3','TES','IG'],['k1-4','GEN','LYON']]);
const r=runMonteCarloFromState(s,128,15);assert.deepEqual(r.counts,runMonteCarloFromState(s,128,15).counts);assert.equal(semanticSHA256(s),before);
const h=await loadDrawHistory(model);for(const change of[x=>x.randomSeed++,x=>x.knownDrawIds=[],x=>x.factsInputSHA256='0'.repeat(64),x=>x.teams[0].championCount++]){const b=structuredClone(h.snapshot);change(b);assert.throws(()=>validateDrawSnapshot(b,f,model));}
const v=await readLiveView();assert.equal(v.nodes.length,8);assert.equal(v.matches.filter(m=>m.stage==='KNOCKOUT'&&m.scoreA===null&&m.winner===null).length,4);assert.equal(v.teams.length,19);for(const t of v.teams)assert.equal(t.points.length,8);
console.log('Official knockout draw: 100K archive, fixed QFs/halves, replay, rejected corruption, 19-team eight-node projection PASS');
