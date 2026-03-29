'use client';

/** Warning icon shown next to items using Simplified Chinese fallback names */
export function CnFallbackBadge() {
  return (
    <span
      title="繁中伺服器尚未開放"
      style={{
        marginLeft: 4,
        cursor: 'help',
        flexShrink: 0,
        fontSize: '0.85rem',
        lineHeight: 1,
        color: 'var(--gold, #e2b749)',
      }}
    >
      ⚠
    </span>
  );
}
