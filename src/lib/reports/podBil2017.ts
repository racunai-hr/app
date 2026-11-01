/** Fine Star POD-BIL at 31.12.2017. Same GFI scheme as 2016, whole kuna. */

import type { PodBilRow } from './podBil2014';
import { POD_BIL_FROM_2016_SPECS } from './podBil2016';

/** Previous column is the 2016 close as printed on the 2017 scan. */
const AMOUNTS: Record<string, [number, number]> = {
  '037': [21051, 20468],
  '046': [1481, 2272],
  '051': [0, 245],
  '052': [1481, 2027],
  '053': [19570, 18196],
  '059': [19570, 18196],
  '065': [21051, 20468],
  '067': [19570, 18441],
  '068': [20000, 20000],
  '081': [-200, -430],
  '083': [200, 430],
  '084': [-230, -1129],
  '086': [230, 1129],
  '122': [1481, 2027],
  '123': [21051, 20468],
};

export const FINESTAR_POD_BIL_2017: PodBilRow[] = POD_BIL_FROM_2016_SPECS.map(
  ([aop, label, depth, kind]) => {
    const pair = AMOUNTS[aop] ?? [0, 0];
    return { aop, label, depth, kind, previous: pair[0], current: pair[1] };
  },
);
