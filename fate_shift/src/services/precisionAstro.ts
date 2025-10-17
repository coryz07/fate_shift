// src/services/precisionAstro.ts
// ========================================
// PRECISION ASTROLOGICAL CALCULATION SERVICE
// ========================================
// This service provides comprehensive astrological calculations combining
// Western astrology, Vedic traditions, Chinese systems, and numerology.
// All functions include step-by-step explanations for educational purposes.

import axios from "axios";

const API = import.meta.env.VITE_ASTRO_API_URL as string;

export type When = {
  year: number; month: number; day: number;
  hour: number;        // decimal (local hour if tz specified; else UT)
  tz?: string | null;  // IANA tz, e.g. "America/New_York"
};

export async function getChiron(when: When) {
  const url = `${API}/planet/Chiron`;
  const { data } = await axios.post(url, when);
  return data as { jd: number; name: string; lon: number; lat: number; dist: number; speed_lon: number };
}

export async function getPlanet(name: string, when: When) {
  const url = `${API}/planet/${encodeURIComponent(name)}`;
  const { data } = await axios.post(url, when);
  return data;
}

export async function getAsteroid(minor: number, when: When) {
  const url = `${API}/asteroid/${minor}`;
  const { data } = await axios.post(url, when);
  return data;
}

// Example helper to get sun sign from API
export async function getSunSignFromAPI(when: When): Promise<string> {
  const sun = await getPlanet("Sun", when);
  const lon = sun.lon % 360;
  const signs = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
  return signs[Math.floor(lon / 30)];
}

/**
 * WESTERN ASTROLOGY - SUN SIGN CALCULATION
 * ========================================
 * Determines the zodiac sign based on birth date using traditional Western astrology.
 * The sun sign represents your core personality, ego expression, and life purpose.
 *
 * Algorithm: Compares birth date against established zodiac date ranges.
 * Each sign spans approximately 30 degrees of the ecliptic (360° / 12 signs).
 *
 * @param dateISO - Birth date in ISO format (YYYY-MM-DD)
 * @returns The zodiac sign name
 */
export function getSunSign(dateISO: string): string {
  const rules = [
    { sign: 'Aries', from: '03-21', to: '04-19' },
    { sign: 'Taurus', from: '04-20', to: '05-20' },
    { sign: 'Gemini', from: '05-21', to: '06-20' },
    { sign: 'Cancer', from: '06-21', to: '07-22' },
    { sign: 'Leo', from: '07-23', to: '08-22' },
    { sign: 'Virgo', from: '08-23', to: '09-22' },
    { sign: 'Libra', from: '09-23', to: '10-22' },
    { sign: 'Scorpio', from: '10-23', to: '11-21' },
    { sign: 'Sagittarius', from: '11-22', to: '12-21' },
    { sign: 'Capricorn', from: '12-22', to: '01-19' },
    { sign: 'Aquarius', from: '01-20', to: '02-18' },
    { sign: 'Pisces', from: '02-19', to: '03-20' },
  ];
  const [, month, day] = dateISO.split('-').map(Number);
  for (const r of rules) {
    const [fromM, fromD] = r.from.split('-').map(Number);
    const [toM, toD] = r.to.split('-').map(Number);
    if (fromM < toM || (fromM === toM && fromD <= toD)) {
      if (
        (month > fromM || (month === fromM && day >= fromD)) &&
        (month < toM || (month === toM && day <= toD))
      ) return r.sign;
    } else { // Capricorn edge-case (Dec-Jan).
      if (
        (month === fromM && day >= fromD) || (month === toM && day <= toD)
      ) return r.sign;
    }
  }
  return 'Pisces';
}

