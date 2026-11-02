/** Fine Star POD-RDG for 2020. Public RGFI disclosure. Prior period is the printed 2019 column. */

import type { PodRdgRow } from './podRdg2014';
import { POD_RDG_FROM_2016_SPECS } from './podRdg2016';

const AMOUNTS: Record<string, [number, number]> = {
  '131': [230, 1],
  '142': [230, 1],
  '178': [230, 1],
  '179': [-230, -1],
  '181': [230, 1],
  '183': [-230, -1],
  '185': [230, 1],
};

export const FINESTAR_POD_RDG_2020: PodRdgRow[] = POD_RDG_FROM_2016_SPECS.map(
  ([aop, label, depth, kind]) => {
    const pair = AMOUNTS[aop] ?? [0, 0];
    return { aop, label, depth, kind, previous: pair[0], current: pair[1] };
  },
);
