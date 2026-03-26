import { Metadata } from 'next';
import { decodeGearset } from '@/lib/sharing/codec';
import { JOB_DISPLAY_NAMES } from '@/lib/data/constants';
import { SharePageClient } from './client';

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  try {
    const gearset = decodeGearset(code);
    const jobName = JOB_DISPLAY_NAMES[gearset.job] ?? gearset.job;
    const title = `${jobName} 配裝 - XIV 繁中配裝`;
    const description = `FFXIV ${jobName} Lv.${gearset.level} 配裝方案`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
    };
  } catch {
    return { title: '配裝分享 - XIV 繁中配裝' };
  }
}

export default async function SharePage({ params }: Props) {
  const { code } = await params;
  return <SharePageClient code={code} />;
}
