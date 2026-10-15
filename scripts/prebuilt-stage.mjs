// Isolated copy of this linked project for reproducible CLI builds, not a new project.
import {mkdtemp,mkdir,readFile,writeFile,copyFile,readdir,rm,realpath} from 'node:fs/promises';
import {join,dirname,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
export async function stagePrebuilt(root){
 const stage=await mkdtemp(join(await realpath('/tmp'),'worlds-s16-build-'));
 const tracked=execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
 for(const path of tracked){
  if(path.startsWith('.env')||path.startsWith('.vercel/')||path.startsWith('.team-stats-release/'))throw Error('Private input in source inventory');
  const target=join(stage,path);await mkdir(dirname(target),{recursive:true});await copyFile(join(root,path),target);
 }
 await mkdir(join(stage,'.vercel'),{recursive:true});
 await copyFile(join(root,'.vercel/project.json'),join(stage,'.vercel/project.json'));
 const env=await readFile(join(root,'.vercel/.env.production.local'),'utf8');
 const safe=env.split('\n').filter(line=>/^(VERCEL|VERCEL_ENV|VERCEL_TARGET_ENV)=/.test(line));
 if(!safe.some(line=>/^VERCEL_ENV=["']?production["']?$/.test(line)))throw Error('Pull actual Production settings before staging');
 // No OIDC token or developer .env files in the staging source.
 await writeFile(join(stage,'.vercel/.env.production.local'),safe.join('\n')+'\n',{mode:0o600});
 await mkdir(join(stage,'.team-stats-release'),{mode:0o700});
 await copyFile(join(root,'.team-stats-release/data.json'),join(stage,'.team-stats-release/data.json'));
 return stage;
}
export async function finalizePrebuilt(output){
 const path=join(output,'builds.json'),meta=JSON.parse(await readFile(path,'utf8'));
 if(meta.target!=='production'||meta.error||meta.builds?.some(b=>b.error))throw Error('Only successful Production output can be finalized');
 // CLI 64 deploy prebuilt consumes target/error/framework, not local builder paths.
 // Retain target guard and build result; drop workstation-only diagnostics.
 meta.argv=['vercel','build','--prod','--standalone'];
 for(const build of meta.builds??[])delete build.requirePath;
 await writeFile(path,JSON.stringify(meta,null,2)+'\n');
 // Optional build diagnostics are not application assets or function inputs.
 for(const dir of ['diagnostics','static/_next/__private'])await rm(join(output,dir),{recursive:true,force:true});
}
export async function artifactFiles(root){
 const out=[];for(const entry of await readdir(root,{withFileTypes:true})){
  const path=resolve(root,entry.name);
  if(entry.isSymbolicLink())continue;
  if(entry.isDirectory())out.push(...await artifactFiles(path));else if(entry.isFile())out.push(path);
 }return out;
}
