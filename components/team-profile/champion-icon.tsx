'use client';
import Image from 'next/image';
import {useState} from 'react';
import styles from './profile.module.css';
export function ChampionIcon({championId,championName}:{championId:string;championName:string}){
 const [failed,setFailed]=useState(false);
 return failed?<span className={styles.championIcon} aria-label={`${championName} 图标不可用`}>{championName.slice(0,1)}</span>:
  <Image className={styles.championIcon} src={`https://ddragon.leagueoflegends.com/cdn/16.19.1/img/champion/${championId}.png`} width={32} height={32} unoptimized alt={`${championName} 图标`} onError={()=>setFailed(true)}/>;
}
