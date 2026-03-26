'use client';

import { useEffect, useState } from 'react';
import { decodeGearset, type SharedGearset } from '@/lib/sharing/codec';
import { fetchItems, fetchFood, fetchMateria } from '@/lib/data/api-client';
import type { Item, Food, Materia } from '@/lib/data/types';
import { GearCard } from '@/components/gear-card';

export function EmbedClient({ code }: { code: string }) {
  const [gearset, setGearset] = useState<SharedGearset | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [materiaData, setMateriaData] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError('無法解析');
      setLoading(false);
    }
  }, [code]);

  if (error) {
    return <div style={{ color: '#dc3545', padding: 16, textAlign: 'center' }}>{error}</div>;
  }

  if (loading || !gearset) {
    return <div style={{ color: '#888', padding: 16, textAlign: 'center' }}>載入中...</div>;
  }

  return (
    <div style={{ padding: 8 }}>
      <GearCard gearset={gearset} items={items} foods={foods} materiaData={materiaData} compact />
    </div>
  );
}
