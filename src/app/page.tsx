'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useGearsetStore } from '@/stores/gearset-store';
import { ALL_COMBAT_JOBS, JOB_DISPLAY_NAMES, JOB_ROLES, JOB_ABBREVIATIONS_TC, JOB_ICONS, EQUIP_SLOTS, type JobName, type EquipSlotKey } from '@/lib/data/constants';
import { fetchItems, fetchFood, fetchMateria } from '@/lib/data/api-client';
import { filterFoodByIlvl } from '@/lib/gear/filters';
import { SlotSection } from '@/components/slot-section';
import { FoodSection } from '@/components/food-section';
import { StatsSummary } from '@/components/stats-summary';
import { SharePanel } from '@/components/share-panel';

export default function HomePage() {
  const {
    job, slots, foodId, foodHq,
    items, foods, materiaData,
    loading, error,
    setJob, setSlotItem, setSlotMateria, setFood,
    setItems, setFoods, setMateriaData,
    setLoading, setError,
    encodeShareUrl, getTotalStats,
  } = useGearsetStore();

  // Load data when job changes
  useEffect(() => {
    if (!job) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchItems(job),
      fetchFood(),
      fetchMateria(),
    ])
      .then(([itemsData, foodData, materiaRes]) => {
        if (cancelled) return;
        setItems(itemsData);
        setFoods(filterFoodByIlvl(foodData));
        setMateriaData(materiaRes.items);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [job, setItems, setFoods, setMateriaData, setLoading, setError]);

  const totalStats = useMemo(() => getTotalStats(), [slots, foodId, foodHq, items, foods]);
  const shareCode = useMemo(() => encodeShareUrl(), [job, slots, foodId, foodHq]);

  // If no job selected, show job selector
  if (!job) {
    return <JobSelector onSelect={setJob} />;
  }

  return (
    <div className="space-y-1">
      {/* Job header bar */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-3">
          <JobSwitcher current={job} onSelect={setJob} />
        </div>
        <SharePanel code={shareCode} />
      </div>

      {loading && (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          載入裝備資料中...
        </div>
      )}

      {error && (
        <div className="text-center py-12" style={{ color: 'var(--stat-over)' }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="flex gap-4">
          {/* Main gear area */}
          <div className="flex-1 min-w-0 space-y-1">
            {EQUIP_SLOTS.map(slot => (
              <SlotSection
                key={slot}
                slot={slot}
                items={items}
                selectedItemId={slots[slot].itemId}
                materia={slots[slot].materia}
                materiaData={materiaData}
                onSelectItem={(item) => setSlotItem(slot, item)}
                onChangeMateria={(index, mat) => setSlotMateria(slot, index, mat)}
              />
            ))}
            <FoodSection
              foods={foods}
              selectedId={foodId}
              hq={foodHq}
              onSelect={setFood}
            />
          </div>

          {/* Stats sidebar */}
          <div className="w-52 shrink-0 hidden lg:block">
            <div className="sticky top-4">
              <StatsSummary stats={totalStats} />
            </div>
          </div>
        </div>
      )}

      {/* Mobile stats (shown below on small screens) */}
      {!loading && !error && (
        <div className="lg:hidden">
          <StatsSummary stats={totalStats} />
        </div>
      )}
    </div>
  );
}

/** Job icon component */
function JobIcon({ job, size = 24 }: { job: JobName; size?: number }) {
  return (
    <img
      src={JOB_ICONS[job]}
      alt={job}
      width={size}
      height={size}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
      loading="lazy"
    />
  );
}

/** Job selector - grid layout for initial selection */
function JobSelector({ onSelect }: { onSelect: (job: JobName) => void }) {
  return (
    <div
      className="max-w-4xl mx-auto p-6"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--border)',
      }}
    >
      <h1 className="text-xl font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
        選擇職業
      </h1>
      <JobGrid onSelect={onSelect} current={null} />
    </div>
  );
}

/** Job button */
function JobButton({ job, isActive, onSelect }: { job: JobName; isActive: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="w-full text-left px-2 py-1.5 text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
      style={{
        borderRadius: 'var(--radius-btn)',
        color: isActive ? '#fff' : 'var(--text-primary)',
        backgroundColor: isActive ? 'var(--accent)' : 'transparent',
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <JobIcon job={job} size={20} />
      <span>{JOB_DISPLAY_NAMES[job]}</span>
    </button>
  );
}

/** Reusable job grid - 5 columns, all roles on one row */
function JobGrid({ onSelect, current }: { onSelect: (job: JobName) => void; current: JobName | null }) {
  const roles = Object.entries(JOB_ROLES);
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '16px',
      }}
    >
      {roles.map(([role, jobs]) => (
        <div key={role}>
          <div
            className="text-sm font-medium mb-2 pb-1"
            style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}
          >
            {role}
          </div>
          <div className="space-y-0.5">
            {jobs.map(job => (
              <JobButton
                key={job}
                job={job}
                isActive={job === current}
                onSelect={() => onSelect(job)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Inline job switcher dropdown - doesn't clear gear data */
function JobSwitcher({ current, onSelect }: { current: JobName; onSelect: (job: JobName) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 transition-all duration-200"
      >
        <JobIcon job={current} size={24} />
        <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
          {JOB_DISPLAY_NAMES[current]}
        </span>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-2 z-50 p-5"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-card)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <JobGrid
            current={current}
            onSelect={(job) => {
              onSelect(job);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
