import {TEAMS_UPDATED_AT,teams} from '../../lib/sim/data';
import {riotGprSnapshot} from '../../lib/sim/gprSnapshot';
import {precomputedOdds} from '../../lib/sim/precomputed';

const covered=teams.filter(t=>t.officialGprScore!==undefined).length;
const generated=new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(precomputedOdds.metadata.generatedAt));

export function DataStatus(){return <div className="data-status" aria-label="数据状态">
 <span><b>参赛队伍</b> {TEAMS_UPDATED_AT}</span>
 <span><b>Riot GPR</b> {riotGprSnapshot.sourceUpdatedAt} · CACHED {covered}/{teams.length} 队 · FALLBACK {teams.length-covered} 席</span>
 <span><b>夺冠概率</b> {precomputedOdds.metadata.simulationCount.toLocaleString('en-US')} 次 · {generated} CST</span>
 </div>}
