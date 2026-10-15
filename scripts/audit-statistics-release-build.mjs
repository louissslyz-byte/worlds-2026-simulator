import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {validateRelease} from '../lib/team-profile/statistics-release.ts';
const bytes=await readFile('.team-stats-release/data.json');validateRelease(JSON.parse(bytes));
async function files(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);if(e.isDirectory())out.push(...await files(p));else if(e.isFile())out.push(p);}return out;}
const hits=[];
for(const p of [...await files('.next/static'),...await files('public')])if((await readFile(p)).includes(bytes)||p.includes('.team-stats-release'))hits.push(p);
assert.deepEqual(hits,[],'Whole release resource must not be a public/client asset');
const traces=(await files('.next/server/app/teams')).filter(p=>p.includes('/[slug]/')&&p.endsWith('.nft.json'));
assert.equal(traces.length,2);
for(const p of traces){const t=JSON.parse(await readFile(p,'utf8'));assert.ok(t.files.some(f=>f.endsWith('.team-stats-release/data.json')),'Vercel function trace must include prepared server resource');assert.ok(!t.files.some(f=>/gol-match-rows|gol-segments|offline-worlds-stats|team-profile-data\.json/.test(f)));}
console.log('发布构建资源验收通过：两条Team Profile函数trace包含聚合资源，client/public无完整发布包，trace无研究输入。');
