/** Typed fetch wrapper for data.xivgear.app API */

import type {
  ItemsEndpointResponse,
  FoodEndpointResponse,
  MateriaEndpointResponse,
  JobEndpointResponse,
  BaseParamEndpointResponse,
  ItemLevelEndpointResponse,
  Item,
  Food,
} from './types';

const BASE_URL = 'https://data.xivgear.app';

async function fetchApi<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(path, BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText} for ${url}`);
  }
  return res.json() as Promise<T>;
}

// TC name injection
let tcItemNames: Record<number, string> | null = null;

async function getTcItemNames(): Promise<Record<number, string>> {
  if (tcItemNames) return tcItemNames;
  try {
    const mod = await import('./tc-items.json');
    tcItemNames = mod.default as Record<number, string>;
  } catch {
    tcItemNames = {};
  }
  return tcItemNames;
}

function withTcName<T extends { primaryKey: number; tcName?: string }>(
  item: T,
  names: Record<number, string>
): T & { tcName: string | undefined } {
  return { ...item, tcName: names[item.primaryKey] };
}

/** Fetch gear items for a specific job, enriched with TC names */
export async function fetchItems(job: string): Promise<Item[]> {
  const [data, names] = await Promise.all([
    fetchApi<ItemsEndpointResponse>('/Items', { job }),
    getTcItemNames(),
  ]);
  return data.items
    .map(item => withTcName(item, names))
    .filter(item => item.tcName); // Only show items with TC translation
}

/** Fetch food items, enriched with TC names */
export async function fetchFood(): Promise<Food[]> {
  const [data, names] = await Promise.all([
    fetchApi<FoodEndpointResponse>('/Food'),
    getTcItemNames(),
  ]);
  return data.items
    .map(item => withTcName(item, names))
    .filter(item => item.tcName);
}

/** Fetch materia data */
export async function fetchMateria(): Promise<MateriaEndpointResponse> {
  return fetchApi<MateriaEndpointResponse>('/Materia');
}

/** Fetch job data */
export async function fetchJobs(): Promise<JobEndpointResponse> {
  return fetchApi<JobEndpointResponse>('/Jobs');
}

/** Fetch base parameters (stat caps per slot) */
export async function fetchBaseParams(): Promise<BaseParamEndpointResponse> {
  return fetchApi<BaseParamEndpointResponse>('/BaseParams');
}

/** Fetch item level data (stat values per ilvl) */
export async function fetchItemLevels(): Promise<ItemLevelEndpointResponse> {
  return fetchApi<ItemLevelEndpointResponse>('/ItemLevel');
}
