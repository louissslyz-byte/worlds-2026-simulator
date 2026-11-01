import {loadLiveView} from '../../lib/live/view-server';
import {loadKnockoutForecast} from '../../lib/live/knockout-forecast/load';
import {LiveTournament} from '../../components/live/live-tournament';
export const metadata={title:'Live Tournament · Worlds 2026',description:'Worlds 2026 真实赛程、赛果及冻结模型的历史概率快照。'};
export default async function LivePage(){const data=await loadLiveView(),forecast=await loadKnockoutForecast(data);return <LiveTournament data={data} knockoutForecast={{view:forecast.view,sourceDate:forecast.sourceDate}}/>;}
