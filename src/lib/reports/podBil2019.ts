/** Fine Star POD-BIL at 31.12.2019. Same GFI scheme as 2016, whole kuna. */

import type { PodBilRow } from './podBil2014';
import { POD_BIL_FROM_2016_SPECS } from './podBil2016';

/** Previous column is the 2018 close as printed on the 2019 scan. */
const AMOUNTS: Record<string, [number, number]> = {
  '037': [20777, 20902],
  '046': [2811, 3166],
  '051': [245, 245],
  '052': [2566, 2921],
  '053': [17966, 17736],
  '059': [17966, 17736],
  '065': [20777, 20902],
  '067': [18211, 17981],
  '068': [20000, 20000],
  '081': [-1559, -1559],
  '083': [1559, 1559],
  '084': [-230, -460],
  '086': [230, 460],
  '122': [2566, 2921],
  '123': [20777, 20902],
};

export const FINESTAR_POD_BIL_2019: PodBilRow[] = POD_BIL_FROM_2016_SPECS.map(
  ([aop, label, depth, kind]) => {
    const pair = AMOUNTS[aop] ?? [0, 0];
    return { aop, label, depth, kind, previous: pair[0], current: pair[1] };
  },
);
