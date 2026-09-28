import {teamById} from '../../lib/sim/data';
import {TeamLogo} from './team-logo';
export function RegionBadge({region}:{region?:string}){return <span className="region-badge">{region??'—'}</span>}
export function TeamIdentity({teamId,size=36,showName=false,showRegion=true,muted=false}:{teamId?:string|null;size?:number;showName?:boolean;showRegion?:boolean;muted?:boolean}){
 const team=teamId?teamById(teamId):undefined;
 return <span className={`team-identity ${muted?'is-muted':''}`}><TeamLogo key={teamId??'tbd'} teamId={teamId} size={size}/><span className="team-identity-copy"><strong>{team?.shortName??teamId??'待定'}</strong>{showName&&team&&<span className="team-full-name">{team.name}</span>}{showRegion&&team&&<RegionBadge region={team.region}/>}</span></span>
}
