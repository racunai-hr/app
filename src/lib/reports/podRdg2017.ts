/** Fine Star POD-RDG for 2017. Same GFI scheme as 2016. Prior period is the printed 2016 column. */

import type { PodRdgRow } from './podRdg2014';
import { POD_RDG_FROM_2016_SPECS } from './podRdg2016';

const AMOUNTS: Record<string, [number, number]> = {
  '131': [230, 1129],
  '133': [0, 945],
  '136': [0, 945],
  '142': [230, 184],
  '178': [230, 1129],
  '179': [-230, -1129],
  '181': [230, 1129],
  '183': [-230, -1129],
  '185': [230, 1129],
};

export const FINESTAR_POD_RDG_2017: PodRdgRow[] = POD_RDG_FROM_2016_SPECS.map(
  ([aop, label, depth, kind]) => {
    const pair = AMOUNTS[aop] ?? [0, 0];
    return { aop, label, depth, kind, previous: pair[0], current: pair[1] };
  },
);
