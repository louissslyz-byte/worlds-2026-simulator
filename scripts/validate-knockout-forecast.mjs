import {readLiveView}from'../lib/live/view-server.ts';
import {loadKnockoutForecast}from'../lib/live/knockout-forecast/load.ts';
const legacy=await readLiveView(),forecast=await loadKnockoutForecast(legacy);console.log(JSON.stringify({originalNodes:legacy.nodes.length,knockoutTeams:forecast.view.teams.length,newNodes:forecast.view.nodes.length,sourceDate:forecast.sourceDate,simulationCounts:forecast.snapshots.map(s=>s.simulationCount),latestProgressAligned:forecast.snapshots.at(-1).legacySnapshotId===legacy.nodes.at(-1).id}));
