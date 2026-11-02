/** Fine Star POD-BIL at 31.12.2022. Public RGFI disclosure and the notes, whole kuna. */

import type { PodBilRow } from './podBil2014';
import { POD_BIL_FROM_2016_SPECS } from './podBil2016';

/** Previous column is the 2021 close. Pasiva total stays one kuna under aktiva, as the portal prints it. */
const AMOUNTS: Record<string, [number, number]> = {
  '002': [664768, 1333796],
  '010': [664768, 1333796],
  '011': [664768, 1156508],
  '017': [0, 177288],
  '037': [31753, 318891],
  '038': [0, 238964],
  '042': [0, 73543],
  '043': [0, 165421],
  '046': [605, 79919],
  '051': [605, 79919],
  '053': [21544, 0],
  '061': [21544, 0],
  '063': [9604, 8],
  '065': [696521, 1652687],
  '067': [9205, -75602],
  '068': [20000, 20000],
  '081': [-2020, -10795],
  '083': [2020, 10795],
  '084': [-8775, -84807],
  '086': [8775, 84807],
  '107': [687316, 1728288],
  '112': [364954, 770177],
  '115': [317443, 901117],
  '117': [0, 42000],
  '118': [4919, 14794],
  '121': [0, 200],
  '123': [696521, 1652686],
};

export const FINESTAR_POD_BIL_2022: PodBilRow[] = POD_BIL_FROM_2016_SPECS.map(
  ([aop, label, depth, kind]) => {
    const pair = AMOUNTS[aop] ?? [0, 0];
    return { aop, label, depth, kind, previous: pair[0], current: pair[1] };
  },
);
