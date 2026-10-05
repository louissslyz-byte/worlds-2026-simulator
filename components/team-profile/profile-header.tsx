import Link from 'next/link';
import {TeamLogo} from '../tournament/team-logo';
import {RegionBadge} from '../tournament/team-identity';
import {profileTeams} from '../../lib/team-profile/data';
import styles from './profile.module.css';

export function ProfileHeader({team}:{team:typeof profileTeams[number]}){
 return <header className={styles.hero}>
  <Link className={styles.back} href="/teams">← 战队档案</Link>
  <div className="eyebrow">TEAM PROFILE · WORLDS 2026</div>
  <div className={styles.identity}>
   <TeamLogo teamId={team.id} size={100}/>
   <div><h1>{team.shortName}</h1><p className={styles.fullName}>{team.name}</p>
    <div className={styles.meta}><RegionBadge region={team.region}/><span>{team.worldsSeed?`Worlds #${team.worldsSeed} 种子`:'Worlds 种子待定'}</span></div>
   </div>
  </div>
 </header>;
}
