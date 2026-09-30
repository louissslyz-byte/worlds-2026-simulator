import {runMonteCarloFromState} from '../../lib/sim/monteCarlo';
import type {SimulationSession} from '../../lib/sim/types';

type Request={session:SimulationSession;iterations:number;seed:number};
const scope=self as unknown as {onmessage:((event:MessageEvent<Request>)=>void)|null;postMessage:(value:unknown)=>void};
scope.onmessage=({data})=>{
 try{scope.postMessage({result:runMonteCarloFromState(data.session,data.iterations,data.seed)})}
 catch(error){scope.postMessage({error:error instanceof Error?error.message:'概率计算失败'})}
};
