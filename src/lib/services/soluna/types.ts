/**
 * Soluna Types - Prayer times, sun/moon data
 */

export type CalculationMethodId = 0 | 1 | 2 | 3 | 4 | 5 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23;

export interface QueryParams {
  address: string;
  method?: CalculationMethodId;
  date?: string; // DD-MM-YYYY format
}

export interface SolunaResponse {
  meta: {
    latitude: number;
    longitude: number;
    timezone: string;
    method: {
      id: number;
      name: string;
      params: Record<string, unknown>;
    };
  };
  date: {
    readable: string;
    timestamp: string;
    hijri: {
      date: string;
      day: string;
      month: { number: number; en: string; ar: string };
      year: string;
    };
    gregorian: {
      date: string;
      day: string;
      month: { number: number; en: string };
      year: string;
    };
  };
  prayer: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Sunset: string;
    Maghrib: string;
    Isha: string;
    Imsak: string;
    Midnight: string;
    Firstthird: string;
    Lastthird: string;
  };
  sun: {
    sunrise: string;
    sunset: string;
    solarnoon: string;
    daylength: string;
  };
  moon: {
    phase: string;
    hijriDay: number;
  };
}

// AlAdhan API response types
export namespace AlAdhan {
  export interface ApiResponse {
    code: number;
    status: string;
    data: Data;
  }

  export interface Data {
    timings: {
      Fajr: string;
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Sunset: string;
      Maghrib: string;
      Isha: string;
      Imsak: string;
      Midnight: string;
      Firstthird: string;
      Lastthird: string;
    };
    date: {
      readable: string;
      timestamp: string;
      hijri: {
        date: string;
        day: string;
        month: { number: number; en: string; ar: string };
        year: string;
      };
      gregorian: {
        date: string;
        day: string;
        month: { number: number; en: string };
        year: string;
      };
    };
    meta: {
      latitude: number;
      longitude: number;
      timezone: string;
      method: {
        id: number;
        name: string;
        params: Record<string, unknown>;
      };
    };
  }
}

export const CALCULATION_METHODS: Record<CalculationMethodId, string> = {
  0: 'Jafari / Shia Ithna-Ashari',
  1: 'University of Islamic Sciences, Karachi',
  2: 'Islamic Society of North America',
  3: 'Muslim World League',
  4: 'Umm Al-Qura University, Makkah',
  5: 'Egyptian General Authority of Survey',
  7: 'Institute of Geophysics, University of Tehran',
  8: 'Gulf Region',
  9: 'Kuwait',
  10: 'Qatar',
  11: 'Majlis Ugama Islam Singapura, Singapore',
  12: 'Union Organization islamic de France',
  13: 'Diyanet İşleri Başkanlığı, Turkey',
  14: 'Spiritual Administration of Muslims of Russia',
  15: 'Moonsighting Committee Worldwide',
  16: 'Dubai (experimental)',
  17: 'Jabatan Kemajuan Islam Malaysia (JAKIM)',
  18: 'Tunisia',
  19: 'Algeria',
  20: 'KEMENAG - Kementerian Agama Republik Indonesia',
  21: 'Morocco',
  22: 'Comunidade Islamica de Lisboa',
  23: 'Ministry of Awqaf, Islamic Affairs and Holy Places, Jordan',
};
