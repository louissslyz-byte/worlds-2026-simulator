// Offline read-only entry point. No route, network, storage write or simulator adapter.
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {buildA2FactsInput} from './input';
import {validateOfficialTournament} from './validate';
export async function loadOfficialSnapshot(snapshotId='worlds-2026-post-play-in-v1'){
 const manifest:Record<string,{file:string;inputSHA256:string;fileSHA256:string}>=JSON.parse(await readFile(new URL('./snapshots/index.json',import.meta.url),'utf8'));
 const entry=Object.hasOwn(manifest,snapshotId)?manifest[snapshotId]:undefined;
 if(!entry||!/^[-a-z0-9]+\.json$/.test(entry.file)||!/^[a-f0-9]{64}$/.test(entry.inputSHA256)||!/^[a-f0-9]{64}$/.test(entry.fileSHA256))throw Error('Unknown or invalid Live snapshot entry');
 const bytes=await readFile(new URL(`./snapshots/${entry.file}`,import.meta.url));
 if(createHash('sha256').update(bytes).digest('hex')!==entry.fileSHA256)throw Error('Immutable Live snapshot file changed; create a new revision');
 const input:unknown=JSON.parse(bytes.toString('utf8'));
 const validated=validateOfficialTournament(input),a2=buildA2FactsInput(input);
 if(validated.data.metadata.revisionOf&&!Object.hasOwn(manifest,validated.data.metadata.revisionOf))throw Error('Unknown revisionOf snapshot');
 if(validated.data.metadata.snapshotId!==snapshotId||a2.inputSHA256!==entry.inputSHA256)throw Error('Immutable Live snapshot identity/hash mismatch; create a new revision');
 return {...validated,...a2};
}
