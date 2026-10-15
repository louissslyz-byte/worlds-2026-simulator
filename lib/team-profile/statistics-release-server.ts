import 'server-only';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {releaseEnabled,validateRelease,unpackRelease,type ReleaseData} from './statistics-release';
let cached:Promise<ReleaseData>|undefined;
export async function releaseView(key:string){
 if(!releaseEnabled(process.env))return null;
 if(!cached)cached=(async()=>{
  // Fixed server build resource only. Never read TEAM_STATS_SNAPSHOT here.
  const bytes=await readFile(join(process.cwd(),'.team-stats-release/data.json'));
  const expected=process.env.TEAM_STATS_RELEASE_SHA256;
  if(!expected||createHash('sha256').update(bytes).digest('hex')!==expected)throw Error('Statistics release checksum missing or mismatched');
  try{return validateRelease(JSON.parse(bytes.toString('utf8')));}catch{throw Error('Invalid aggregate release schema');}
 })();
 return unpackRelease(await cached,key);
}
