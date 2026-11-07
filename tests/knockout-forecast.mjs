import assert from 'node:assert/strict';
import {register}from'node:module';import {pathToFileURL}from'node:url';
import React from'react';import{renderToStaticMarkup}from'react-dom/server';
import {readLiveView}from'../lib/live/view-server.ts';
import {loadKnockoutForecast,validateForecast}from'../lib/live/knockout-forecast/load.ts';
import {loadFrozenSystem,semanticSHA256}from'../lib/live/probability/model.ts';
import {loadRound5Facts,createBeforeDrawSession}from'../lib/live/updates/round5.ts';
import {loadDrawFacts,createAfterDrawSession}from'../lib/live/updates/knockout-draw.ts';
import {makeMatch}from'../lib/sim/engine.ts';import {runMonteCarloFromState}from'../lib/sim/monteCarlo.ts';import{stateSHA256}from'../lib/live/updates/adapter.ts';
const legacy=await readLiveView(),before=JSON.stringify(legacy),f=await loadKnockoutForecast(legacy),{model}=await loadFrozenSystem();
assert.equal(f.view.teams.length,8);assert.deepEqual(f.view.nodes.map(n=>n.kind),['BEFORE-DRAW','AFTER-DRAW','QUARTERFINALS-COMPLETE']);assert.notEqual(f.strength.ratingInputSHA256,model.ratingInputSHA256);
const initial=[createBeforeDrawSession(await loadRound5Facts(),model),createAfterDrawSession(await loadDrawFacts(),model)];
for(const [i,base]of initial.entries()){const s=structuredClone(base);s.ratingSnapshot={...f.strength.ratings};s.strengthVersion=f.strength.strengthVersion;s.tournamentState.matches=s.tournamentState.matches.map(m=>m.status==='UNDECIDED'?makeMatch(s,m.id,m.stage,m.round,m.label,m.teamA,m.teamB,m.format):m);assert.equal(stateSHA256(s),f.snapshots[i].stateSHA256);const start=stateSHA256(s),a=runMonteCarloFromState(s,128,17);assert.deepEqual(a.counts,runMonteCarloFromState(s,128,17).counts);assert.equal(stateSHA256(s),start);assert.equal(f.snapshots[i].simulationCount,100000);}
for(const change of[s=>s.strengthSHA256='0'.repeat(64),s=>s.teams[0].championCount++,s=>s.legacySnapshotId='missing',s=>s.qualifiedTeams[0]='HLE',s=>s.simulationCount=99999]){const bad=structuredClone(f.snapshots[0]);change(bad);assert.throws(()=>validateForecast(bad,{...f.strength,strengthSHA256:semanticSHA256(f.strength)},f.snapshots[0].qualifiedTeams,legacy));}
const future=structuredClone(legacy);future.nodes.push({...future.nodes.at(-1),id:'future-progress'});await assert.rejects(loadKnockoutForecast(future),/same official progress/);assert.equal(JSON.stringify(legacy),before);
register('./tests/live-ui-loader.mjs',pathToFileURL('./'));globalThis.React=React;const{LiveTournament}=await import('../components/live/live-tournament.tsx');const html=renderToStaticMarkup(React.createElement(LiveTournament,{data:legacy,knockoutForecast:f}));assert.equal((html.match(/data-live-team=/g)||[]).length,19);assert.equal((html.match(/data-forecast-team=/g)||[]).length,8);assert.equal((html.match(/data-curve=/g)||[]).length,57);assert.equal((html.match(/data-forecast-curve="champion"/g)||[]).length,8);assert.equal((html.match(/id="team-GEN"/g)||[]).length,1);assert.equal((html.match(/id="team-knockout-GEN"/g)||[]).length,1);assert.ok(html.includes('KNOCKOUT FORECAST'));assert.ok(html.includes('相对抽签前变化（pp）'));
console.log('Independent eight-team new-GPR forecast: 3x100K archives, shared engine replay, frozen-input isolation, eight gold curves, unique IDs, synchronized-progress rejection PASS');
