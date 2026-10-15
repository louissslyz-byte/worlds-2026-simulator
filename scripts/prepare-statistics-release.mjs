// Build-time only. This file never uploads data or provides a download route.
import {readFile,writeFile,mkdir,realpath,lstat,rm} from 'node:fs/promises';
import {join,isAbsolute,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {releaseEnabled,validateRelease} from '../lib/team-profile/statistics-release.ts';
import {preparedLocalInput} from './local-prebuilt-input.mjs';
const root=await realpath('.'),directory=join(root,'.team-stats-release');
await mkdir(directory,{recursive:true,mode:0o700});
if(await realpath(directory)!==directory)throw Error('Release build directory must not be a symlink');
const output=join(directory,'data.json');
try{if((await lstat(output)).isSymbolicLink())throw Error('Release resource must not be a symlink');}catch(error){if(error.code!=='ENOENT')throw error;}
if(!releaseEnabled({...process.env,NODE_ENV:'production'})){
 // Prevent a stale local release resource from entering a disabled build trace.
 await rm(output,{force:true});console.log('Production statistics disabled; release input not read.');
}else{
 const expected=process.env.TEAM_STATS_RELEASE_SHA256;
 if(!/^[a-f0-9]{64}$/.test(expected??''))throw Error('TEAM_STATS_RELEASE_SHA256 is required');
 let bytes;
 if(process.env.TEAM_STATS_BUILD_MODE==='LOCAL_PREBUILT'){
  bytes=await preparedLocalInput(root,expected);
 }else if(!process.env.CI&&!process.env.VERCEL&&process.env.TEAM_STATS_RELEASE_INPUT){
  const path=process.env.TEAM_STATS_RELEASE_INPUT;
  if(!isAbsolute(path))throw Error('Local release input must be an external absolute path');
  const canonical=await realpath(path),rel=relative(root,canonical);
  if(rel!=='..'&&!rel.startsWith('../'))throw Error('Local release input must be outside repository');
  bytes=await readFile(canonical);
 }else{
  throw Error('Production statistics require an approved local prebuilt; cloud input and private snapshot fallback are disabled');
 }
 if(bytes.length>2_000_000||createHash('sha256').update(bytes).digest('hex')!==expected)throw Error('Release artifact size/checksum mismatch');
 try{validateRelease(JSON.parse(bytes.toString('utf8')));}catch{throw Error('Invalid aggregate release schema');}
 await writeFile(output,bytes,{mode:0o600});console.log('Validated aggregate release resource prepared.');
}
