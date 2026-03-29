'use client';

/** Small icon indicator shown next to items using Simplified Chinese fallback names */
export function CnFallbackBadge() {
  return (
    <span
      title="繁中伺服器尚未開放"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 16,
        height: 16,
        borderRadius: '50%',
        backgroundColor: 'rgba(234,179,8,0.15)',
        color: 'var(--gold, #e2b749)',
        fontSize: '0.65rem',
        fontWeight: 700,
        lineHeight: 1,
        marginLeft: 4,
        cursor: 'help',
        flexShrink: 0,
      }}
    >
      簡
    </span>
  );
}
