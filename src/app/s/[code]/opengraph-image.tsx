import { ImageResponse } from '@vercel/og';
import { decodeGearset } from '@/lib/sharing/codec';
import { JOB_DISPLAY_NAMES, EQUIP_SLOTS, SLOT_DISPLAY_NAMES, STAT_ABBREVIATIONS } from '@/lib/data/constants';

export const runtime = 'edge';
export const alt = 'XIV 繁中配裝';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// xiv-tc-toolbox palette
const colors = {
  bgPrimary: '#333',
  bgSecondary: '#222',
  bgCard: '#282828',
  textPrimary: '#eee',
  textSecondary: '#ccc',
  textMuted: '#888',
  accent: '#5C6E8E',
  gold: '#917D54',
  statCap: '#5a9c69',
  border: '#191919',
};

export default async function OGImage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  try {
    const gearset = decodeGearset(code);
    const jobName = JOB_DISPLAY_NAMES[gearset.job] ?? gearset.job;

    const slotEntries = EQUIP_SLOTS
      .map(slot => {
        const shared = gearset.slots[slot];
        if (!shared?.itemId) return null;
        return {
          slot,
          name: SLOT_DISPLAY_NAMES[slot],
          itemId: shared.itemId,
          materia: shared.materia.map(m =>
            `${STAT_ABBREVIATIONS[m.statKey] ?? m.statKey}${m.grade}`
          ),
        };
      })
      .filter(Boolean);

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: colors.bgPrimary,
            color: colors.textPrimary,
            padding: '40px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: colors.textPrimary }}>
              {jobName}
            </div>
            <div style={{ fontSize: '24px', color: colors.textMuted, marginLeft: '16px' }}>
              Lv.{gearset.level} 配裝
            </div>
          </div>

          {/* Gear grid */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', flex: 1 }}>
            {slotEntries.map((entry) => (
              entry && (
                <div
                  key={entry.slot}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: colors.bgCard,
                    borderRadius: '8px',
                    padding: '12px 16px',
                    width: '360px',
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: colors.accent, fontSize: '14px', fontWeight: 600 }}>
                      {entry.name}
                    </span>
                    <span style={{ color: colors.textMuted, fontSize: '14px' }}>#{entry.itemId}</span>
                  </div>
                  {entry.materia.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                      {entry.materia.map((m, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '12px',
                            color: colors.statCap,
                            backgroundColor: colors.bgSecondary,
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: `1px solid ${colors.border}`,
            }}
          >
            <span style={{ color: colors.accent, fontSize: '20px', fontWeight: 'bold' }}>
              XIV 繁中配裝
            </span>
            <span style={{ color: colors.textMuted, fontSize: '16px' }}>
              FFXIV 配裝規劃與分享
            </span>
          </div>
        </div>
      ),
      { ...size }
    );
  } catch {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.bgPrimary,
            color: colors.accent,
            fontSize: '48px',
            fontWeight: 'bold',
          }}
        >
          XIV 繁中配裝
        </div>
      ),
      { ...size }
    );
  }
}
