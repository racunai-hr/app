/** Fine Star POD-RDG for 2021. Public RGFI disclosure and the notes tables. */

import type { PodRdgRow } from './podRdg2014';
import { POD_RDG_FROM_2016_SPECS } from './podRdg2016';

const AMOUNTS: Record<string, [number, number]> = {
  '131': [1, 3168],
  '133': [0, 1440],
  '136': [0, 1440],
  '142': [1, 1728],
  '154': [0, 3809],
  '161': [0, 534],
  '163': [0, 3275],
  '165': [0, 9416],
  '168': [0, 5500],
  '169': [0, 371],
  '172': [0, 3545],
  '177': [0, 3809],
  '178': [1, 12584],
  '179': [-1, -8775],
  '181': [1, 8775],
  '183': [-1, -8775],
  '185': [1, 8775],
};

export const FINESTAR_POD_RDG_2021: PodRdgRow[] = POD_RDG_FROM_2016_SPECS.map(
  ([aop, label, depth, kind]) => {
    const pair = AMOUNTS[aop] ?? [0, 0];
    return { aop, label, depth, kind, previous: pair[0], current: pair[1] };
  },
);
