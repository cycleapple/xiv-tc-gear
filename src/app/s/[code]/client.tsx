'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { decodeGearset, type SharedGearset } from '@/lib/sharing/codec';
import { JOB_DISPLAY_NAMES } from '@/lib/data/constants';
import { fetchItems, fetchFood, fetchMateria } from '@/lib/data/api-client';
import type { Item, Food, Materia } from '@/lib/data/types';
import { GearCard } from '@/components/gear-card';
import { useGearsetStore } from '@/stores/gearset-store';

export function SharePageClient({ code }: { code: string }) {
  const [gearset, setGearset] = useState<SharedGearset | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [materiaData, setMateriaData] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const loadFromCode = useGearsetStore(s => s.loadFromCode);

  useEffect(() => {
    try {
      const decoded = decodeGearset(code);
      setGearset(decoded);

      Promise.all([
        fetchItems(decoded.job),
        fetchFood(),
        fetchMateria(),
      ]).then(([itemsData, foodData, materiaRes]) => {
        setItems(itemsData);
        setFoods(foodData);
        setMateriaData(materiaRes.items);
        setLoading(false);
      }).catch(err => {
        setError(err.message);
        setLoading(false);
      });
    } catch {
      setError('無法解析分享碼');
      setLoading(false);
    }
  }, [code]);

  if (error) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <p className="mb-4" style={{ color: 'var(--stat-over)' }}>{error}</p>
        <a href="/" style={{ color: 'var(--accent)' }} className="hover:underline">返回首頁</a>
      </div>
    );
  }

  if (loading || !gearset) {
    return (
      <div className="max-w-xl mx-auto text-center py-12" style={{ color: 'var(--text-muted)' }}>
        載入配裝資料中...
      </div>
    );
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  function handleEdit() {
    loadFromCode(code);
    router.push('/');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          <span style={{ color: 'var(--text-primary)' }}>{JOB_DISPLAY_NAMES[gearset.job]}</span>
          <span className="ml-2" style={{ color: 'var(--text-muted)' }}>配裝分享</span>
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEdit}
            className="px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
            style={{
              borderRadius: 'var(--radius-btn)',
              backgroundColor: 'var(--gold)',
              color: '#fff',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            編輯此配裝
          </button>
          <a
            href="/"
            className="px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
            style={{
              borderRadius: 'var(--radius-btn)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            建立新配裝
          </a>
        </div>
      </div>

      <GearCard gearset={gearset} items={items} foods={foods} materiaData={materiaData} />

      <div
        className="flex gap-3 p-4"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--border)',
        }}
      >
        <input
          type="text"
          readOnly
          value={`${baseUrl}/s/${code}`}
          className="flex-1 px-3 py-2.5 text-sm font-mono"
          style={{
            borderRadius: 'var(--radius-btn)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-input)',
            color: 'var(--text-primary)',
          }}
        />
        <button
          onClick={() => {
            navigator.clipboard.writeText(`${baseUrl}/s/${code}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
          style={{
            borderRadius: 'var(--radius-btn)',
            backgroundColor: 'var(--accent)',
            color: '#fff',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {copied ? '已複製！' : '複製連結'}
        </button>
      </div>
    </div>
  );
}
