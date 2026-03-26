'use client';

import { EQUIP_SLOTS, SLOT_DISPLAY_NAMES, STAT_ABBREVIATIONS, JOB_DISPLAY_NAMES, ACQUISITION_SOURCE_NAMES, type EquipSlotKey } from '@/lib/data/constants';
import type { Item, Food, Materia } from '@/lib/data/types';
import type { SharedGearset, SharedMateria } from '@/lib/sharing/codec';

const STAT_TO_PARAM: Record<string, number> = {
  tenacity: 19, dhit: 22, crit: 27,
  determination: 44, skillspeed: 45, spellspeed: 46, piety: 6,
};

interface GearCardProps {
  gearset: SharedGearset;
  items: Item[];
  foods: Food[];
  materiaData?: Materia[];
  compact?: boolean;
}

export function GearCard({ gearset, items, foods, materiaData, compact }: GearCardProps) {
  function getItem(itemId: number): Item | undefined {
    return items.find(i => i.primaryKey === itemId);
  }

  function getMateriaValue(m: SharedMateria): number {
    if (!materiaData) return 0;
    const paramId = STAT_TO_PARAM[m.statKey];
    if (!paramId) return 0;
    const mat = materiaData.find(d => d.baseParam === paramId);
    return mat?.value[m.grade - 1] ?? 0;
  }

  const food = gearset.foodId ? foods.find(f => f.primaryKey === gearset.foodId) : null;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        padding: compact ? '1rem' : '1.5rem',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between pb-3 mb-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <h2
          className="font-bold"
          style={{
            color: 'var(--text-primary)',
            fontSize: compact ? '1.1rem' : '1.25rem',
          }}
        >
          {JOB_DISPLAY_NAMES[gearset.job]} 配裝
        </h2>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Lv.{gearset.level}</span>
      </div>

      {/* Gear list - table layout for alignment */}
      <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: '0 2px' }}>
        <tbody>
          {EQUIP_SLOTS.map(slot => {
            const shared = gearset.slots[slot];
            if (!shared?.itemId) return null;
            const item = getItem(shared.itemId);
            if (!item) return null;

            return (
              <tr key={slot}>
                {/* Slot name */}
                <td
                  className="py-2 pr-3 align-top font-medium whitespace-nowrap"
                  style={{ color: 'var(--accent)', width: 70, fontSize: '0.875rem' }}
                >
                  {SLOT_DISPLAY_NAMES[slot]}
                </td>

                {/* iLvl */}
                <td
                  className="py-2 pr-2 align-top whitespace-nowrap font-mono"
                  style={{ color: 'var(--text-muted)', width: 40, fontSize: '0.875rem' }}
                >
                  i{item.ilvl}
                </td>

                {/* Source */}
                <td
                  className="py-2 pr-2 align-top whitespace-nowrap"
                  style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}
                >
                  {ACQUISITION_SOURCE_NAMES[item.acquisitionSource] ?? ''}
                </td>

                {/* Item name + materia */}
                <td className="py-2 align-top">
                  <div style={{ color: 'var(--text-primary)', fontSize: '0.925rem' }}>
                    {item.tcName ?? item.name}
                  </div>
                  {shared.materia.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {shared.materia.map((m, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5"
                          style={{
                            color: 'var(--stat-cap)',
                            backgroundColor: 'var(--bg-input)',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            border: '1px solid var(--border)',
                          }}
                        >
                          {STAT_ABBREVIATIONS[m.statKey] ?? m.statKey}{getMateriaValue(m) || m.grade}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Food */}
      {food && (
        <div
          className="mt-4 pt-3 flex items-center gap-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <span className="font-medium" style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>食物</span>
          <span style={{ color: 'var(--text-primary)', fontSize: '0.925rem' }}>{food.tcName ?? food.name}</span>
          {gearset.foodHq && (
            <span style={{ color: 'var(--gold)', fontSize: '0.8rem' }}>HQ</span>
          )}
        </div>
      )}
    </div>
  );
}
