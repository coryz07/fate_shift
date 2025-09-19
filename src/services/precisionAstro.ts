// src/services/precisionAstro.ts

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

export function getLifePathNumber(dateISO: string): number {
  const total = dateISO.replace(/-/g, '').split('').map(Number).reduce((a, b) => a + b);
  return reduceToSingleDigit(total);
}
function reduceToSingleDigit(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33)
    n = n.toString().split('').map(Number).reduce((a, b) => a + b);
  return n;
}

export function getChineseZodiac(dateISO: string): string {
  const animals = ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'];
  const year = +dateISO.slice(0,4);
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
 * --- VEDIC ASTROLOGY (MAJOR MAHADASHA PERIODS & NAKSHATRA) ---
 * Returns a dasha timeline (Vimshottari system) and the native's lunar nakshatra
 * with step-by-step explanations for each calculation for UI modals.
 **/

// Helper for finding the nakshatra by longitude (placeholder math—replace with true lunar longitude if you have a full ephemeris)
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

// Dasha table with stepwise explanation (simplified for demo; for actual use, first dasha is based on lunar nakshatra/birth moon degree)
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
 * --- ADVANCED NUMEROLOGY (PINNACLES & CHALLENGES) ---
 * Returns pinnacles and challenges with calculation steps for modals.
 */

// Reduces a string (date) to a single digit (or master number)
function numerologyReduce(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33)
    n = n.toString().split('').map(Number).reduce((a, b) => a + b, 0);
  return n;
}

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