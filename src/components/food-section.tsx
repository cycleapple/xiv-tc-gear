'use client';

import { useState } from 'react';
import type { Food } from '@/lib/data/types';
import { STAT_ABBREVIATIONS, statById } from '@/lib/data/constants';

interface FoodSectionProps {
  foods: Food[];
  selectedId: number | null;
  hq: boolean;
  onSelect: (foodId: number | null, hq: boolean) => void;
}

/** Food section - list format matching slot sections, click to select */
export function FoodSection({ foods, selectedId, hq, onSelect }: FoodSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');

  const selected = foods.find(f => f.primaryKey === selectedId);

  const filtered = search
    ? foods.filter(f => (f.tcName ?? f.name).toLowerCase().includes(search.toLowerCase()))
    : foods;

  // Sort by levelItem desc
  const sorted = [...filtered].sort((a, b) => b.levelItem - a.levelItem);

  function getBonuses(food: Food): { stat: string; max: number }[] {
    const bonuses = hq ? food.bonusesHQ : food.bonuses;
    return Object.entries(bonuses)
      .map(([idStr, bonus]) => {
        const key = statById(parseInt(idStr));
        if (!key) return null;
        return { stat: STAT_ABBREVIATIONS[key] ?? key, max: bonus.max };
      })
      .filter(Boolean) as { stat: string; max: number }[];
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-1.5 cursor-pointer select-none"
        style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>食物</span>
          <label
            className="flex items-center gap-1 text-xs"
            style={{ color: 'var(--text-muted)' }}
            onClick={e => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={hq}
              onChange={e => onSelect(selectedId, e.target.checked)}
              style={{ accentColor: 'var(--gold)' }}
            />
            HQ
          </label>
          {selected && (
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              — {selected.tcName ?? selected.name}
            </span>
          )}
        </div>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {collapsed ? '▸' : '▾'} {foods.length}件
        </span>
      </div>

      {!collapsed && (
        <>
          {/* Search */}
          <div className="px-2 py-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
            <input
              type="text"
              placeholder="搜尋食物..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-2 py-1 text-xs focus:outline-none"
              style={{
                borderRadius: 'var(--radius-btn)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Food list */}
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-sm">
              <tbody>
                {sorted.map(food => {
                  const isSelected = food.primaryKey === selectedId;
                  const bonuses = getBonuses(food);
                  return (
                    <tr
                      key={food.primaryKey}
                      className="cursor-pointer transition-all duration-150"
                      style={{
                        backgroundColor: isSelected ? 'var(--bg-card-hover)' : 'transparent',
                        borderBottom: '1px solid var(--border)',
                        borderLeft: isSelected ? '3px solid var(--gold)' : '3px solid transparent',
                      }}
                      onClick={() => onSelect(isSelected ? null : food.primaryKey, hq)}
                      onMouseEnter={e => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(145,125,84,0.1)';
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td className="px-2 py-1.5 truncate" style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)', maxWidth: 200 }}>
                        {food.tcName ?? food.name}
                      </td>
                      <td className="px-1 py-1.5" style={{ color: 'var(--text-muted)' }}>
                        i{food.levelItem}
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="flex gap-2">
                          {bonuses.map((b, i) => (
                            <span key={i} style={{ color: 'var(--stat-cap)' }}>
                              {b.stat}+{b.max}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
