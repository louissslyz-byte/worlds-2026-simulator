import {loadFrozenSystem} from '../lib/live/probability/model.ts';
import {loadRound5History} from '../lib/live/updates/round5.ts';
const {model}=await loadFrozenSystem(),h=await loadRound5History(model);console.log(JSON.stringify({snapshotId:h.snapshot.snapshotId,completed:h.snapshot.completedCount,failed:h.snapshot.failedCount,countSHA256:h.snapshot.countSHA256}));
