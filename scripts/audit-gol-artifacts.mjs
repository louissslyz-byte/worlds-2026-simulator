// Read-only audit; canary contents and private paths are never printed.
import assert from 'node:assert/strict';
import {readFile,readdir,realpath} from 'node:fs/promises';
import {isAbsolute,relative,resolve} from 'node:path';
const input=process.env.GOL_RESEARCH_DIR;
if(!input||!isAbsolute(input))throw new Error('Set the external private GOL_RESEARCH_DIR for this opt-in audit');
const root=await realpath('.'),directory=await realpath(input),rel=relative(root,directory);
assert.ok(rel==='..'||rel.startsWith('../')||isAbsolute(rel),'Audit input must be outside the repository');
const names=['gol-match-rows.json','gol-segments.json'];
const rows=JSON.parse(await readFile(resolve(directory,names[0]),'utf8'));
const markers=Object.values(rows.players).flatMap(p=>p.rows).slice(0,8).map(row=>JSON.stringify(row));
assert.ok(markers.length,'Real source canaries required');
const originals=await Promise.all(names.map(name=>readFile(resolve(directory,name))));
async function files(dir){const result=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);if(e.isDirectory())result.push(...await files(p));else if(e.isFile())result.push(p);}return result;}
const paths=[...await files('.next'),...await files('public')];
assert.ok(paths.some(p=>p.endsWith('/.next/BUILD_ID')),'Completed production build required');
assert.ok(!paths.some(p=>p.includes('/.next/dev/')),'Isolate development cache before auditing production');
const hits=[];
for(const path of paths){
 const buffer=await readFile(path),text=buffer.toString('utf8');
 if(originals.some(raw=>buffer.includes(raw))||markers.some(m=>text.includes(m)||text.includes(JSON.stringify(m)))||path.endsWith('.nft.json')&&names.some(n=>text.includes(n))||names.some(n=>path.endsWith('/'+n)))hits.push(relative(root,path));
}
console.log(JSON.stringify({filesScanned:paths.length,researchCanariesChecked:markers.length,researchContentOrTraceHits:hits},null,2));
assert.deepEqual(hits,[],'Research data must not enter production/public output');
