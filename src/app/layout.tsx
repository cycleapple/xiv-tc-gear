import type { Metadata } from 'next';
import './globals.css';

const SITE_URL = 'https://cycleapple.github.io/xiv-tc-gear';
const TITLE = 'FFXIV 繁中配裝器 | FF14 配裝規劃與分享工具';
const DESCRIPTION =
  'FFXIV 繁體中文配裝規劃工具。支援全戰鬥職業裝備選擇、魔晶石鑲嵌、食物加成計算，以及一鍵分享配裝方案。';

export const metadata: Metadata = {
  title: {
    default: TITLE,
    template: '%s | XIV 繁中配裝',
  },
  description: DESCRIPTION,
  keywords: [
    'FF14', 'FFXIV', '配裝', '配裝器', 'Gear Planner', 'BiS',
    '繁體中文', '繁中', '魔晶石', 'Materia', '食物',
    '裝備', '副本裝', '製作裝', '零式', 'Savage',
    'FFXIV 繁中工具箱',
  ],
  authors: [{ name: 'cycleapple' }],
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  icons: {
    icon: '/xiv-tc-gear/favicon.png',
    shortcut: '/xiv-tc-gear/favicon.png',
    apple: '/xiv-tc-gear/favicon.png',
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: 'FFXIV 繁中工具箱',
    locale: 'zh_TW',
    images: [{ url: '/xiv-tc-gear/favicon.png', width: 40, height: 40 }],
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/xiv-tc-gear/favicon.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
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
