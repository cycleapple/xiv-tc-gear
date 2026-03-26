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
          .header-link:hover { border-color: var(--accent) !important; }
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
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>FFXIV 配裝規劃與分享</span>
            <a
              href="https://github.com/cycleapple/xiv-tc-toolbox"
              target="_blank"
              rel="noopener noreferrer"
              className="header-link px-2 py-1"
              style={{
                borderRadius: 'var(--radius-btn)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                transition: 'all 0.2s ease',
              }}
            >
              工具箱
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
