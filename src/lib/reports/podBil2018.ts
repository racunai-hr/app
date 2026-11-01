/** Fine Star POD-BIL at 31.12.2018. Same GFI scheme as 2016, whole kuna. */

import type { PodBilRow } from './podBil2014';
import { POD_BIL_FROM_2016_SPECS } from './podBil2016';

/** Previous column is the 2017 close as printed on the 2018 scan. */
const AMOUNTS: Record<string, [number, number]> = {
  '037': [20468, 20777],
  '046': [2272, 2811],
  '051': [245, 245],
  '052': [2027, 2566],
  '053': [18196, 17966],
  '059': [18196, 17966],
  '065': [20468, 20777],
  '067': [18441, 18211],
  '068': [20000, 20000],
  '081': [-430, -1559],
  '083': [430, 1559],
  '084': [-1129, -230],
  '086': [1129, 230],
  '122': [2027, 2566],
  '123': [20468, 20777],
};

export const FINESTAR_POD_BIL_2018: PodBilRow[] = POD_BIL_FROM_2016_SPECS.map(
  ([aop, label, depth, kind]) => {
    const pair = AMOUNTS[aop] ?? [0, 0];
    return { aop, label, depth, kind, previous: pair[0], current: pair[1] };
  },
);
