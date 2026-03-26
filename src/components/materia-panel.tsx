'use client';

import { useRef, useEffect } from 'react';
import { MATERIA_STATS, STAT_ABBREVIATIONS, type RawStatKey } from '@/lib/data/constants';
import type { Materia } from '@/lib/data/types';
import type { MateriaAssignment } from '@/lib/gear/stats';

interface MateriaPanelProps {
  materiaData: Materia[];
  current: MateriaAssignment | null;
  maxGrade: number;
  onSelect: (materia: MateriaAssignment | null) => void;
  onClose: () => void;
}

/** Materia selection panel - stat × grade grid (like ffxiv-gearing) */
export function MateriaPanel({ materiaData, current, maxGrade, onSelect, onClose }: MateriaPanelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  // Only show high-level materia grades (relevant ones)
  const grades = Array.from({ length: Math.min(maxGrade, 4) }, (_, i) => maxGrade - i);

  return (
    <div
      ref={ref}
      className="absolute z-50 mt-1 left-0"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-lg)',
        minWidth: 340,
      }}
    >
      <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th className="px-3 py-1.5 text-left font-medium w-16" style={{ color: 'var(--text-muted)' }}>屬性</th>
            {grades.map(g => (
              <th key={g} className="px-3 py-1.5 text-center font-medium w-16" style={{ color: 'var(--text-muted)' }}>
                {g}級
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MATERIA_STATS.map(stat => {
            const mat = materiaData.find(m => getStatKeyFromParam(m.baseParam) === stat);
            if (!mat) return null;

            return (
              <tr key={stat} style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="px-3 py-1.5 font-medium" style={{ color: 'var(--accent)' }}>
                  {STAT_ABBREVIATIONS[stat]}
                </td>
                {grades.map(grade => {
                  const value = mat.value[grade - 1] ?? 0;
                  const isSelected = current?.statKey === stat && current?.grade === grade;
                  return (
                    <td key={grade} className="px-1 py-1 text-center">
                      <button
                        onClick={() => onSelect({ statKey: stat as RawStatKey, value, grade })}
                        className="w-full px-2 py-1 transition-all duration-150"
                        style={{
                          borderRadius: '4px',
                          backgroundColor: isSelected ? 'var(--accent)' : 'transparent',
                          color: isSelected ? '#fff' : 'var(--text-primary)',
                          fontFamily: 'monospace',
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        +{value}
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {/* Unmeld row */}
          <tr>
            <td
              colSpan={grades.length + 1}
              className="px-3 py-2 text-center cursor-pointer transition-all duration-150"
              style={{ color: 'var(--text-muted)' }}
              onClick={() => onSelect(null)}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              不鑲嵌魔晶石
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function getStatKeyFromParam(paramId: number): string {
  const map: Record<number, string> = {
    19: 'tenacity', 22: 'dhit', 27: 'crit',
    44: 'determination', 45: 'skillspeed', 46: 'spellspeed', 6: 'piety',
  };
  return map[paramId] ?? '';
}
