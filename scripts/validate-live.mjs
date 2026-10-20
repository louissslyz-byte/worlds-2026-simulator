// Read and validate only. Never runs Monte Carlo or writes snapshot files.
import {readFile} from 'node:fs/promises';
import {basename} from 'node:path';
import {createHash} from 'node:crypto';
import {loadOfficialSnapshot} from '../lib/live/load.ts';
import {validateOfficialTournament,formatBeijingTime} from '../lib/live/validate.ts';
import {buildA2FactsInput} from '../lib/live/input.ts';
try{
 const args=process.argv.slice(2);let result;
 if(args.length===0)result=await loadOfficialSnapshot();
 else if(args.length===2&&args[0]==='--candidate'){
  const bytes=await readFile(args[1]);const input=JSON.parse(bytes.toString('utf8'));result={...validateOfficialTournament(input),...buildA2FactsInput(input)};
  const manifest=JSON.parse(await readFile(new URL('../lib/live/snapshots/index.json',import.meta.url),'utf8'));
  const existing=Object.hasOwn(manifest,result.data.metadata.snapshotId)?manifest[result.data.metadata.snapshotId]:null;
  if(existing&&(existing.inputSHA256!==result.inputSHA256||existing.fileSHA256!==createHash('sha256').update(bytes).digest('hex')))throw Error('Existing snapshot changed: use a new snapshotId and revisionOf');
  if(!existing&&!result.data.metadata.revisionOf)throw Error('New historical revision needs revisionOf');
  if(result.data.metadata.revisionOf&&!Object.hasOwn(manifest,result.data.metadata.revisionOf))throw Error('Unknown revisionOf snapshot');
  console.log(`Candidate: ${basename(args[1])}; no files written.`);
 }else throw Error('Usage: pnpm live:validate [--candidate <file>]');
 const {data,state,inputSHA256,warnings}=result;
 console.log(JSON.stringify({status:'PASS',snapshotId:data.metadata.snapshotId,asOf:data.metadata.asOf,sourceCheckedAt:data.metadata.sourceCheckedAt,rulesVersion:data.metadata.rulesVersion,teams:data.teamIds.length,completedPlayIn:state.completedMatchIds.length,qualifiedToSwiss:state.qualifiedToSwiss,eliminatedTeams:state.eliminatedTeams,swissParticipants:state.swissParticipants,upcomingMatches:state.upcomingMatchIds.length,swissStageStartsCST:formatBeijingTime(data.stageSchedule.swissRound1StartsAt),inputSHA256,warnings},null,2));
}catch(error){
 // No local source paths or stack traces in the reproducible validation output.
 console.error('Live data validation failed:',error instanceof Error?error.message.replace(/(?:\/Users\/|\/private\/|[A-Z]:\\)\S+/g,'[local path]'):'invalid input');process.exitCode=1;
}
