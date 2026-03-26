'use client';

import { create } from 'zustand';
import type { Item, Food, Materia, BaseParam, ItemLevel } from '@/lib/data/types';
import type { EquipSlotKey, JobName, RawStatKey } from '@/lib/data/constants';
import { EQUIP_SLOTS, CURRENT_MAX_LEVEL } from '@/lib/data/constants';
import { encodeGearset, decodeGearset, type SharedGearset, type SharedSlot } from '@/lib/sharing/codec';
import { calculateTotalStats, type SlotEquip, type GearsetSlots, type MateriaAssignment } from '@/lib/gear/stats';

export interface SlotState {
  itemId: number | null;
  materia: (MateriaAssignment | null)[];
}

interface GearsetStore {
  // State
  job: JobName | null;
  level: number;
  slots: Record<EquipSlotKey, SlotState>;
  foodId: number | null;
  foodHq: boolean;

  // Loaded data cache
  items: Item[];
  foods: Food[];
  materiaData: Materia[];
  baseParams: BaseParam[];
  itemLevels: ItemLevel[];
  loading: boolean;
  error: string | null;

  // Actions
  setJob: (job: JobName) => void;
  setSlotItem: (slot: EquipSlotKey, item: Item | null) => void;
  setSlotMateria: (slot: EquipSlotKey, index: number, materia: MateriaAssignment | null) => void;
  setFood: (foodId: number | null, hq: boolean) => void;
  setItems: (items: Item[]) => void;
  setFoods: (foods: Food[]) => void;
  setMateriaData: (materia: Materia[]) => void;
  setBaseParams: (params: BaseParam[]) => void;
  setItemLevels: (levels: ItemLevel[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Sharing
  encodeShareUrl: () => string;
  loadFromCode: (code: string) => void;

  // Computed
  getTotalStats: () => Partial<Record<RawStatKey, number>>;
  getSlotItem: (slot: EquipSlotKey) => Item | undefined;
  getFood: () => Food | undefined;
}

function emptySlots(): Record<EquipSlotKey, SlotState> {
  const slots: Partial<Record<EquipSlotKey, SlotState>> = {};
  for (const s of EQUIP_SLOTS) {
    slots[s] = { itemId: null, materia: [] };
  }
  return slots as Record<EquipSlotKey, SlotState>;
}

export const useGearsetStore = create<GearsetStore>((set, get) => ({
  job: null,
  level: CURRENT_MAX_LEVEL,
  slots: emptySlots(),
  foodId: null,
  foodHq: true,
  items: [],
  foods: [],
  materiaData: [],
  baseParams: [],
  itemLevels: [],
  loading: false,
  error: null,

  setJob: (job) => set({ job, slots: emptySlots(), foodId: null }),
  setSlotItem: (slot, item) => set(state => ({
    slots: {
      ...state.slots,
      [slot]: { itemId: item?.primaryKey ?? null, materia: [] },
    },
  })),
  setSlotMateria: (slot, index, materia) => set(state => {
    const slotState = { ...state.slots[slot] };
    const newMateria = [...slotState.materia];
    while (newMateria.length <= index) newMateria.push(null);
    newMateria[index] = materia;
    return {
      slots: { ...state.slots, [slot]: { ...slotState, materia: newMateria } },
    };
  }),
  setFood: (foodId, hq) => set({ foodId, foodHq: hq }),
  setItems: (items) => set({ items }),
  setFoods: (foods) => set({ foods }),
  setMateriaData: (materiaData) => {
    // Resolve materia values for any slots that have value=0 (e.g. after loadFromCode)
    const state = get();
    const updatedSlots = { ...state.slots };
    let changed = false;
    for (const slotKey of EQUIP_SLOTS) {
      const slot = updatedSlots[slotKey];
      const newMateria = slot.materia.map(m => {
        if (m && m.value === 0 && m.grade > 0) {
          const value = resolveMateriaValue(materiaData, m.statKey, m.grade);
          if (value > 0) {
            changed = true;
            return { ...m, value };
          }
        }
        return m;
      });
      if (changed) {
        updatedSlots[slotKey] = { ...slot, materia: newMateria };
      }
    }
    set({ materiaData, ...(changed ? { slots: updatedSlots as Record<EquipSlotKey, SlotState> } : {}) });
  },
  setBaseParams: (baseParams) => set({ baseParams }),
  setItemLevels: (itemLevels) => set({ itemLevels }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  encodeShareUrl: () => {
    const state = get();
    if (!state.job) return '';

    const sharedSlots: Record<string, SharedSlot> = {};
    for (const slotKey of EQUIP_SLOTS) {
      const slot = state.slots[slotKey];
      sharedSlots[slotKey] = {
        itemId: slot.itemId ?? 0,
        materia: slot.materia
          .filter((m): m is MateriaAssignment => m !== null)
          .map(m => ({ statKey: m.statKey, grade: m.grade })),
      };
    }

    const gearset: SharedGearset = {
      job: state.job,
      level: state.level,
      slots: sharedSlots as Record<EquipSlotKey, SharedSlot>,
      foodId: state.foodId ?? 0,
      foodHq: state.foodHq,
    };

    return encodeGearset(gearset);
  },

  loadFromCode: (code) => {
    try {
      const gearset = decodeGearset(code);
      const slots: Record<string, SlotState> = {};
      for (const slotKey of EQUIP_SLOTS) {
        const shared = gearset.slots[slotKey];
        slots[slotKey] = {
          itemId: shared.itemId || null,
          materia: shared.materia.map(m => {
            // We need to look up the actual materia value from loaded data
            // For now, store the grade and stat, resolve value later
            return { statKey: m.statKey, value: 0, grade: m.grade };
          }),
        };
      }
      set({
        job: gearset.job,
        level: gearset.level,
        slots: slots as Record<EquipSlotKey, SlotState>,
        foodId: gearset.foodId || null,
        foodHq: gearset.foodHq,
      });
    } catch (e) {
      console.error('Failed to decode gearset:', e);
      set({ error: '無法解析分享碼' });
    }
  },

  getTotalStats: () => {
    const state = get();
    const gearsetSlots: GearsetSlots = {};
    for (const slotKey of EQUIP_SLOTS) {
      const slot = state.slots[slotKey];
      if (!slot.itemId) continue;
      const item = state.items.find(i => i.primaryKey === slot.itemId);
      if (!item) continue;
      gearsetSlots[slotKey] = {
        item,
        materia: slot.materia,
      };
    }
    const foodItem = state.foodId ? state.foods.find(f => f.primaryKey === state.foodId) : undefined;
    return calculateTotalStats(
      gearsetSlots,
      foodItem ? { item: foodItem, hq: state.foodHq } : null,
    );
  },

  getSlotItem: (slot) => {
    const state = get();
    const slotState = state.slots[slot];
    if (!slotState.itemId) return undefined;
    return state.items.find(i => i.primaryKey === slotState.itemId);
  },

  getFood: () => {
    const state = get();
    if (!state.foodId) return undefined;
    return state.foods.find(f => f.primaryKey === state.foodId);
  },
}));

const STAT_TO_PARAM: Record<string, number> = {
  tenacity: 19, dhit: 22, crit: 27,
  determination: 44, skillspeed: 45, spellspeed: 46, piety: 6,
};

function resolveMateriaValue(materiaData: Materia[], statKey: string, grade: number): number {
  const paramId = STAT_TO_PARAM[statKey];
  if (!paramId) return 0;
  const mat = materiaData.find(m => m.baseParam === paramId);
  return mat?.value[grade - 1] ?? 0;
}
