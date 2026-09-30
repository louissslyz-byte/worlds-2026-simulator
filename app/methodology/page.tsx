import Link from 'next/link';
import {scheduleSource,updatedStartTimesSource,worldsSchedule} from '../../lib/sim/schedule';

const scheduleRows = [
 {name:'入围赛',slot:worldsSchedule['play-in']},
 {name:'瑞士轮',slot:worldsSchedule.swiss},
 {name:'四分之一决赛',slot:worldsSchedule.quarterfinals},
 {name:'半决赛',slot:worldsSchedule.semifinals},
 {name:'总决赛',slot:worldsSchedule.final},
];

export default function Methodology(){
 return <main className="shell"><div className="page-head"><div><div className="eyebrow">关于模拟</div><h1>怎么玩？</h1><p>选一个实力模型，决定你想改写的比分，其余比赛交给模拟器。</p></div><Link href="/simulator/new" className="button">开始模拟</Link></div>
  <div className="grid grid-3 methodology-grid">
   <section className="panel"><h2>1 · 选择实力</h2><p>用系统模型开始，或在 Tier List 中调整队伍顺序。</p></section>
   <section className="panel"><h2>2 · 决定赛果</h2><p>你可以手动选比分，也可以一键模拟剩余比赛。</p></section>
   <section className="panel"><h2>3 · 看夺冠概率</h2><p>随赛程推进，随时更新各队夺冠概率。</p></section>
  </div>
  <section className="schedule-explainer"><div className="section-title"><div><div className="eyebrow">官方赛程</div><h2>2026 世界赛比赛时间</h2></div></div><p className="fine">以下均为北京时间 CST（UTC+8）。瑞士轮不同日期的开赛时间不同。</p><div className="schedule-list">{scheduleRows.map(({name,slot})=><div className="schedule-list-row" key={name}><strong>{name}</strong><span>{slot.date}</span><small>{slot.time}（{slot.zone}）</small></div>)}</div><p className="fine">来源：<a href={scheduleSource} target="_blank" rel="noopener noreferrer">赛段日期 ↗</a> · <a href={updatedStartTimesSource} target="_blank" rel="noopener noreferrer">开赛时间 ↗</a></p></section>
 </main>;
}
