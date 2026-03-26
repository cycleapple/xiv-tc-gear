'use client';

import { STAT_FULL_NAMES, STAT_ABBREVIATIONS, MAIN_STATS, type RawStatKey } from '@/lib/data/constants';

interface StatsSummaryProps {
  stats: Partial<Record<RawStatKey, number>>;
}

/** Sticky sidebar stats summary (like ffxiv-gearing) */
export function StatsSummary({ stats }: StatsSummaryProps) {
  const displayOrder: RawStatKey[] = [
    'wdPhys', 'wdMag',
    ...MAIN_STATS,
    'vitality',
    'crit', 'determination', 'dhit',
    'skillspeed', 'spellspeed',
    'tenacity', 'piety',
  ];

  const hasStats = Object.keys(stats).length > 0;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
      }}
    >
      <div
        className="px-3 py-1.5 text-sm font-semibold"
        style={{
          color: 'var(--accent)',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        屬性總覽
      </div>
      <div className="px-3 py-2">
        {!hasStats && (
          <div className="text-sm py-2 text-center" style={{ color: 'var(--text-muted)' }}>
            請選擇裝備
          </div>
        )}
        {hasStats && (
          <div className="space-y-1">
            {displayOrder.map(stat => {
              const val = stats[stat];
              if (!val) return null;
              const isMainStat = [...MAIN_STATS, 'vitality'].includes(stat as string);
              const isWeapon = stat === 'wdPhys' || stat === 'wdMag';
              return (
                <div
                  key={stat}
                  className="flex justify-between items-center text-xs"
                  style={{
                    paddingTop: isWeapon ? 0 : undefined,
                    borderTop: (stat === 'crit') ? '1px solid var(--border)' : undefined,
                    marginTop: (stat === 'crit') ? '4px' : undefined,
                    paddingBottom: 2,
                  }}
                >
                  <span style={{ color: isMainStat || isWeapon ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                    {STAT_ABBREVIATIONS[stat] ?? stat}
                  </span>
                  <span
                    className="font-mono"
                    style={{
                      color: 'var(--text-primary)',
                      fontWeight: isMainStat || isWeapon ? 600 : 400,
                    }}
                  >
                    {val}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
