import {loadLiveView} from '../../lib/live/view-server';
import {LiveTournament} from '../../components/live/live-tournament';
export const metadata={title:'Live Tournament · Worlds 2026',description:'Worlds 2026 真实赛程、赛果及冻结模型的历史概率快照。'};
export default async function LivePage(){return <LiveTournament data={await loadLiveView()}/>;}
