/** Fine Star POD-RDG for 2018. Same GFI scheme as 2016. Prior period is the printed 2017 column. */

import type { PodRdgRow } from './podRdg2014';
import { POD_RDG_FROM_2016_SPECS } from './podRdg2016';

const AMOUNTS: Record<string, [number, number]> = {
  '131': [1129, 230],
  '133': [945, 0],
  '136': [945, 0],
  '142': [184, 230],
  '178': [1129, 230],
  '179': [-1129, -230],
  '181': [1129, 230],
  '183': [-1129, -230],
  '185': [1129, 230],
};

export const FINESTAR_POD_RDG_2018: PodRdgRow[] = POD_RDG_FROM_2016_SPECS.map(
  ([aop, label, depth, kind]) => {
    const pair = AMOUNTS[aop] ?? [0, 0];
    return { aop, label, depth, kind, previous: pair[0], current: pair[1] };
  },
);
