import {validateProbabilityHistory} from '../lib/live/probability/archive.ts';
try{
 const args=process.argv.slice(2);if(args.length>1)throw Error('Usage: pnpm live:odds:validate [candidate-directory]');
 const {index,pre,post}=await validateProbabilityHistory(args[0]);
 console.log(JSON.stringify({status:'PASS',historyId:index.historyId,snapshots:[pre,post].map(s=>({id:s.snapshotId,asOf:s.asOf,simulationCount:s.simulationCount,failedCount:s.failedCount,randomSeed:s.randomSeed,ratingInputSHA256:s.ratingInputSHA256,countSHA256:s.countSHA256})),preExactlyMatchesR1:true},null,2));
}catch(error){console.error('Live odds validation failed:',error instanceof Error?error.message.replace(/(?:\/Users\/|\/private\/|[A-Z]:\\)\S+/g,'[local path]'):'invalid input');process.exitCode=1;}
