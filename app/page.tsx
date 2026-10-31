import Link from 'next/link';
import {loadLiveView} from '../lib/live/view-server';
import {HomeLivePreview,HomeMatchPreview} from '../components/live/live-tournament';
import styles from './home.module.css';
export const metadata={title:'Worlds 2026 · 赛事观赛总览',description:'Worlds 2026 赛程、赛果、队伍数据与晋级概率走势。'};
export default async function Home(){
 const live=await loadLiveView();
 const spotlight=['GEN','T1','BLG','KC'];
 const preview={...live,teams:spotlight.map(id=>live.teams.find(t=>t.id===id)!)};
 return <main className={`shell ${styles.home}`}>
  <header className={styles.hero}><h1>WORLDS <span className="accent">2026</span></h1><p>赛程、数据与晋级走势</p></header>
  <section className={styles.section} aria-labelledby="home-trends"><div className={styles.heading}><h2 id="home-trends">重点队伍走势</h2><Link href="/live#probability-title">查看全部19队走势 →</Link></div><HomeLivePreview data={preview}/></section>
  <section className={styles.section} aria-labelledby="home-matches"><div className={styles.heading}><h2 id="home-matches">MATCHUPS</h2><Link href="/live#matches-title">完整赛程与赛果 →</Link></div><HomeMatchPreview data={live}/></section>
  <section className={styles.section} aria-labelledby="home-data"><div className={styles.heading}><h2 id="home-data">战队与选手数据</h2><Link href="/teams">查看全部档案 →</Link></div><div className={styles.resources}><Link href="/teams"><h3>战队档案</h3><p>阵容、赛区统计、比赛风格与英雄池</p></Link><Link href="/rankings"><h3>Riot GPR 实力榜</h3><p>赛前队伍战力排名</p></Link></div></section>
  <aside className={styles.simulator}><div><h2>探索你的赛事路径</h2><p>自行选择比赛结果，模拟另一种可能。</p></div><Link href="/simulator">进入模拟器 →</Link></aside>
 </main>;
}