/**
 * NUMEROLOGY - LIFE PATH NUMBER CALCULATION
 * =========================================
 * Calculates the Life Path Number using Pythagorean numerology.
 * This number reveals your life's purpose, challenges, and spiritual journey.
 *
 * Algorithm:
 * 1. Sum all digits in the birth date (YYYYMMDD)
 * 2. Reduce to single digit unless it's a master number (11, 22, 33)
 * 3. Master numbers indicate special spiritual significance
 *
 * Example: 1985-03-15 → 1+9+8+5+0+3+1+5 = 32 → 3+2 = 5 (Life Path 5)
 *
 * @param dateISO - Birth date in ISO format (YYYY-MM-DD)
 * @returns Life Path Number (1-9, 11, 22, or 33)
 */
export function getLifePathNumber(dateISO: string): number {
  const total = dateISO.replace(/-/g, '').split('').map(Number).reduce((a, b) => a + b);
  return reduceToSingleDigit(total);
}

/**
 * Reduces a number to single digit while preserving master numbers
 * Master numbers (11, 22, 33) have special spiritual significance
 */
function reduceToSingleDigit(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33)
    n = n.toString().split('').map(Number).reduce((a, b) => a + b);
  return n;
}

/**
 * CHINESE ASTROLOGY - ZODIAC ANIMAL CALCULATION
 * =============================================
 * Determines Chinese zodiac animal based on birth year using the 12-year cycle.
 * Each animal represents personality traits, compatibility patterns, and life themes.
 *
 * Algorithm:
 * 1. Extract birth year from date
 * 2. Use modulo 12 calculation against known reference year
 * 3. Map result to corresponding animal
 *
 * Note: Traditional Chinese New Year starts in late January/February,
 * but this simplified version uses calendar year for broad analysis.
 *
 * @param dateISO - Birth date in ISO format (YYYY-MM-DD)
 * @returns Chinese zodiac animal name
 */
export function getChineseZodiac(dateISO: string): string {
  const animals = ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'];
  const year = +dateISO.slice(0,4);
  // Using 2020 as reference year (Rat) for calculation
  return animals[(year - 2020 + 12) % 12];
}

export interface CriticalPeriod {
  label: string;
  startDate: string;
  endDate: string;
  riskLevel: 'Super Critical' | 'High' | 'Elevated' | 'Moderate';
  theme: string;
  advice: string;
  system: string;
}

/**
 * CRITICAL LIFE PERIODS ANALYSIS
 * ==============================
 * Combines multiple astrological systems to identify significant life periods.
 * Uses Western astrology (Saturn Return), Numerology (Personal Year 9),
 * and Chinese BaZi principles to predict times of change and challenge.
 *
 * Systems integrated:
 * - Saturn Return (ages 28-30): Major life restructuring period
 * - Personal Year 9: Completion and endings in numerology
 * - BaZi Clash Years: Chinese system identifying conflict periods
 *
 * @param dateISO - Birth date in ISO format (YYYY-MM-DD)
 * @returns Array of critical periods sorted chronologically
 */
