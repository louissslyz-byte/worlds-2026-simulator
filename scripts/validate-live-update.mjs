import {loadSwissUpdate} from '../lib/live/updates/facts.ts';
import {loadFrozenSystem} from '../lib/live/probability/model.ts';
import {validateProbabilityHistory} from '../lib/live/probability/archive.ts';
import {loadUpdateHistory} from '../lib/live/updates/probability.ts';
const {model}=await loadFrozenSystem(),facts=await loadSwissUpdate();await validateProbabilityHistory();
if(process.argv.includes('--facts-only'))console.log(JSON.stringify({factsSHA256:facts.factsSHA256,records:facts.records}));
else {const h=await loadUpdateHistory(model);console.log(JSON.stringify({legacy:'UNCHANGED',snapshots:2+h.snapshots.length,factsSHA256:h.factsSHA256,countSHA256:h.snapshots[0].countSHA256,completed:h.snapshots[0].completedCount,failed:h.snapshots[0].failedCount}));}
