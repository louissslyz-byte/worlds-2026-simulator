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
 return <main className="shell"><div className="page-head"><div><div className="eyebrow">WORLDS 2026 / 战队实力</div><h1>系统实力榜</h1><p>点击队伍查看选手名单。评分与夺冠概率来自本站模拟模型，未定种子以赛区席位表示。</p></div><Link className="button" href="/simulator/new">用这套实力开始模拟</Link></div><div className="panel rankings-desktop"><div style={{overflowX:'auto'}}><table className="data-table"><thead><tr><th>排名</th><th>队伍</th><th>赛区</th><th>种子</th><th>模型评分</th><th>夺冠概率</th></tr></thead><tbody>{list.map((t,i)=>{const championship=odds.probabilities[t.id]??0;return <tr key={t.id}><td className="rank-num">{String(i+1).padStart(2,'0')}</td><td><Link className="rank-team-cell" href={`/teams/${t.slug}`}><TeamIdentity teamId={t.id} size={34} showName showRegion={false}/></Link></td><td><span className="region-badge">{t.region}</span></td><td>#{t.seed}{!t.confirmed&&<small> · 待定</small>}</td><td className="accent"><b>{t.rating}</b></td><td className="rank-prob-cell"><strong>{(championship*100).toFixed(1)}%</strong><ProbabilityBar a={championship}/></td></tr>})}</tbody></table></div></div><div className="rankings-mobile">{list.map((t,i)=>{const championship=odds.probabilities[t.id]??0;return <Link className="mobile-ranking-row" href={`/teams/${t.slug}`} key={t.id}><span className="rank-num">{String(i+1).padStart(2,'0')}</span><TeamIdentity teamId={t.id} size={34} showName showRegion/><span className="mobile-ranking-metrics"><strong>{t.rating}</strong><small>夺冠 {(championship*100).toFixed(1)}%</small><ProbabilityBar a={championship}/></span></Link>})}</div><p className="note">LCS 与 CBLOL 的队伍和种子顺序尚未完成对应，因此暂用席位占位。上表为赛前 300 次演示模拟估算；模拟器可计算当前条件下的概率。</p></main>;
}