export function getCriticalLifePeriods(dateISO: string): CriticalPeriod[] {
  const birthYear = +dateISO.slice(0, 4);
  // Saturn Return
  const saturnStart = new Date(birthYear + 28, 0, 1);
  const saturnEnd = new Date(birthYear + 30, 0, 1);

  // Numerology personal year 9 (closure years)
  const [_, month, day] = dateISO.split('-').map(Number);
  const numerologyYears: CriticalPeriod[] = [];
  for (let i = 0; i < 30; ++i) {
    const year = birthYear + i;
    let num = month + day + year;
    while (num > 9) num = `${num}`.split('').reduce((a, b) => a + Number(b), 0);
    if (num === 9) {
      numerologyYears.push({
        label: 'Personal Year 9',
        startDate: new Date(year, 0, 1).toISOString(),
        endDate: new Date(year, 11, 31).toISOString(),
        riskLevel: 'High' as const,
        theme: 'Endings / Reflection',
        advice: "Close chapters, avoid starting large new projects, finish what remains.",
        system: "Numerology"
      });
    }
  }

  // BaZi pillar clash (even vs. odd year)
  const baZiYears: CriticalPeriod[] = [];
  for (let year = birthYear + 16; year < birthYear + 60; ++year) {
    if ((birthYear % 2) !== (year % 2)) {
      baZiYears.push({
        label: 'BaZi Clash Year',
        startDate: new Date(year, 0, 1).toISOString(),
        endDate: new Date(year, 11, 31).toISOString(),
        riskLevel: 'Elevated' as const,
        theme: 'Sudden Changes',
        advice: "Avoid overextending, favor caution in family/career disputes.",
        system: 'Chinese'
      });
    }
  }

  return [
    {
      label: 'Saturn Return',
      startDate: saturnStart.toISOString(),
      endDate: saturnEnd.toISOString(),
      riskLevel: 'Super Critical' as const,
      theme: 'Major Life Transition',
      advice: "Reflect deeply, move deliberately. Avoid hasty decisions.",
      system: 'Western',
    },
    ...numerologyYears,
    ...baZiYears,
  ].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export interface PlanetaryReturn {
  planet: string;
  returnNumber: number;
  date: string;
  ageAtReturn: number;
  theme: string;
  description: string;
  intensity: 'Low' | 'Medium' | 'High' | 'Peak';
  color: string;
}

/**
 * PLANETARY RETURNS CALCULATION
 * =============================
 * Calculates when planets return to their birth positions in your chart.
 * These cosmic cycles mark significant themes and developmental periods.
 *
 * Planetary cycles calculated:
 * - Mars (2.14 years): Energy, action, drive cycles
 * - Jupiter (11.86 years): Growth, expansion, opportunity cycles
 * - Saturn (29.46 years): Structure, responsibility, maturation cycles
 * - Uranus (84.02 years): Revolutionary change, awakening cycles
 * - Neptune (164.8 years): Spiritual development, creativity cycles
 *
 * Each return marks a new beginning in that planet's themes.
 * First returns are most significant (Peak intensity).
 *
 * @param dateISO - Birth date in ISO format (YYYY-MM-DD)
 * @returns Array of planetary returns sorted by date
 */
export function getMajorPlanetaryReturns(dateISO: string): PlanetaryReturn[] {
  const birthYear = +dateISO.slice(0, 4);
  const currentYear = new Date().getFullYear();
  const returns: PlanetaryReturn[] = [];

  const planetaryData = [
    {
      planet: 'Mars',
      cycleYears: 2.14,
      color: '#ff4444',
      themes: ['Energy', 'Action', 'Conflict', 'Drive', 'Passion']
    },
    {
      planet: 'Jupiter',
      cycleYears: 11.86,
      color: '#4169e1',
      themes: ['Expansion', 'Luck', 'Growth', 'Wisdom', 'Opportunity']
    },
    {
      planet: 'Saturn',
      cycleYears: 29.46,
      color: '#8b4513',
      themes: ['Structure', 'Discipline', 'Responsibility', 'Authority', 'Lessons']
    },
    {
      planet: 'Uranus',
      cycleYears: 84.02,
      color: '#40e0d0',
      themes: ['Revolution', 'Innovation', 'Freedom', 'Awakening', 'Change']
    },
    {
      planet: 'Neptune',
      cycleYears: 164.8,
      color: '#4169e1',
      themes: ['Spirituality', 'Dreams', 'Illusion', 'Creativity', 'Transcendence']
    }
  ];

  planetaryData.forEach(planet => {
    for (let returnNum = 1; returnNum <= 10; returnNum++) {
      const returnYear = birthYear + (planet.cycleYears * returnNum);

      if (returnYear <= currentYear + 50) {
        const age = Math.round(returnYear - birthYear);
        const intensity = returnNum === 1 ? 'Peak'
                        : returnNum === 2 ? 'High'
                        : returnNum <= 4 ? 'Medium'
                        : 'Low';

        const theme = planet.themes[Math.floor(Math.random() * planet.themes.length)];

        returns.push({
          planet: planet.planet,
          returnNumber: returnNum,
          date: new Date(returnYear, 0, 1).toISOString(),
          ageAtReturn: age,
          theme,
          description: `${planet.planet} returns to its birth position, emphasizing themes of ${theme.toLowerCase()}.`,
          intensity,
          color: planet.color
        });
      }
    }
  });

  return returns.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * ========================================
 * VEDIC ASTROLOGY SYSTEM
 * ========================================
 * Advanced calculations for Vedic (Jyotish) astrology including:
 * - Nakshatra (lunar mansion) determination
 * - Vimshottari Dasha timeline (planetary periods)
 * - Step-by-step explanations for educational purposes
 **/

/**
 * VEDIC NAKSHATRA CALCULATION
 * ===========================
 * Determines the lunar mansion (nakshatra) based on Moon's position.
 * Nakshatras are 27 divisions of the zodiac, each spanning 13°20'.
 *
 * Algorithm (Simplified):
 * 1. Calculate approximate lunar longitude from birth date
 * 2. Divide by 13.33° to find nakshatra index (0-26)
 * 3. Determine pada (quarter) within the nakshatra
 *
 * Note: This is a simplified calculation for demonstration.
 * Production systems require precise lunar ephemeris data.
 *
 * @param dateISO - Birth date in ISO format (YYYY-MM-DD)
 * @returns Nakshatra name, pada number, and calculation explanation
 */
export function getNakshatra(dateISO: string): { nakshatra: string, pada: number, explanation: string } {
  // Static lookup for demo; in production, calculate Moon's actual ecliptic longitude for accuracy
  const nakshatras = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
    'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha',
    'Jyeshta', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ];
  // Rough lunar longitude by day in month as a fake stand-in
  const [, month, day] = dateISO.split('-').map(Number);
  const moonDeg = ((month * 30) + day) % 360;
  const nakIdx = Math.floor(moonDeg / (360 / 27));
  const pada = Math.floor((moonDeg % (360 / 27)) / (360 / 27 / 4)) + 1;
  return {
    nakshatra: nakshatras[nakIdx],
    pada,
    explanation: `Assuming moon longitude from birth day/month, landing in ${nakshatras[nakIdx]} (Pada ${pada}). Astronomical accuracy requires true moon calc.`
  };
}

// Vimshottari Mahadasha sequence
const mahaPeriods = [
  { lord: 'Ketu', years: 7 },
  { lord: 'Venus', years: 20 },
  { lord: 'Sun', years: 6 },
  { lord: 'Moon', years: 10 },
  { lord: 'Mars', years: 7 },
  { lord: 'Rahu', years: 18 },
  { lord: 'Jupiter', years: 16 },
  { lord: 'Saturn', years: 19 },
  { lord: 'Mercury', years: 17 }
];

/**
 * VIMSHOTTARI DASHA TIMELINE
 * ==========================
 * Calculates the 120-year Vimshottari Dasha cycle used in Vedic astrology.
 * Each planetary period (Mahadasha) brings specific themes and influences.
 *
 * Algorithm:
 * 1. Start from birth year (simplified - normally based on birth nakshatra)
 * 2. Apply standard Vimshottari sequence with planetary periods
 * 3. Each planet rules for a specific number of years
 *
 * Planetary periods in order:
 * Ketu(7) → Venus(20) → Sun(6) → Moon(10) → Mars(7) →
 * Rahu(18) → Jupiter(16) → Saturn(19) → Mercury(17)
 *
 * @param dateISO - Birth date in ISO format (YYYY-MM-DD)
 * @returns Array of dasha periods with explanations
 */
export function getVimshottariDashaTimeline(dateISO: string): { lord: string, startYear: number, endYear: number, explanation: string }[] {
  const birthYear = +dateISO.slice(0, 4);
  let cursor = birthYear;
  const timeline = [];
  for (const p of mahaPeriods) {
    timeline.push({
      lord: p.lord,
      startYear: cursor,
      endYear: cursor + p.years,
      explanation: `Mahadasha of ${p.lord} starts at age ${cursor - birthYear}, lasts ${p.years} years. Standard Vimshottari order is used.`
    });
    cursor += p.years;
  }
  return timeline;
}

/**
 * ========================================
 * ADVANCED NUMEROLOGY SYSTEM
 * ========================================
 * Calculates Pinnacles and Challenges - the four major life cycles
 * that shape your personal development and growth patterns.
 **/

// Reduces a string (date) to a single digit (or master number)
function numerologyReduce(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33)
    n = n.toString().split('').map(Number).reduce((a, b) => a + b, 0);
  return n;
}

