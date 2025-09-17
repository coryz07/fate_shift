import React, { useMemo } from 'react';
import { getSunSign, getLifePathNumber, getChineseZodiac, getCriticalLifePeriods } from '../services/precisionAstro';
import { LifePatternsTimeline } from '../components/LifePatternsTimeline';

export const LifePathScreen: React.FC<{ dateISO: string }> = ({ dateISO }) => {
  const sunSign = getSunSign(dateISO);
  const lifePath = getLifePathNumber(dateISO);
  const chineseZodiac = getChineseZodiac(dateISO);
  const periods = useMemo(() => getCriticalLifePeriods(dateISO), [dateISO]);
  return (
    <div style={{ maxWidth: 600, margin: "2em auto" }}>
      <h1>Precision Life Path Analysis</h1>
      <div style={{ background: "#f0f0f0", padding: "1em", marginBottom: "1em" }}>
        <b>Birth Data:</b><br />
        Sun Sign: <b>{sunSign}</b><br />
        Life Path Number: <b>{lifePath}</b><br />
        Chinese Zodiac: <b>{chineseZodiac}</b>
      </div>
      <LifePatternsTimeline periods={periods} />
    </div>
  );
};