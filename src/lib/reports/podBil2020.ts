/** Fine Star POD-BIL at 31.12.2020. Public RGFI disclosure, whole kuna. */

import type { PodBilRow } from './podBil2014';
import { POD_BIL_FROM_2016_SPECS } from './podBil2016';

/** Previous column is the 2019 close as restated on the 2020 public filing. */
const AMOUNTS: Record<string, [number, number]> = {
  '002': [0, 664768],
  '010': [0, 664768],
  '011': [0, 664768],
  '037': [20902, 21256],
  '046': [3166, 3520],
  '051': [245, 245],
  '052': [2921, 3275],
  '053': [17736, 17736],
  '059': [17736, 17736],
  '065': [20902, 686024],
  '067': [17981, 17980],
  '068': [20000, 20000],
  '081': [-1789, -2019],
  '083': [1789, 2019],
  '084': [-230, -1],
  '086': [230, 1],
  '107': [0, 664769],
  '115': [0, 664769],
  '122': [2921, 3275],
  '123': [20902, 686024],
};

export const FINESTAR_POD_BIL_2020: PodBilRow[] = POD_BIL_FROM_2016_SPECS.map(
  ([aop, label, depth, kind]) => {
    const pair = AMOUNTS[aop] ?? [0, 0];
    return { aop, label, depth, kind, previous: pair[0], current: pair[1] };
  },
);
