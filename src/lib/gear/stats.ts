/** Stat calculation utilities */

import { statById, type RawStatKey, MATERIA_STATS, type EquipSlotKey } from '@/lib/data/constants';
import type { Item, Food, FoodStatBonus, BaseParam, ItemLevel } from '@/lib/data/types';

export interface MateriaAssignment {
  statKey: RawStatKey;
  value: number;
  grade: number;
}

export interface SlotEquip {
  item: Item;
  materia: (MateriaAssignment | null)[];
}

export type GearsetSlots = Partial<Record<EquipSlotKey, SlotEquip>>;

/** Get the stat values from an item's baseParamMap, converting param IDs to stat keys */
export function getItemStats(item: Item): Partial<Record<RawStatKey, number>> {
  const stats: Partial<Record<RawStatKey, number>> = {};
  const paramMap = item.canBeHq ? item.baseParamMapHQ : item.baseParamMap;
  for (const [idStr, value] of Object.entries(paramMap)) {
    const key = statById(parseInt(idStr));
    if (key && value > 0) {
      stats[key] = value;
    }
  }
  // Weapon damage
  if (item.canBeHq) {
    if (item.damagePhysHQ > 0) stats.wdPhys = item.damagePhysHQ;
    if (item.damageMagHQ > 0) stats.wdMag = item.damageMagHQ;
  } else {
    if (item.damagePhys > 0) stats.wdPhys = item.damagePhys;
    if (item.damageMag > 0) stats.wdMag = item.damageMag;
  }
  return stats;
}

/** Calculate total stats for a gearset */
export function calculateTotalStats(
  slots: GearsetSlots,
  food?: { item: Food; hq: boolean } | null,
): Partial<Record<RawStatKey, number>> {
  const totals: Partial<Record<RawStatKey, number>> = {};

  function addStat(key: RawStatKey, value: number) {
    totals[key] = (totals[key] ?? 0) + value;
  }

  // Sum gear stats + materia
  for (const equip of Object.values(slots)) {
    if (!equip?.item) continue;
    const itemStats = getItemStats(equip.item);
    for (const [key, val] of Object.entries(itemStats)) {
      addStat(key as RawStatKey, val);
    }
    // Materia
    for (const mat of equip.materia) {
      if (mat) {
        addStat(mat.statKey, mat.value);
      }
    }
  }

  // Food bonuses
  if (food?.item) {
    const bonuses = food.hq ? food.item.bonusesHQ : food.item.bonuses;
    for (const [idStr, bonus] of Object.entries(bonuses)) {
      const key = statById(parseInt(idStr));
      if (key && bonus) {
        const base = totals[key] ?? 0;
        const foodValue = Math.min(
          Math.floor(base * bonus.percentage / 100),
          bonus.max
        );
        addStat(key, foodValue);
      }
    }
  }

  return totals;
}

/** Get the materia stat cap for an item in a specific slot */
export function getMateriaStatCap(
  item: Item,
  statKey: RawStatKey,
  baseParams: BaseParam[],
  itemLevels: ItemLevel[],
  slotKey: EquipSlotKey,
): number {
  const statId = statToIdLocal(statKey);
  if (!statId) return 0;

  const bp = baseParams.find(p => p.primaryKey === statId);
  const il = itemLevels.find(l => l.primaryKey === item.ilvl);
  if (!bp || !il) return 0;

  // Get the percent for this slot
  const pct = getSlotPercent(bp, slotKey, item);
  // Get the ilvl base value for this stat
  const ilvlBase = getIlvlStatBase(il, statKey);

  return Math.floor(ilvlBase * pct / 100);
}

function statToIdLocal(stat: RawStatKey): number | undefined {
  const map: Partial<Record<RawStatKey, number>> = {
    strength: 1, dexterity: 2, vitality: 3, intelligence: 4, mind: 5,
    piety: 6, tenacity: 19, dhit: 22, crit: 27,
    determination: 44, skillspeed: 45, spellspeed: 46,
  };
  return map[stat];
}

function getSlotPercent(bp: BaseParam, slot: EquipSlotKey, item: Item): number {
  const cat = item.equipSlotCategory;
  const isMainHand = (cat.mainHand ?? 0) > 0;
  const isOffHand = (cat.offHand ?? 0) > 0;
  const isTwoHand = isMainHand && isOffHand;

  switch (slot) {
    case 'Weapon': return isTwoHand ? bp.twoHandWeaponPercent : bp.oneHandWeaponPercent;
    case 'OffHand': return bp.offHandPercent;
    case 'Head': return bp.headPercent;
    case 'Body': return bp.chestPercent;
    case 'Hand': return bp.handsPercent;
    case 'Legs': return bp.legsPercent;
    case 'Feet': return bp.feetPercent;
    case 'Ears': return bp.earringPercent;
    case 'Neck': return bp.necklacePercent;
    case 'Wrist': return bp.braceletPercent;
    case 'RingLeft':
    case 'RingRight': return bp.ringPercent;
    default: return 0;
  }
}

function getIlvlStatBase(il: ItemLevel, stat: RawStatKey): number {
  switch (stat) {
    case 'strength': return il.strength;
    case 'dexterity': return il.dexterity;
    case 'vitality': return il.vitality;
    case 'intelligence': return il.intelligence;
    case 'mind': return il.mind;
    case 'piety': return il.piety;
    case 'crit': return il.criticalHit;
    case 'dhit': return il.directHitRate;
    case 'determination': return il.determination;
    case 'skillspeed': return il.skillSpeed;
    case 'spellspeed': return il.spellSpeed;
    case 'tenacity': return il.tenacity;
    default: return 0;
  }
}
