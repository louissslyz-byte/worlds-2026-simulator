import Link from 'next/link';
import {profileRegions,teamsByRegion,profileTeams} from '../../lib/team-profile/data';
import {TeamLogo} from '../../components/tournament/team-logo';
import styles from '../../components/team-profile/profile.module.css';
export const metadata={title:'战队档案 · Worlds 2026'};
export default function TeamProfiles(){
 return <main className={`shell ${styles.page}`}>
  <header className={styles.hero}><div className="eyebrow">TEAM PROFILE · WORLDS 2026</div><h1>战队档案</h1><p className={styles.note}>{profileTeams.length} 支参赛队伍 · 按赛区与已知 Worlds 种子排列，待定种子列于最后。</p></header>
  <nav className={styles.regionNav} aria-label="跳转到赛区">{profileRegions.map(region=><a href={`#region-${region}`} key={region}>{region}</a>)}</nav>
  {profileRegions.map(region=><section id={`region-${region}`} className={styles.section} key={region} aria-labelledby={`title-${region}`}>
   <div className={styles.sectionHead}><h2 id={`title-${region}`}>{region}</h2><span className="fine">{teamsByRegion(region).length} 支队伍</span></div>
   <ul className={styles.teamList}>{teamsByRegion(region).map(team=><li key={team.id}><Link href={`/teams/${team.slug}`} className={styles.teamLink}>
    <TeamLogo teamId={team.id} size={36}/><div className={styles.teamCopy}><strong>{team.shortName}</strong><small>{team.name}</small><small>{region}</small></div>
    <span className={styles.seed}>{team.worldsSeed?`#${team.worldsSeed}`:<small>种子待定</small>}</span>
   </Link></li>)}</ul>
  </section>)}
 </main>;
}
