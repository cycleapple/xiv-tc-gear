/**
 * Gearset encode/decode using bit-packing and base62.
 *
 * Encoding format (v1):
 *   version(4) + job(22) + level(4) + food(foodRange) +
 *   ringFlip(2) + [12 slots: itemId(65536) + materiaCount(6) + materia data]
 *
 * This is a simplified codec optimized for sharing.
 * Each field is packed using: result = result * range + value
 * Decoded using: value = result % range; result = result / range
 */

import { encode, decode } from './base62';
import { ALL_COMBAT_JOBS, EQUIP_SLOTS, MATERIA_STATS, MATERIA_LEVEL_MAX_NORMAL, type EquipSlotKey, type JobName, type RawStatKey } from '@/lib/data/constants';

const VERSION = 2;
const VERSION_RANGE = 4;
const JOB_RANGE = ALL_COMBAT_JOBS.length; // 22
const LEVEL_RANGE = 4; // indices into SUPPORTED_LEVELS
const ITEM_ID_RANGE = 100000; // 0 = empty, 1-99999 = item IDs (FFXIV IDs can exceed 65535)
const MATERIA_COUNT_RANGE = 6; // 0-5 materia per slot
const MATERIA_STAT_RANGE = MATERIA_STATS.length; // 7 possible stats
const MATERIA_GRADE_RANGE = MATERIA_LEVEL_MAX_NORMAL; // 1-12
const FOOD_RANGE = 100000; // 0 = no food, 1-99999 = food IDs
const FOOD_HQ_RANGE = 2; // 0 = NQ, 1 = HQ

const SUPPORTED_LEVELS_MAP = [70, 80, 90, 100];

export interface SharedMateria {
  statKey: RawStatKey;
  grade: number; // 1-12
}

export interface SharedSlot {
  itemId: number;
  materia: SharedMateria[];
}

export interface SharedGearset {
  job: JobName;
  level: number;
  slots: Record<EquipSlotKey, SharedSlot>;
  foodId: number;
  foodHq: boolean;
}

class BitPacker {
  value = 0n;

  write(v: number, range: number) {
    this.value = this.value * BigInt(range) + BigInt(v);
  }

  toBase62(): string {
    return encode(this.value);
  }
}

class BitReader {
  value: bigint;

  constructor(base62: string) {
    this.value = decode(base62);
  }

  read(range: number): number {
    const r = BigInt(range);
    const v = Number(this.value % r);
    this.value = this.value / r;
    return v;
  }
}

/** Encode a gearset into a base62 string */
export function encodeGearset(gearset: SharedGearset): string {
  const packer = new BitPacker();

  // Write in reverse order (last written = most significant)
  // We'll write: version, job, level, food, foodHq, then slots in reverse

  // First, collect slot data to write in reverse
  const slotData: { itemId: number; materia: SharedMateria[] }[] = [];
  for (const slotKey of EQUIP_SLOTS) {
    const slot = gearset.slots[slotKey];
    slotData.push(slot ?? { itemId: 0, materia: [] });
  }

  // Write slots in reverse order
  for (let i = slotData.length - 1; i >= 0; i--) {
    const slot = slotData[i];
    // Write materia in reverse
    for (let m = slot.materia.length - 1; m >= 0; m--) {
      const mat = slot.materia[m];
      const statIdx = MATERIA_STATS.indexOf(mat.statKey as typeof MATERIA_STATS[number]);
      packer.write(mat.grade - 1, MATERIA_GRADE_RANGE);
      packer.write(statIdx >= 0 ? statIdx : 0, MATERIA_STAT_RANGE);
    }
    packer.write(slot.materia.length, MATERIA_COUNT_RANGE);
    packer.write(slot.itemId, ITEM_ID_RANGE);
  }

  // Food
  packer.write(gearset.foodHq ? 1 : 0, FOOD_HQ_RANGE);
  packer.write(gearset.foodId, FOOD_RANGE);

  // Level
  const levelIdx = SUPPORTED_LEVELS_MAP.indexOf(gearset.level);
  packer.write(levelIdx >= 0 ? levelIdx : 3, LEVEL_RANGE);

  // Job
  const jobIdx = ALL_COMBAT_JOBS.indexOf(gearset.job);
  packer.write(jobIdx >= 0 ? jobIdx : 0, JOB_RANGE);

  // Version
  packer.write(VERSION, VERSION_RANGE);

  return packer.toBase62();
}

/** Decode a base62 string into a gearset */
export function decodeGearset(code: string): SharedGearset {
  const reader = new BitReader(code);

  // Read in forward order (reverse of write order)
  const version = reader.read(VERSION_RANGE);
  if (version !== 2) {
    throw new Error(`Unsupported codec version: ${version}. Please re-share with the latest version.`);
  }

  const jobIdx = reader.read(JOB_RANGE);
  const job = ALL_COMBAT_JOBS[jobIdx];

  const levelIdx = reader.read(LEVEL_RANGE);
  const level = SUPPORTED_LEVELS_MAP[levelIdx] ?? 100;

  const foodId = reader.read(FOOD_RANGE);
  const foodHq = reader.read(FOOD_HQ_RANGE) === 1;

  // Read slots
  const slots: Record<string, SharedSlot> = {};
  for (const slotKey of EQUIP_SLOTS) {
    const itemId = reader.read(ITEM_ID_RANGE);
    const materiaCount = reader.read(MATERIA_COUNT_RANGE);
    const materia: SharedMateria[] = [];
    for (let m = 0; m < materiaCount; m++) {
      const statIdx = reader.read(MATERIA_STAT_RANGE);
      const grade = reader.read(MATERIA_GRADE_RANGE) + 1;
      materia.push({
        statKey: MATERIA_STATS[statIdx] as RawStatKey,
        grade,
      });
    }
    slots[slotKey] = { itemId, materia };
  }

  return {
    job,
    level,
    slots: slots as Record<EquipSlotKey, SharedSlot>,
    foodId,
    foodHq,
  };
}