/**
 * NUMEROLOGY PINNACLES AND CHALLENGES
 * ===================================
 * Calculates the four major life cycles (Pinnacles) and obstacles (Challenges).
 * These represent opportunities for growth and areas requiring extra attention.
 *
 * Pinnacle Algorithm:
 * 1st Pinnacle (0-36): Month + Day
 * 2nd Pinnacle (36-45): Day + Year
 * 3rd Pinnacle (45-54): 1st + 2nd Pinnacle
 * 4th Pinnacle (54+): Month + Year
 *
 * Challenge Algorithm:
 * Uses absolute differences instead of sums:
 * 1st Challenge: |Month - Day|
 * 2nd Challenge: |Day - Year|
 * 3rd Challenge: |1st Pinnacle - 2nd Pinnacle|
 * 4th Challenge: |2nd Pinnacle - 3rd Pinnacle|
 *
 * @param dateISO - Birth date in ISO format (YYYY-MM-DD)
 * @returns Object containing pinnacles and challenges arrays
 */
export function getNumerologyPinnaclesAndChallenges(dateISO: string): {
  pinnacles: { value: number, from: number, to: number, explanation: string }[],
  challenges: { value: number, from: number, to: number, explanation: string }[]
} {
  const [year, month, day] = dateISO.split('-').map(Number);

  // Pinnacles
  const p1 = numerologyReduce(month + day);
  const p2 = numerologyReduce(day + year);
  const p3 = numerologyReduce(p1 + p2);
  const p4 = numerologyReduce(month + year);

  // Challenges (absolute difference, not sum)
  const c1 = Math.abs(month - day);
  const c2 = Math.abs(day - year);
  const c3 = Math.abs(p1 - p2);
  const c4 = Math.abs(p2 - p3);

  return {
    pinnacles: [
      { value: p1, from: 0, to: 36, explanation: `1st Pinnacle: month + day = ${month} + ${day} = ${month + day} → ${p1}` },
      { value: p2, from: 36, to: 45, explanation: `2nd Pinnacle: day + year = ${day} + ${year} = ${day + year} → ${p2}` },
      { value: p3, from: 45, to: 54, explanation: `3rd Pinnacle: p1 + p2 = ${p1} + ${p2} = ${p1 + p2} → ${p3}` },
      { value: p4, from: 54, to: 120, explanation: `4th Pinnacle: month + year = ${month} + ${year} = ${month + year} → ${p4}` }
    ],
    challenges: [
      { value: c1, from: 0, to: 36, explanation: `1st Challenge: |month - day| = |${month} - ${day}| = ${c1}` },
      { value: c2, from: 36, to: 45, explanation: `2nd Challenge: |day - year| = |${day} - ${year}| = ${c2}` },
      { value: c3, from: 45, to: 54, explanation: `3rd Challenge: |p1 - p2| = |${p1} - ${p2}| = ${c3}` },
      { value: c4, from: 54, to: 120, explanation: `4th Challenge: |p2 - p3| = |${p2} - ${p3}| = ${c4}` }
    ]
  };
}

/**
 * Add reference to these new exports in your index and screens:
 * - getNakshatra
 * - getVimshottariDashaTimeline
 * - getNumerologyPinnaclesAndChallenges
 * All results now support `explanation` fields for use in your tooltips/modals.
 */