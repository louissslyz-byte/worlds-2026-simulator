import Image from 'next/image';
import styles from './region-mark.module.css';
const regions=new Set(['LCK','LPL','LEC','LCS','LCP','CBLOL']);
export function RegionMark({region,showLabel=true,size=22}:{region:string;showLabel?:boolean;size?:number}){
 if(!regions.has(region))return <span>{region}</span>;
 return <span className={styles.mark} data-region={region} title={showLabel?undefined:region} role={showLabel?undefined:'img'} aria-label={showLabel?undefined:region}><span className={styles.icon} style={{width:size,height:size}}><Image src={`/region-logos/${region.toLowerCase()}.png`} alt="" width={size} height={size}/></span>{showLabel&&<span>{region}</span>}</span>;
}
