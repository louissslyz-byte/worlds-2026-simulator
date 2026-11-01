import {loadFrozenSystem}from'../lib/live/probability/model.ts';
import {loadDrawHistory}from'../lib/live/updates/knockout-draw.ts';
const{model}=await loadFrozenSystem(),h=await loadDrawHistory(model);console.log(JSON.stringify({snapshotId:h.snapshot.snapshotId,completed:h.snapshot.completedCount,failed:h.snapshot.failedCount,countSHA256:h.snapshot.countSHA256}));
