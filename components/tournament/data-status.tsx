import {teams} from '../../lib/sim/data';
import {riotGprSnapshot} from '../../lib/sim/gprSnapshot';
import {teamSnapshotMetadata} from '../../lib/sim/teamSnapshot';
import {seedAssumptionLabel} from '../../lib/sim/seedAssignments';
import {precomputedOdds} from '../../lib/sim/precomputed';
import {MODEL_VERSION} from '../../lib/sim/ratingConfig';
const covered=teams.filter(t=>t.officialGprScore!==undefined).length;
const confirmed=teams.filter(t=>t.confirmed).length;
const generated=new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(precomputedOdds.metadata.generatedAt));
export function DataDetails({showSimulationCount=true}:{showSimulationCount?:boolean}){return <>
 <p>队伍 {confirmed}/{teams.length} 已确认 · {teams.every(t=>t.officialSeed!==null)?'种子已确认':'种子待定'}；GPR {covered}/{teams.length}，{teams.length-covered} 队使用回退评分。</p><p>队伍快照：{teamSnapshotMetadata.snapshotUpdatedAt} · GPR 快照：{riotGprSnapshot.sourceUpdatedAt}。</p>
 <p>{showSimulationCount&&<>{precomputedOdds.metadata.simulationCount.toLocaleString('en-US')} 次完整模拟 · </>}概率生成：{generated} CST。</p>
 <p>模型：{MODEL_VERSION} · 赛制：{precomputedOdds.metadata.rulesVersion}。</p>
 </>;}
export function DataStatus({compact=false}:{compact?:boolean}){if(compact)return <><div className="data-status" aria-label="数据状态">
 <span><b>队伍</b> {confirmed}/{teams.length} 已确认 · {teams.every(t=>t.officialSeed!==null)?'种子已确认':'种子待定'}</span>
 <span><b>GPR</b> {covered}/{teams.length} · {teams.length-covered} 队回退 · {riotGprSnapshot.sourceUpdatedAt}</span>
 </div>{teams.some(t=>t.officialSeed===null)&&<p className="fine">{seedAssumptionLabel}</p>}</>;
 return <><div className="data-status" aria-label="数据状态">
 <span><b>队伍</b> {confirmed}/{teams.length} 已确认 · {teamSnapshotMetadata.snapshotUpdatedAt}</span>
 <span><b>Riot GPR</b> {covered}/{teams.length} 匹配 · 回退 {teams.length-covered} · {riotGprSnapshot.sourceUpdatedAt} 快照</span>
 <span><b>夺冠概率</b> {precomputedOdds.metadata.simulationCount.toLocaleString('en-US')} 次 · {generated} CST</span>
 <span><b>模型</b> {MODEL_VERSION} · 赛制 {precomputedOdds.metadata.rulesVersion}</span>
 </div><p className="fine">{seedAssumptionLabel}</p></>}
