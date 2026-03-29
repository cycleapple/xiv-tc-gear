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

// TC / CN name injection (fallback: TC → CN)
let tcItemNames: Record<number, string> | null = null;
let cnItemNames: Record<number, string> | null = null;

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

async function getCnItemNames(): Promise<Record<number, string>> {
  if (cnItemNames) return cnItemNames;
  try {
    const mod = await import('./cn-items.json');
    cnItemNames = mod.default as Record<number, string>;
  } catch {
    cnItemNames = {};
  }
  return cnItemNames;
}

function withTcName<T extends { primaryKey: number; tcName?: string; isCnFallback?: boolean }>(
  item: T,
  tcNames: Record<number, string>,
  cnNames: Record<number, string>,
): T & { tcName: string | undefined; isCnFallback: boolean } {
  const tc = tcNames[item.primaryKey];
  const cn = cnNames[item.primaryKey];
  return { ...item, tcName: tc ?? cn, isCnFallback: !tc && !!cn };
}

/** Fetch gear items for a specific job, enriched with TC names (fallback to CN) */
export async function fetchItems(job: string): Promise<Item[]> {
  const [data, tcNames, cnNames] = await Promise.all([
    fetchApi<ItemsEndpointResponse>('/Items', { job }),
    getTcItemNames(),
    getCnItemNames(),
  ]);
  return data.items.map(item => withTcName(item, tcNames, cnNames));
}

/** Fetch food items, enriched with TC names (fallback to CN) */
export async function fetchFood(): Promise<Food[]> {
  const [data, tcNames, cnNames] = await Promise.all([
    fetchApi<FoodEndpointResponse>('/Food'),
    getTcItemNames(),
    getCnItemNames(),
  ]);
  return data.items.map(item => withTcName(item, tcNames, cnNames));
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
