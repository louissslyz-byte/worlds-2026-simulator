import Link from 'next/link';
import {teams} from '../lib/sim/data';
import {worldsSchedule,scheduleSource,updatedStartTimesSource} from '../lib/sim/schedule';
import {createSession} from '../lib/sim/engine';
import {runMonteCarloFromState} from '../lib/sim/monteCarlo';
import {SystemRatingProvider} from '../lib/sim/ratings';
import {TeamIdentity} from '../components/tournament/team-identity';
import {ProbabilityBar} from '../components/tournament/probability-bar';

export default function Home(){
 const top=[...teams].sort((a,b)=>b.rating-a.rating).slice(0,5);
 const odds=runMonteCarloFromState(createSession('SYSTEM_MODEL',new SystemRatingProvider().getRatings(),undefined,2026),300,2026);
 const leaders=Object.entries(odds.probabilities).sort((a,b)=>b[1]-a[1]).slice(0,5);
 return <main className="shell"><div className="page-head"><div><div className="eyebrow">WORLDS 2026 / 赛事模拟</div><h1>全球总决赛模拟器</h1><p>选定队伍实力，挑选关键比赛的胜者，看看谁能夺冠。</p></div><Link href="/simulator/new" className="button">创建你的 Worlds</Link></div>
  <div className="hero-grid"><section className="hero-card"><span className="pill gold">2026 · 赛事模拟</span><h2>你选关键赛果，<br/><span className="accent">其余交给模拟。</span></h2><p>从入围赛到总决赛，你可以自己选比分，也可以让网站模拟剩余比赛。</p><div className="action-row" style={{marginTop:25}}><Link href="/simulator/new" className="button">开始新模拟</Link><Link href="/methodology" className="button secondary">了解模型</Link></div></section><section className="panel"><div className="eyebrow">系统模型 / 实力榜</div><h2>实力榜前五</h2>{top.map((t,i)=><div className="leader" key={t.id}><span className="home-team-leader"><span className="rank-num">{String(i+1).padStart(2,'0')}</span><Link href={`/teams/${t.slug}`}><TeamIdentity teamId={t.id} size={32}/></Link></span><strong className="accent">{t.rating}</strong></div>)}<Link href="/rankings" className="button secondary small" style={{display:'inline-flex',marginTop:18}}>查看完整榜单 →</Link></section></div>
  <div className="section-title"><h2>赛前夺冠概率</h2><span className="fine">系统模型 · 模拟 300 次后的估算</span></div><div className="panel grid grid-2">{leaders.map(([id,p])=><div key={id} className="home-odds-row"><TeamIdentity teamId={id} size={34}/><ProbabilityBar a={p}/><span className="big-percent">{(p*100).toFixed(1)}%</span></div>)}</div>
  <div className="section-title"><h2>比赛日程</h2><span className="fine">北京时间 CST（UTC+8）</span></div><div className="grid grid-3"><div className="panel"><div className="schedule-card-date">{worldsSchedule['play-in'].date}</div><h3>入围赛</h3><p className="schedule-card-time">{worldsSchedule['play-in'].time}</p><p className="muted">四支队伍争夺最后一个瑞士轮席位。</p></div><div className="panel"><div className="schedule-card-date">{worldsSchedule.swiss.date}</div><h3>瑞士轮</h3><p className="schedule-card-time">{worldsSchedule.swiss.time}</p><p className="muted">赢三场晋级，输三场出局。</p></div><div className="panel"><div className="schedule-card-date">11月4–15日</div><h3>淘汰赛</h3><p className="muted">四分之一决赛、半决赛、决赛，决出冠军。</p><div className="schedule-card-subdates">四分之一决赛 {worldsSchedule.quarterfinals.date} · {worldsSchedule.quarterfinals.time}<br/>半决赛 {worldsSchedule.semifinals.date} · {worldsSchedule.semifinals.time}<br/>决赛 {worldsSchedule.final.date} · {worldsSchedule.final.time}</div></div></div><p className="note" style={{marginTop:25}}>未定席位会标为待定。赛程来源：<a href={scheduleSource} target="_blank" rel="noopener noreferrer">LoL Esports 赛段公告 ↗</a> 和 <a href={updatedStartTimesSource} target="_blank" rel="noopener noreferrer">官方开赛时间 ↗</a>。</p></main>;
}
