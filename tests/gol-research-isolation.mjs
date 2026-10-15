import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,symlinkSync,rmSync,readFileSync,existsSync,realpathSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync,execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {privateGolResearchDirectory} from '../scripts/private-gol-input.mjs';

const temp=mkdtempSync(join(tmpdir(),'worlds-gol-isolation-'));
const project=join(temp,'project'),external=join(temp,'research');
mkdirSync(project);mkdirSync(external);
for(const name of ['gol-segments.json','gol-match-rows.json'])writeFileSync(join(external,name),'{}');
try{
 assert.equal(privateGolResearchDirectory({GOL_RESEARCH_DIR:external},project),realpathSync(external));
 for(const env of [{},{GOL_RESEARCH_DIR:'relative'},{GOL_RESEARCH_DIR:project},{GOL_RESEARCH_DIR:external,NODE_ENV:'production'},{GOL_RESEARCH_DIR:external,CI:'1'},{GOL_RESEARCH_DIR:external,VERCEL:'1'}])assert.throws(()=>privateGolResearchDirectory(env,project));
 const linked=join(temp,'linked');symlinkSync(project,linked);
 assert.throws(()=>privateGolResearchDirectory({GOL_RESEARCH_DIR:linked},project));
 const inside=join(project,'input.json');writeFileSync(inside,'{}');
 rmSync(join(external,'gol-segments.json'));symlinkSync(inside,join(external,'gol-segments.json'));
 assert.throws(()=>privateGolResearchDirectory({GOL_RESEARCH_DIR:external},project));

 const pool=resolve('lib/team-profile/champion-pools.json');
 const hash=()=>createHash('sha256').update(readFileSync(pool)).digest('hex');const before=hash();
 const env={...process.env};delete env.GOL_RESEARCH_DIR;
 const result=spawnSync(process.execPath,['--import','tsx','scripts/generate-profile-pools.mjs'],{env,encoding:'utf8'});
 assert.notEqual(result.status,0);assert.match(result.stderr,/GOL_RESEARCH_DIR|disabled in production/);
 assert.equal(hash(),before,'Missing private input must never change existing champion pools');
 for(const name of ['gol-match-rows.json','gol-segments.json']){
  const path=`lib/team-profile/${name}`;
  assert.equal(existsSync(path),false,'Research files must stay outside the working tree');
  assert.equal(execFileSync('git',['ls-files','--',path],{encoding:'utf8'}).trim(),'','Research files must leave the index');
  execFileSync('git',['check-ignore','--no-index',path]);
 }
 console.log('GoL隔离验收通过：项目外输入、生产/CI拒绝、符号链接校验、默认不重算、索引与忽略规则。');
}finally{rmSync(temp,{recursive:true,force:true});}
