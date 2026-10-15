// Local preparation and `vercel build` only. Never invokes deploy, pull or project writes.
import {readFile,writeFile,rm,realpath,cp} from 'node:fs/promises';
import {join,isAbsolute} from 'node:path';
import {spawnSync} from 'node:child_process';
import {stagePrebuilt,finalizePrebuilt} from './prebuilt-stage.mjs';
if(process.env.CI||process.env.VERCEL||process.env.VERCEL_ENV)throw Error('Run the prebuilt wrapper directly on a trusted local workstation');
if(process.versions.node.split('.')[0]!=='22')throw Error('Use Node 22 for the production prebuilt');
const input=process.argv[2];
if(!input||!isAbsolute(input)||!/^[a-f0-9]{64}$/.test(process.env.TEAM_STATS_RELEASE_SHA256??''))throw Error('External candidate path and approved SHA-256 required');
const root=await realpath('.'),binding=JSON.parse(await readFile(join(root,'.vercel/project.json'),'utf8'));
if(!binding.projectId||!binding.orgId||!binding.settings)throw Error('Pull Production settings for the existing linked project before building');
const cli=process.env.VERCEL_CLI_BIN??'vercel';
const globalConfig=process.env.VERCEL_CLI_CONFIG;
const common=globalConfig?['--global-config',globalConfig]:[];
const version=spawnSync(cli,['--version'],{encoding:'utf8'});
if(version.status!==0)throw Error('Vercel CLI unavailable');
if(!/64\.2\.0/.test(version.stdout+version.stderr))throw Error('Use the validated Vercel CLI 64.2.0');
const packageManager=spawnSync('pnpm',['--version'],{encoding:'utf8'});
if(packageManager.status!==0||packageManager.stdout.trim()!=='9.15.9')throw Error('Use the project-pinned pnpm 9.15.9, not a fallback wrapper');
const env={...process.env,TEAM_STATS_RELEASE_ENABLED:'true',TEAM_STATS_RELEASE_INPUT:input};
const prepared=spawnSync(process.execPath,['--import','tsx','scripts/prepare-statistics-release.mjs'],{env,stdio:'inherit'});
if(prepared.status!==0)throw Error('Aggregate preparation failed; no CLI build attempted');
const stage=await stagePrebuilt(root);
const permit=join(stage,'.vercel/team-stats-local-build.json');
await writeFile(permit,JSON.stringify({kind:'LOCAL_PREBUILT',createdAt:Date.now(),pid:process.pid,sha256:env.TEAM_STATS_RELEASE_SHA256,projectId:binding.projectId,orgId:binding.orgId}),{flag:'wx',mode:0o600});
try{
 const buildEnv={...env,TEAM_STATS_BUILD_MODE:'LOCAL_PREBUILT',VERCEL_TELEMETRY_DISABLED:'1'};
 // External paths and unused credentials must not flow into CLI build metadata.
 for(const key of ['TEAM_STATS_RELEASE_INPUT','TEAM_STATS_SNAPSHOT','TEAM_STATS_LOCAL','TEAM_STATS_RELEASE_URL','TEAM_STATS_RELEASE_TOKEN','VERCEL_OIDC_TOKEN','VERCEL_CLI_BIN','VERCEL_CLI_CONFIG'])delete buildEnv[key];
 const result=spawnSync(cli,['build','--prod','--standalone',...common],{env:buildEnv,cwd:stage,stdio:'inherit'});
 if(result.error)throw result.error;
 if(result.status!==0)throw Error('Vercel local build failed; deployment was not attempted');
 await finalizePrebuilt(join(stage,'.vercel/output'));
 await rm(join(root,'.vercel/output'),{recursive:true,force:true});
 await cp(join(stage,'.vercel/output'),join(root,'.vercel/output'),{recursive:true,verbatimSymlinks:true});
 console.log('Vercel production prebuilt generated locally. No deployment was created.');
}finally{await rm(stage,{recursive:true,force:true});}
