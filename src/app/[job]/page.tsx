'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGearsetStore } from '@/stores/gearset-store';
import { ALL_COMBAT_JOBS, type JobName } from '@/lib/data/constants';

/** Redirect /[job] to home page with job pre-selected */
export default function JobRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const jobParam = (params.job as string)?.toUpperCase();
  const setJob = useGearsetStore(s => s.setJob);

  useEffect(() => {
    const validJob = ALL_COMBAT_JOBS.includes(jobParam as JobName) ? (jobParam as JobName) : null;
    if (validJob) {
      setJob(validJob);
    }
    router.replace('/');
  }, [jobParam, setJob, router]);

  return (
    <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
      重新導向中...
    </div>
  );
}
