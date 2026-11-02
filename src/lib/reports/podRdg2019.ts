/** Fine Star POD-RDG for 2019. Same GFI scheme as 2016. Prior period is the printed 2018 column. */

import type { PodRdgRow } from './podRdg2014';
import { POD_RDG_FROM_2016_SPECS } from './podRdg2016';

const AMOUNTS: Record<string, [number, number]> = {
  '131': [230, 230],
  '142': [230, 230],
  '178': [230, 230],
  '179': [-230, -230],
  '181': [230, 230],
  '183': [-230, -230],
  '185': [230, 230],
};

export const FINESTAR_POD_RDG_2019: PodRdgRow[] = POD_RDG_FROM_2016_SPECS.map(
  ([aop, label, depth, kind]) => {
    const pair = AMOUNTS[aop] ?? [0, 0];
    return { aop, label, depth, kind, previous: pair[0], current: pair[1] };
  },
);
