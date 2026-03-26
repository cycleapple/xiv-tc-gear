'use client';

import { useState, useRef, useEffect } from 'react';

interface SharePanelProps {
  code: string;
}

/** Inline share button with dropdown panel */
export function SharePanel({ code }: SharePanelProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!code) return null;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${baseUrl}/s/${code}`;
  const embedUrl = `${baseUrl}/embed/${code}`;
  const embedHtml = `<iframe src="${embedUrl}" width="420" height="640" frameborder="0"></iframe>`;

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-1 text-xs font-medium transition-all duration-200"
        style={{
          borderRadius: 'var(--radius-btn)',
          backgroundColor: 'var(--accent)',
          color: '#fff',
        }}
      >
        分享
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 p-3 space-y-2 z-50"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-card)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {/* Share URL */}
          <div className="space-y-1">
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>分享連結</div>
            <div className="flex gap-1">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-2 py-1 text-xs font-mono min-w-0"
                style={{
                  borderRadius: 'var(--radius-btn)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                onClick={() => copy(shareUrl, 'url')}
                className="px-2 py-1 text-xs shrink-0 transition-all duration-200"
                style={{
                  borderRadius: 'var(--radius-btn)',
                  backgroundColor: 'var(--accent)',
                  color: '#fff',
                }}
              >
                {copied === 'url' ? '✓' : '複製'}
              </button>
            </div>
          </div>

          {/* Embed */}
          <div className="space-y-1">
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>嵌入代碼</div>
            <div className="flex gap-1">
              <input
                type="text"
                readOnly
                value={embedHtml}
                className="flex-1 px-2 py-1 text-xs font-mono min-w-0"
                style={{
                  borderRadius: 'var(--radius-btn)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                onClick={() => copy(embedHtml, 'embed')}
                className="px-2 py-1 text-xs shrink-0 transition-all duration-200"
                style={{
                  borderRadius: 'var(--radius-btn)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                }}
              >
                {copied === 'embed' ? '✓' : '複製'}
              </button>
            </div>
          </div>

          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            分享時只會包含選中的裝備。
          </div>
        </div>
      )}
    </div>
  );
}
