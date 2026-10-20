import {validateProbabilityHistory} from '../lib/live/probability/archive.ts';
await validateProbabilityHistory();
import './prepare-statistics-release.mjs';
import {spawnSync} from 'node:child_process';
const result=spawnSync(process.execPath,['node_modules/next/dist/bin/next','build','--webpack'],{stdio:'inherit',env:process.env});
if(result.error)throw result.error;
process.exitCode=result.status??1;
