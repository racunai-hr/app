/** Fine Star POD-RDG for 2022. Public RGFI disclosure and the notes tables. */

import type { PodRdgRow } from './podRdg2014';
import { POD_RDG_FROM_2016_SPECS } from './podRdg2016';

const AMOUNTS: Record<string, [number, number]> = {
  '131': [3168, 79866],
  '133': [1440, 17870],
  '134': [0, 1548],
  '136': [1440, 16322],
  '137': [0, 61163],
  '138': [0, 42000],
  '139': [0, 10500],
  '140': [0, 8663],
  '142': [1728, 833],
  '154': [3809, 722],
  '161': [534, 7],
  '163': [3275, 0],
  '164': [0, 715],
  '165': [9416, 5663],
  '168': [5500, 5358],
  '169': [371, 105],
  '172': [3545, 200],
  '177': [3809, 722],
  '178': [12584, 85529],
  '179': [-8775, -84807],
  '181': [8775, 84807],
  '183': [-8775, -84807],
  '185': [8775, 84807],
};

export const FINESTAR_POD_RDG_2022: PodRdgRow[] = POD_RDG_FROM_2016_SPECS.map(
  ([aop, label, depth, kind]) => {
    const pair = AMOUNTS[aop] ?? [0, 0];
    return { aop, label, depth, kind, previous: pair[0], current: pair[1] };
  },
);
