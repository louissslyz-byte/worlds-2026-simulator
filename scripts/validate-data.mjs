import {validateSnapshots} from '../lib/sim/validateSnapshots.ts';
import {worldsTeamSnapshot} from '../lib/sim/teamSnapshot.ts';
import {access} from 'node:fs/promises';
console.log(validateSnapshots());
for(const t of worldsTeamSnapshot.filter(t=>t.confirmed))await access(new URL(`../public${t.logo}`,import.meta.url));
console.log('数据和本地 Logo 验证通过');
