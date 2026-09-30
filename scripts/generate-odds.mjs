import {validateSnapshots} from '../lib/sim/validateSnapshots.ts';
import {access} from 'node:fs/promises';
import {worldsTeamSnapshot} from '../lib/sim/teamSnapshot.ts';
import {writeFile} from 'node:fs/promises';
import {createSession} from '../lib/sim/engine.ts';
import {SystemRatingProvider} from '../lib/sim/ratings.ts';
import {runMonteCarloFromState} from '../lib/sim/monteCarlo.ts';
import {SIMULATION_COUNTS} from '../lib/sim/oddsConfig.ts';

console.log('Snapshot validation:',validateSnapshots());
for(const team of worldsTeamSnapshot.filter(t=>t.confirmed))await access(new URL(`../public${team.logo}`,import.meta.url));
const session=createSession('SYSTEM_MODEL',new SystemRatingProvider().getRatings(),undefined,2026);
const start=performance.now();
const odds=runMonteCarloFromState(session,SIMULATION_COUNTS.production,2026);
if(odds.iterations<SIMULATION_COUNTS.production)throw new Error(`Only ${odds.iterations} of ${SIMULATION_COUNTS.production} simulations completed`);
await writeFile(new URL('../lib/sim/precomputedOdds.json',import.meta.url),`${JSON.stringify(odds,null,2)}\n`);
console.log(`Saved ${odds.iterations.toLocaleString()} simulations in ${((performance.now()-start)/1000).toFixed(1)}s`);
