import {notFound} from 'next/navigation';
import {profileTeams} from '../../../lib/team-profile/data';
import {ProfileHeader} from '../../../components/team-profile/profile-header';
import {ProfileRoster} from '../../../components/team-profile/profile-roster';
import {QualificationPath} from '../../../components/team-profile/qualification-path';
import styles from '../../../components/team-profile/profile.module.css';
export default async function TeamProfile({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const team=profileTeams.find(t=>t.slug===slug);
 if(!team)notFound();
 return <main className={`shell ${styles.page}`}><ProfileHeader team={team}/><ProfileRoster teamId={team.id} teamSlug={team.slug}/><QualificationPath team={team}/></main>;
}
