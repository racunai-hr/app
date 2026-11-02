/** Fine Star POD-BIL at 31.12.2021. Public RGFI disclosure, whole kuna. */

import type { PodBilRow } from './podBil2014';
import { POD_BIL_FROM_2016_SPECS } from './podBil2016';

/** Previous column is the 2020 close as printed on the 2021 public filing and notes. */
const AMOUNTS: Record<string, [number, number]> = {
  '002': [664768, 664768],
  '010': [664768, 664768],
  '011': [664768, 664768],
  '037': [21256, 31753],
  '046': [3520, 605],
  '051': [245, 605],
  '052': [3275, 0],
  '053': [17736, 21544],
  '061': [17736, 21544],
  '063': [0, 9604],
  '065': [686024, 696521],
  '067': [17980, 9205],
  '068': [20000, 20000],
  '081': [-2019, -2020],
  '083': [2019, 2020],
  '084': [-1, -8775],
  '086': [1, 8775],
  '107': [668044, 687316],
  '112': [0, 364954],
  '115': [664768, 317443],
  '118': [1, 4919],
  '121': [3275, 0],
  '123': [686024, 696521],
};

export const FINESTAR_POD_BIL_2021: PodBilRow[] = POD_BIL_FROM_2016_SPECS.map(
  ([aop, label, depth, kind]) => {
    const pair = AMOUNTS[aop] ?? [0, 0];
    return { aop, label, depth, kind, previous: pair[0], current: pair[1] };
  },
);
