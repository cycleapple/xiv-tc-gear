import { Metadata } from 'next';
import { EmbedClient } from './client';

export const metadata: Metadata = {
  title: 'XIV 繁中配裝 - 嵌入',
  robots: 'noindex',
};

interface Props {
  params: Promise<{ code: string }>;
}

export default async function EmbedPage({ params }: Props) {
  const { code } = await params;
  return (
    <html lang="zh-Hant">
      <body style={{ margin: 0, background: '#1a1a2e', fontFamily: 'sans-serif' }}>
        <EmbedClient code={code} />
      </body>
    </html>
  );
}
