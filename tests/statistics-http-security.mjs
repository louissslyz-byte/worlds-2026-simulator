// Run against loopback only, with a known enabled dev or disabled production server.
import assert from 'node:assert/strict';
import http from 'node:http';
const root=new URL(process.env.STATISTICS_BASE_URL??'http://127.0.0.1:3022');
if(root.protocol!=='http:'||!['127.0.0.1','localhost','[::1]'].includes(root.hostname))throw new Error('Local HTTP audit only');
const enabled=process.env.STATISTICS_EXPECT==='enabled';
if(!['enabled','disabled'].includes(process.env.STATISTICS_EXPECT??''))throw new Error('Set STATISTICS_EXPECT=enabled or disabled');
let checked=0;
const isStatistics=text=>['TEAM STATISTICS','PLAYER STATISTICS','DRAFT ANALYSIS'].some(label=>text.includes(label));
// Use raw HTTP so the test really transmits the supplied Host header.
// Some fetch implementations silently normalize that header to the URL host.
const read=(url,headers)=>new Promise((resolve,reject)=>{
 const req=http.get(url,{headers},res=>{const chunks=[];res.on('data',chunk=>chunks.push(chunk));res.on('end',()=>resolve({response:{status:res.statusCode,headers:new Headers(Object.entries(res.headers).filter(([,value])=>value!==undefined).map(([key,value])=>[key,Array.isArray(value)?value.join(','):value]))},body:Buffer.concat(chunks).toString('utf8')}));res.on('error',reject);});
 req.setTimeout(10000,()=>req.destroy(new Error('Local HTTP audit timeout')));req.on('error',reject);
});
async function request(path,headers={}){
 let url=new URL(path,root);let result=await read(url,headers);checked++;
 // Next canonicalizes a direct RSC request to its same-origin ?_rsc URL.
 if([301,302,307,308].includes(result.response.status)&&result.response.headers.get('location')){url=new URL(result.response.headers.get('location'),url);assert.equal(url.origin,root.origin,'never follow a test redirect to an external host');result=await read(url,headers);checked++;}
 for(const marker of ['worlds-six-regions-2026-10-14-v1','sourceGameId','oe:player:'])assert.ok(!result.body.includes(marker),'raw private bundle marker exposed');return result;
}
for(const path of ['/teams/gen','/teams/gen/chovy','/teams/blg','/teams/cfo']){
 for(const headers of [{},{RSC:'1'}]){
  const {response,body}=await request(path,headers);assert.equal(response.status,200,path);assert.equal(isStatistics(body),enabled,path+' HTML/RSC gate');
 }
}
for(const headers of [{host:'public.invalid'},{'x-forwarded-host':'public.invalid'},{'x-forwarded-for':'203.0.113.7'},{forwarded:'for=203.0.113.7'},{'x-forwarded-for':'127.0.0.1, 203.0.113.7'},{RSC:'1','x-forwarded-host':'public.invalid'}]){
 const {body}=await request('/teams/gen',headers);assert.equal(isStatistics(body),false,'untrusted host/proxy must not render statistics');
}
for(const path of ['/team-profile-data.json','/private-data/team-profile-data.json','/api/statistics','/api/statistics?path=/tmp/nonexistent','/lib/team-profile/gol-match-rows.json','/offline-worlds-stats/team-profile-data.json']){
 const {response,body}=await request(path);assert.equal(response.status,404,path);assert.equal(isStatistics(body),false);
}
if(!enabled){
 const {body}=await request('/teams/gen?TEAM_STATS_LOCAL=1&TEAM_STATS_SNAPSHOT=/tmp/nonexistent');assert.equal(isStatistics(body),false);
 for(const path of ['/','/rankings','/simulator/new','/simulator','/methodology','/teams']){const {response}=await request(path);assert.equal(response.status,200,path);}
}
console.log(`本地HTTP安全检查通过：${checked}请求，统计${enabled?'本地启用':'生产关闭'}，HTML/RSC、代理头、下载路径及路由参数检查。`);
