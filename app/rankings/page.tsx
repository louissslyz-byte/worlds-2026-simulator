import Link from 'next/link';
import {teams} from '../../lib/sim/data';
import {createSession} from '../../lib/sim/engine';
import {runMonteCarloFromState} from '../../lib/sim/monteCarlo';
import {SystemRatingProvider} from '../../lib/sim/ratings';
import {TeamIdentity} from '../../components/tournament/team-identity';
import {ProbabilityBar} from '../../components/tournament/probability-bar';

export default function Rankings(){
 const list=[...teams].sort((a,b)=>b.rating-a.rating);
 const odds=runMonteCarloFromState(createSession('SYSTEM_MODEL',new SystemRatingProvider().getRatings(),undefined,2026),300,2026);
 return <main className="shell"><div className="page-head"><div><div className="eyebrow">SYSTEM MODEL / DEMO ELO</div><h1>系统实力榜</h1><p>评分仅用于模拟概率。2026 正式参赛队与种子未全部确认，当前名单为演示候选队。</p></div><Link className="button" href="/simulator/new">用这套实力开始模拟</Link></div><div className="panel rankings-desktop"><div style={{overflowX:'auto'}}><table className="data-table"><thead><tr><th>排名</th><th>队伍</th><th>赛区</th><th>示例种子</th><th>Model Rating</th><th>淘汰赛</th><th>夺冠概率</th><th className="hide-mobile">阶段</th></tr></thead><tbody>{list.map((t,i)=>{const championship=odds.probabilities[t.id]??0;const knockout=odds.knockoutProbabilities[t.id]??0;return <tr key={t.id}><td className="rank-num">{String(i+1).padStart(2,'0')}</td><td><Link className="rank-team-cell" href={`/teams/${t.slug}`}><TeamIdentity teamId={t.id} size={34} showName showRegion={false}/></Link></td><td><span className="region-badge">{t.region}</span></td><td>#{t.seed}</td><td className="accent"><b>{t.rating}</b></td><td className="rank-prob-cell"><strong>{(knockout*100).toFixed(1)}%</strong><ProbabilityBar a={knockout}/></td><td className="rank-prob-cell"><strong>{(championship*100).toFixed(1)}%</strong><ProbabilityBar a={championship}/></td><td className="hide-mobile">{t.playIn?'入围赛':'瑞士轮直入'}</td></tr>})}</tbody></table></div></div><div className="rankings-mobile">{list.map((t,i)=>{const championship=odds.probabilities[t.id]??0;return <Link className="mobile-ranking-row" href={`/teams/${t.slug}`} key={t.id}><span className="rank-num">{String(i+1).padStart(2,'0')}</span><TeamIdentity teamId={t.id} size={34} showName showRegion/><span className="mobile-ranking-metrics"><strong>{t.rating}</strong><small>夺冠 {(championship*100).toFixed(1)}%</small><ProbabilityBar a={championship}/></span></Link>})}</div><p className="note">淘汰赛和夺冠概率会随当前模拟状态变化。上表为赛前 300 次演示模拟估算；进入模拟器可重新计算当前条件概率。</p></main>;
}
