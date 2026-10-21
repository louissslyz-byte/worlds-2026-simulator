// Optional local before/after source audit. Never targets the public website.
import assert from 'node:assert/strict';
import {profileTeams,profileRoster} from '../lib/team-profile/data.ts';
const before=new URL(process.env.TEXT_BEFORE_ORIGIN??'http://127.0.0.1:3048');
const after=new URL(process.env.TEXT_AFTER_ORIGIN??'http://127.0.0.1:3051');
for(const root of [before,after])assert.ok(root.protocol==='http:'&&['127.0.0.1','localhost'].includes(root.hostname));
const urls=html=>new Set([...html.split('</main>')[0].matchAll(/href="(https?:[^"<>]+)"/g)].map(m=>m[1].replaceAll('&amp;','&')));
const paths=['/','/rankings','/methodology','/simulator/new','/live','/teams',...profileTeams.flatMap(t=>[`/teams/${t.slug}`,...profileRoster(t.id).slots.map(({player:p})=>`/teams/${t.slug}/${p.slug}`)])];
let sourceURLs=0,poolRows=0;
for(const path of paths){
 const responses=await Promise.all([fetch(new URL(path,before)),fetch(new URL(path,after))]);for(const r of responses)assert.equal(r.status,200,path);
 const [old,now]=await Promise.all(responses.map(r=>r.text())),oldURLs=urls(old),newURLs=urls(now);
 for(const url of oldURLs){assert.ok(newURLs.has(url),`${path}: lost source ${url}`);sourceURLs++;}
 if(path.split('/').length===4&&path.startsWith('/teams/')){
  const tbody=html=>html.match(/<tbody>(.*?)<\/tbody>/s)?.[1];
  assert.equal(tbody(now),tbody(old),`${path}: pool rows changed`);poolRows+=(tbody(now).match(/<tr>/g)||[]).length;
 }
 for(const marker of ['/Users/','gol-match-rows.json','TEAM_STATS_RELEASE_TOKEN'])assert.ok(!now.includes(marker),path+': '+marker);
}
console.log(JSON.stringify({status:'PASS',pages:paths.length,preservedSourceURLs:sourceURLs,unchangedPoolRows:poolRows}));
