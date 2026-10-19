import {worlds2026} from './worlds2026';
import type {SimulationSession} from './types';

export const LEGACY_SESSION_NOTICE='本局采用旧版赛事规则，已有赛果已保留，只供查看。请新建模拟使用正式抽签规则；新建时会在本浏览器备份旧存档。';
export function isCurrentRulesSession(s:SimulationSession):boolean {
  return s.rulesVersion===worlds2026.rulesVersion&&s.tournamentStateVersion===worlds2026.tournamentStateVersion;
}
export function assertCurrentRulesSession(s:SimulationSession):void {
  if(!isCurrentRulesSession(s))throw Error(LEGACY_SESSION_NOTICE);
}
/** Explicit new-game action archives an incompatible save before replacing it. */
export function persistNewSession(storage:Pick<Storage,'getItem'|'setItem'>,s:SimulationSession):void {
  const raw=storage.getItem('worlds2026-session');
  if(raw){
    let old:SimulationSession|null=null;
    try{old=JSON.parse(raw);}catch{throw Error('旧存档无法读取，请先备份浏览器存档。');}
    if(old&&!isCurrentRulesSession(old)){
      const prefix=`worlds2026-session-archive:${encodeURIComponent(old.id??'legacy')}`;
      let key=prefix,index=0;
      while(storage.getItem(key)!==null&&storage.getItem(key)!==raw){key=`${prefix}:${++index}`;}
      storage.setItem(key,raw); // On quota errors, do not overwrite the original.
    }
  }
  storage.setItem('worlds2026-session',JSON.stringify(s));
}
