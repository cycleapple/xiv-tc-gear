/** Equipment slot utilities */

import { type EquipSlotKey, slotMatchesCategory } from '@/lib/data/constants';
import type { Item } from '@/lib/data/types';

/** Get items that can go in a specific slot */
export function getItemsForSlot(items: Item[], slot: EquipSlotKey): Item[] {
  return items.filter(item =>
    slotMatchesCategory(slot, item.equipSlotCategory as unknown as Record<string, number>)
  );
}

/** Check if an item is a two-handed weapon (blocks offhand) */
export function isTwoHanded(item: Item): boolean {
  const cat = item.equipSlotCategory;
  return (cat.mainHand ?? 0) > 0 && (cat.offHand ?? 0) > 0;
}
