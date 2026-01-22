/**
 * AlAdhan API Provider
 * Fetches prayer times from AlAdhan API with fallback URLs
 */

import type { AlAdhanApiResponse, QueryParams, SolunaResponse } from './types';

const BASE_URLS = [
  'https://api.aladhan.com/v1/timingsByAddress',
  'https://aladhan.api.islamic.network/v1/timingsByAddress',
  'https://aladhan.api.alislam.ru/v1/timingsByAddress',
];

/**
 * Fetches prayer times and sun data from the AlAdhan API with fallback URLs.
 */
export async function getSolunaData(params: QueryParams): Promise<SolunaResponse> {
  const { address, method = 1, date } = params;
  const dateStr = date || getTodayDate();

  let lastError: Error | null = null;

  for (const baseUrl of BASE_URLS) {
    try {
      const url = `${baseUrl}/${dateStr}?address=${encodeURIComponent(address)}&method=${method}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`AlAdhan API error: ${response.status} ${response.statusText}`);
      }

      const json: AlAdhanApiResponse = await response.json();

      if (json.code !== 200) {
        throw new Error(`AlAdhan API returned error: ${json.status}`);
      }

      return {
        meta: {
          latitude: json.data.meta.latitude,
          longitude: json.data.meta.longitude,
          timezone: json.data.meta.timezone,
          method: {
            id: json.data.meta.method.id,
            name: json.data.meta.method.name,
            params: json.data.meta.method.params,
          },
        },
        date: {
          readable: json.data.date.readable,
          timestamp: json.data.date.timestamp,
          hijri: json.data.date.hijri,
          gregorian: json.data.date.gregorian,
        },
        prayer: json.data.timings,
        sun: {
          sunrise: json.data.timings.Sunrise,
          sunset: json.data.timings.Sunset,
          solarnoon: json.data.timings.Dhuhr,
          daylength: calculateDayLength(json.data.timings.Sunrise, json.data.timings.Sunset),
        },
        moon: calculateMoonPhase(parseInt(json.data.date.hijri.day, 10)),
      };
    } catch (err) {
      lastError = err as Error;
      // Continue to next URL
    }
  }

  throw lastError || new Error('All AlAdhan API endpoints failed');
}

/**
 * Calculate day length from sunrise and sunset times
 */
function calculateDayLength(sunrise: string, sunset: string): string {
  try {
    const [sunriseH, sunriseM] = sunrise.split(':').map(Number);
    const [sunsetH, sunsetM] = sunset.split(':').map(Number);
    const sunriseMinutes = sunriseH * 60 + sunriseM;
    const sunsetMinutes = sunsetH * 60 + sunsetM;
    const lengthMinutes = sunsetMinutes - sunriseMinutes;
    const hours = Math.floor(lengthMinutes / 60);
    const minutes = lengthMinutes % 60;
    return `${hours}h ${minutes}m`;
  } catch {
    return '-';
  }
}

/**
 * Calculate moon phase from Hijri day
 */
function calculateMoonPhase(hijriDay: number): { phase: string; hijriDay: number } {
  let phase: string;

  if (hijriDay <= 4) {
    phase = 'New Moon';
  } else if (hijriDay <= 11) {
    phase = 'First Quarter';
  } else if (hijriDay <= 18) {
    phase = 'Full Moon';
  } else if (hijriDay <= 25) {
    phase = 'Last Quarter';
  } else {
    phase = 'New Moon';
  }

  return { phase, hijriDay };
}

/**
 * Returns today's date in DD-MM-YYYY format.
 */
function getTodayDate(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}-${month}-${year}`;
}
