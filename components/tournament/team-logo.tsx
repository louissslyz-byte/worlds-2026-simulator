'use client';
import Image from 'next/image';
import {useState} from 'react';
import {teamById} from '../../lib/sim/data';

export function TeamLogo({teamId,teamName,shortName,src,size=36}:{teamId?:string|null;teamName?:string;shortName?:string;src?:string;size?:number}){
  const team=teamId?teamById(teamId):undefined;
  const [failed,setFailed]=useState(false);
  const name=teamName??team?.name??'待定队伍';
  const initials=shortName??team?.shortName??teamId??'TBD';
  const source=src??team?.logo;
  return <span className="team-logo" style={{width:size,height:size}} aria-label={`${name} 标志`}>
    {source&&!failed?<Image src={source} alt={`${name} 队徽`} width={size} height={size} unoptimized onError={()=>setFailed(true)} className="team-logo-image"/>:<span className="team-logo-fallback" aria-hidden="true">{initials.slice(0,3)}</span>}
  </span>;
}
