'use client';

import { useState, useEffect, useRef } from 'react';
import type { Item, Materia } from '@/lib/data/types';
import type { EquipSlotKey, RawStatKey } from '@/lib/data/constants';
import { SLOT_DISPLAY_NAMES, STAT_ABBREVIATIONS, ACQUISITION_SOURCE_NAMES, slotMatchesCategory, MATERIA_STATS } from '@/lib/data/constants';
import type { MateriaAssignment } from '@/lib/gear/stats';
import { getItemStats } from '@/lib/gear/stats';
import { sortItems, filterByIlvl } from '@/lib/gear/filters';
import { MateriaPanel } from './materia-panel';

interface SlotSectionProps {
  slot: EquipSlotKey;
  items: Item[];
  selectedItemId: number | null;
  materia: (MateriaAssignment | null)[];
  materiaData: Materia[];
  onSelectItem: (item: Item | null) => void;
  onChangeMateria: (index: number, materia: MateriaAssignment | null) => void;
}

const DISPLAY_STATS: RawStatKey[] = ['crit', 'determination', 'dhit', 'skillspeed', 'spellspeed', 'tenacity', 'piety'];

export function SlotSection({
  slot, items, selectedItemId, materia, materiaData,
  onSelectItem, onChangeMateria,
}: SlotSectionProps) {
  // Auto-collapse when item is selected; expand when no item
  const [manualExpand, setManualExpand] = useState(false);
  const prevSelectedRef = useRef(selectedItemId);

  // Auto-collapse after selecting an item
  useEffect(() => {
    if (selectedItemId && !prevSelectedRef.current) {
      // Just selected an item -> collapse
      setManualExpand(false);
    }
    prevSelectedRef.current = selectedItemId;
  }, [selectedItemId]);

  const slotItems = sortItems(
    filterByIlvl(
      items.filter(item =>
        slotMatchesCategory(slot, item.equipSlotCategory as unknown as Record<string, number>)
      )
    )
  );

  const activeStats = DISPLAY_STATS.filter(stat =>
    slotItems.some(item => {
      const stats = getItemStats(item);
      return (stats[stat] ?? 0) > 0;
    })
  );

  // Hide slot entirely if no items available (e.g. OffHand for 2H weapon jobs)
  if (slotItems.length === 0) return null;

  const selectedItem = slotItems.find(i => i.primaryKey === selectedItemId);

  // Show the gear list if: no item selected OR manually expanded
  const showList = !selectedItemId || manualExpand;

  function handleHeaderClick() {
    if (selectedItemId) {
      // Toggle expand/collapse when item is selected
      setManualExpand(!manualExpand);
    }
    // If no item selected, list is always shown, header click does nothing
  }

  function handleSelectItem(item: Item | null) {
    onSelectItem(item);
    // If deselecting (clicking selected item again), keep list open
    if (item === null) {
      setManualExpand(true);
    }
    // selecting collapses via useEffect
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--border)',
        position: 'relative',
      }}
    >
      {/* Slot header */}
      <div
        className="flex items-center justify-between px-3 py-1.5 select-none"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          cursor: selectedItemId ? 'pointer' : 'default',
        }}
        onClick={handleHeaderClick}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
            {SLOT_DISPLAY_NAMES[slot]}
          </span>
          {selectedItem && (
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              — i{selectedItem.ilvl} {selectedItem.tcName ?? selectedItem.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedItemId && (
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {manualExpand ? '▾ 收合' : '▸ 更換'}
            </span>
          )}
          {!selectedItemId && (
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {slotItems.length}件
            </span>
          )}
        </div>
      </div>

      {/* Materia row - always visible when item is selected (even collapsed) */}
      {selectedItem && selectedItem.materiaSlotCount > 0 && (
        <div
          className="flex items-center gap-2 px-3 py-1.5"
          style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: showList ? '1px solid var(--border)' : 'none' }}
        >
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>魔晶石</span>
          <div className="flex gap-1">
            {Array.from({ length: selectedItem.advancedMeldingPermitted ? 5 : selectedItem.materiaSlotCount }, (_, i) => (
              <MateriaSlotButton
                key={i}
                index={i}
                isOvermeld={i >= selectedItem.materiaSlotCount}
                current={materia[i] ?? null}
                materiaData={materiaData}
                onChange={(mat) => onChangeMateria(i, mat)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Gear list table - shown when no item or manually expanded */}
      {showList && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left px-2 py-1 font-medium" style={{ color: 'var(--text-muted)', minWidth: 180 }}>裝備</th>
                <th className="text-center px-1 py-1 font-medium w-10" style={{ color: 'var(--text-muted)' }}>iLv</th>
                <th className="text-left px-1 py-1 font-medium" style={{ color: 'var(--text-muted)' }}>來源</th>
                {activeStats.map(stat => (
                  <th key={stat} className="text-right px-1.5 py-1 font-medium w-12" style={{ color: 'var(--text-muted)' }}>
                    {STAT_ABBREVIATIONS[stat]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slotItems.map(item => {
                const isSelected = item.primaryKey === selectedItemId;
                const stats = getItemStats(item);
                return (
                  <tr
                    key={item.primaryKey}
                    className="cursor-pointer transition-all duration-150"
                    style={{
                      backgroundColor: isSelected ? 'var(--bg-card-hover)' : 'transparent',
                      borderBottom: '1px solid var(--border)',
                      borderLeft: isSelected ? '3px solid var(--accent)' : '3px solid transparent',
                    }}
                    onClick={() => handleSelectItem(isSelected ? null : item)}
                    onMouseEnter={e => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(92,110,142,0.1)';
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td className="px-2 py-1.5 truncate" style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)', maxWidth: 200 }}>
                      {item.tcName ?? item.name}
                    </td>
                    <td className="text-center px-1 py-1.5 font-mono" style={{ color: 'var(--text-muted)' }}>
                      {item.ilvl}
                    </td>
                    <td className="px-1 py-1.5 truncate" style={{ color: 'var(--text-muted)', maxWidth: 80 }}>
                      {ACQUISITION_SOURCE_NAMES[item.acquisitionSource] ?? ''}
                    </td>
                    {activeStats.map(stat => {
                      const val = stats[stat] ?? 0;
                      return (
                        <td
                          key={stat}
                          className="text-right px-1.5 py-1.5 font-mono"
                          style={{ color: val > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}
                        >
                          {val > 0 ? val : ''}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/** Individual materia slot button that opens a panel on click */
function MateriaSlotButton({
  index, isOvermeld, current, materiaData, onChange,
}: {
  index: number;
  isOvermeld: boolean;
  current: MateriaAssignment | null;
  materiaData: Materia[];
  onChange: (materia: MateriaAssignment | null) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        onContextMenu={e => {
          e.preventDefault();
          onChange(null);
        }}
        className="px-2.5 py-1 text-sm transition-all duration-150"
        style={{
          borderRadius: 'var(--radius-btn)',
          border: isOvermeld ? '1px dashed rgba(220,53,69,0.4)' : '1px solid var(--border)',
          backgroundColor: current ? 'var(--bg-input)' : 'transparent',
          color: current ? 'var(--stat-cap)' : 'var(--text-muted)',
        }}
        title={current ? `右鍵移除` : `點擊鑲嵌${isOvermeld ? '(禁斷)' : ''}`}
      >
        {current
          ? `${STAT_ABBREVIATIONS[current.statKey]}+${current.value}`
          : (isOvermeld ? '◇' : '◆')
        }
      </button>

      {open && (
        <MateriaPanel
          materiaData={materiaData}
          current={current}
          maxGrade={isOvermeld ? 11 : 12}
          onSelect={(mat) => {
            onChange(mat);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
