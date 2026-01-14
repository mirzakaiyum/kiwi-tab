/**
 * Soluna Service - Prayer times, sun/moon data
 * Client-side implementation using AlAdhan API
 */

import { getCache, setCache } from '../cache';
import { getSolunaData as fetchFromAladhan } from './aladhan';
import type { CalculationMethodId, SolunaResponse } from './types';
import { CALCULATION_METHODS } from './types';

export type { CalculationMethodId, SolunaResponse } from './types';

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Get prayer times and sun/moon data for a location
 */
export async function getSolunaData(
  address: string,
  method: CalculationMethodId = 1,
  date?: string
): Promise<SolunaResponse> {
  const cacheKey = `soluna-${address}-${method}-${date || 'today'}`;

  // Try cache first
  const cached = await getCache<SolunaResponse>(cacheKey);
  if (cached?.fresh) {
    return cached.data;
  }

  // Fetch fresh data
  const data = await fetchFromAladhan({ address, method, date });

  // Cache the result
  await setCache(cacheKey, data, CACHE_TTL);

  return data;
}

/**
 * Get available calculation methods
 */
export function getMethods(): { id: CalculationMethodId; name: string }[] {
  return Object.entries(CALCULATION_METHODS).map(([id, name]) => ({
    id: Number(id) as CalculationMethodId,
    name,
  }));
}
