// Build-time only. This file never uploads data or provides a download route.
import {readFile,writeFile,mkdir,realpath,lstat,rm} from 'node:fs/promises';
import {join,isAbsolute,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {releaseEnabled,validateRelease} from '../lib/team-profile/statistics-release.ts';
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
 if(!process.env.CI&&!process.env.VERCEL&&process.env.TEAM_STATS_RELEASE_INPUT){
  const path=process.env.TEAM_STATS_RELEASE_INPUT;
  if(!isAbsolute(path))throw Error('Local release input must be an external absolute path');
  const canonical=await realpath(path),rel=relative(root,canonical);
  if(rel!=='..'&&!rel.startsWith('../'))throw Error('Local release input must be outside repository');
  bytes=await readFile(canonical);
 }else{
  // Cloud builds accept only a private HTTPS aggregate artifact, never a local path.
  const raw=process.env.TEAM_STATS_RELEASE_URL;
  if(!raw)throw Error('Configure a private HTTPS release artifact before enabling cloud statistics');
  let url;try{url=new URL(raw);}catch{throw Error('Invalid release artifact endpoint');}
  if(url.protocol!=='https:'||url.username||url.password||url.hash||/^(localhost|127\.|10\.|192\.168\.|\[)/i.test(url.hostname)||url.hostname.endsWith('.local'))throw Error('Invalid release artifact endpoint');
  const token=process.env.TEAM_STATS_RELEASE_TOKEN;
  let response;
  try{response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(30000),headers:token?{Authorization:`Bearer ${token}`}:{}});}catch{throw Error('Private release artifact could not be fetched');}
  if(!response.ok)throw Error(`Private release artifact HTTP ${response.status}`);
  const chunks=[];let size=0;
  for await(const chunk of response.body){size+=chunk.length;if(size>2_000_000)throw Error('Release artifact exceeds size budget');chunks.push(chunk);}
  bytes=Buffer.concat(chunks);
 }
 if(bytes.length>2_000_000||createHash('sha256').update(bytes).digest('hex')!==expected)throw Error('Release artifact size/checksum mismatch');
 try{validateRelease(JSON.parse(bytes.toString('utf8')));}catch{throw Error('Invalid aggregate release schema');}
 await writeFile(output,bytes,{mode:0o600});console.log('Validated aggregate release resource prepared.');
}
