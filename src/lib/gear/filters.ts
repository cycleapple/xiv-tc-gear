/** Item filtering utilities */

import type { Item, Food } from '@/lib/data/types';
import { MIN_ILVL_ITEMS, MIN_ILVL_FOOD, MAX_ILVL } from '@/lib/data/constants';

/** Filter items by ilvl range for TC server */
export function filterByIlvl(items: Item[], minIlvl = 690, maxIlvl = MAX_ILVL): Item[] {
  return items.filter(item => item.ilvl >= minIlvl && item.ilvl <= maxIlvl);
}

/** Filter food by ilvl */
export function filterFoodByIlvl(foods: Food[], minIlvl = MIN_ILVL_FOOD): Food[] {
  return foods.filter(f => f.levelItem >= minIlvl);
}

/** Sort items by ilvl descending, then by name */
export function sortItems(items: Item[]): Item[] {
  return [...items].sort((a, b) => {
    if (b.ilvl !== a.ilvl) return b.ilvl - a.ilvl;
    return (a.tcName ?? a.name).localeCompare(b.tcName ?? b.name, 'zh-Hant');
  });
}
