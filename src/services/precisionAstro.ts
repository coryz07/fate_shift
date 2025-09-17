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
        riskLevel: 'High',
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
        riskLevel: 'Elevated',
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
      riskLevel: 'Super Critical',
      theme: 'Major Life Transition',
      advice: "Reflect deeply, move deliberately. Avoid hasty decisions.",
      system: 'Western',
    },
    ...numerologyYears,
    ...baZiYears,
  ].sort((a, b) => a.startDate.localeCompare(b.startDate));
}