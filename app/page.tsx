import Link from 'next/link';
import {teams} from '../lib/sim/data';
import {worlds2026} from '../lib/sim/worlds2026';
import {createSession} from '../lib/sim/engine';
import {runMonteCarloFromState} from '../lib/sim/monteCarlo';
import {SystemRatingProvider} from '../lib/sim/ratings';
import {TeamIdentity} from '../components/tournament/team-identity';
import {ProbabilityBar} from '../components/tournament/probability-bar';

export default function Home(){
 const top=[...teams].sort((a,b)=>b.rating-a.rating).slice(0,5);
 const odds=runMonteCarloFromState(createSession('SYSTEM_MODEL',new SystemRatingProvider().getRatings(),undefined,2026),300,2026);
 const leaders=Object.entries(odds.probabilities).sort((a,b)=>b[1]-a[1]).slice(0,5);
 return <main className="shell"><div className="page-head"><div><div className="eyebrow">WORLDS 2026 / 赛事模拟</div><h1>全球总决赛模拟器</h1><p>选择你信任的实力判断，亲自决定关键比赛，再让概率模型完成剩余赛程。</p></div><Link href="/simulator/new" className="button">创建你的 Worlds</Link></div>
  <div className="hero-grid"><section className="hero-card"><span className="pill gold">2026 · 赛事模拟</span><h2>你决定胜负，<br/><span className="accent">模型推演以后。</span></h2><p>从入围赛到冠军。指定任意对局比分，剩余比赛按固定的实力模型或你自己的 Tier List 随机模拟。</p><div className="action-row" style={{marginTop:25}}><Link href="/simulator/new" className="button">开始新模拟</Link><Link href="/methodology" className="button secondary">了解模型</Link></div></section><section className="panel"><div className="eyebrow">系统模型 / 实力榜</div><h2>实力榜前五</h2>{top.map((t,i)=><div className="leader" key={t.id}><span className="home-team-leader"><span className="rank-num">{String(i+1).padStart(2,'0')}</span><Link href={`/teams/${t.slug}`}><TeamIdentity teamId={t.id} size={32}/></Link></span><strong className="accent">{t.rating}</strong></div>)}<Link href="/rankings" className="button secondary small" style={{display:'inline-flex',marginTop:18}}>查看完整榜单 →</Link></section></div>
  <div className="section-title"><h2>赛前夺冠概率</h2><span className="fine">系统模型 · 300 次演示模拟</span></div><div className="panel grid grid-2">{leaders.map(([id,p])=><div key={id} className="home-odds-row"><TeamIdentity teamId={id} size={34}/><ProbabilityBar a={p}/><span className="big-percent">{(p*100).toFixed(1)}%</span></div>)}</div>
  <div className="section-title"><h2>赛事框架</h2><span className="fine">从入围赛到冠军</span></div><div className="grid grid-3"><div className="panel"><div className="stat">04 → 01</div><h3>入围赛</h3><p className="muted">四队 Bo5 双败淘汰，一队晋级瑞士轮。</p></div><div className="panel"><div className="stat">16 → 08</div><h3>瑞士轮</h3><p className="muted">同战绩池抽签；累计三胜晋级，三负出局。</p></div><div className="panel"><div className="stat">08 → 01</div><h3>淘汰赛</h3><p className="muted">四分之一决赛、半决赛、决赛，逐轮产生冠军。</p></div></div><p className="note" style={{marginTop:25}}>{worlds2026.dataStatus}。本站 Power Rating、胜率和夺冠概率均为独立模型结果。</p></main>;
}
