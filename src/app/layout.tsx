import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'XIV 繁中配裝',
  description: 'FFXIV 繁體中文配裝規劃與分享工具',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          .header-link:hover { opacity: 0.85; transform: translateY(-1px); }
        `}</style>
      </head>
      <body className="min-h-screen antialiased">
        <header
          className="px-4 py-2 flex items-center justify-between"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <a
            href="/"
            className="font-bold"
            style={{ color: 'var(--text-primary)', fontSize: '1rem' }}
          >
            XIV 繁中配裝
          </a>
          <div className="flex items-center gap-3 text-xs">
            <a
              href="https://cycleapple.github.io/xiv-tc-toolbox/"
              className="header-link px-3 py-1.5"
              style={{
                borderRadius: 'var(--radius-btn)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-card)',
                fontWeight: 500,
                transition: 'all 0.2s ease',
              }}
            >
              返回工具箱
            </a>
            <a
              href="https://discord.gg/X556xjySDG"
              target="_blank"
              rel="noopener noreferrer"
              className="header-link px-3 py-1.5"
              style={{
                borderRadius: 'var(--radius-btn)',
                backgroundColor: '#5865F2',
                color: '#fff',
                fontWeight: 500,
                transition: 'all 0.2s ease',
              }}
            >
              加入 Discord 社群
            </a>
            <a
              href="https://portaly.cc/thecy"
              target="_blank"
              rel="noopener noreferrer"
              className="header-link px-3 py-1.5"
              style={{
                borderRadius: 'var(--radius-btn)',
                backgroundColor: 'var(--gold)',
                color: 'var(--text-primary)',
                fontWeight: 500,
                transition: 'all 0.2s ease',
              }}
            >
              支持作者
            </a>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-2 py-3">
          {children}
        </main>
      </body>
    </html>
  );
}
