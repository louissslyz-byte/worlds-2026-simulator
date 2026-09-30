import {playerRoles,teamRosters,type PlayerRole} from '../../lib/sim/rosters';

// Original monochrome lane symbols. Role names remain available to screen readers.
const paths:Record<PlayerRole,string>={
 TOP:'M3 3h18v6h-5V8H8v8H3V3Zm7 11 4-4 4 4-4 4-4-4Z',
 JUNGLE:'m4 3 5 7-1 5 4 6-7-4-2-7 1-7Zm16 0 1 7-2 7-7 4 4-6-1-5 5-7Z',
 MID:'M3 3h7L3 10V3Zm18 18h-7l7-7v7ZM5 21H3v-2L19 3h2v2L5 21Z',
 BOT:'M21 21H3v-6h5v1h8V8h5v13Zm-11-7-4-4 4-4 4 4-4 4Z',
 SUPPORT:'m12 3 4 5-4 5-4-5 4-5Zm-9 7 7 4-2 5-3-4-2-5Zm18 0-2 5-3 4-2-5 7-4ZM10 16h4v5h-4v-5Z',
};
export function PositionIcon({role,label}:{role:PlayerRole;label:string}){
 return <svg className="position-icon" viewBox="0 0 24 24" role="img" aria-label={label}><path d={paths[role]} fill="currentColor"/></svg>;
}
export function RosterStrip({teamId}:{teamId:string}){
 const roster=teamRosters[teamId];
 if(!roster||roster.players.length!==5||roster.players.some(p=>!p))return null;
 return <div className="roster-strip">{playerRoles.map((role,i)=><div className="roster-slot" key={role.key}><PositionIcon role={role.key} label={role.label}/><strong>{roster.players[i]}</strong></div>)}</div>;
}
