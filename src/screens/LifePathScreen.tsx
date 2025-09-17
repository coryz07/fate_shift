import React, { useMemo } from 'react';
import { getSunSign, getLifePathNumber, getChineseZodiac, getCriticalLifePeriods, getMajorPlanetaryReturns } from '../services/precisionAstro';
import { LifePatternsTimeline } from '../components/LifePatternsTimeline';
import { PlanetaryReturnsTimeline } from '../components/PlanetaryReturnsTimeline';
import { BirthData } from '../App';

interface LifePathScreenProps {
  birthData: BirthData;
  onReset: () => void;
  onShowModal: (modal: string) => void;
}

export const LifePathScreen: React.FC<LifePathScreenProps> = ({ birthData, onReset, onShowModal }) => {
  const dateISO = birthData.date;
  const sunSign = getSunSign(dateISO);
  const lifePath = getLifePathNumber(dateISO);
  const chineseZodiac = getChineseZodiac(dateISO);
  const periods = useMemo(() => getCriticalLifePeriods(dateISO), [dateISO]);
  const planetaryReturns = useMemo(() => getMajorPlanetaryReturns(dateISO), [dateISO]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Precision Life Path Analysis</h1>
        <button
          onClick={onReset}
          style={{
            padding: '8px 16px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← New Analysis
        </button>
      </div>

      {/* Birth Data Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: "#f0f0f0",
          padding: "15px",
          borderRadius: "8px",
          cursor: 'pointer'
        }} onClick={() => onShowModal('astrology')}>
          <h3 style={{ margin: '0 0 10px 0', color: '#4b2067' }}>Astrology</h3>
          <div><strong>Sun Sign:</strong> {sunSign}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>Click for details</div>
        </div>

        <div style={{
          background: "#e8f5e8",
          padding: "15px",
          borderRadius: "8px",
          cursor: 'pointer'
        }} onClick={() => onShowModal('numerology')}>
          <h3 style={{ margin: '0 0 10px 0', color: '#4b2067' }}>Numerology</h3>
          <div><strong>Life Path:</strong> {lifePath}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>Click for details</div>
        </div>

        <div style={{
          background: "#fff3cd",
          padding: "15px",
          borderRadius: "8px",
          cursor: 'pointer'
        }} onClick={() => onShowModal('chinese')}>
          <h3 style={{ margin: '0 0 10px 0', color: '#4b2067' }}>Chinese Zodiac</h3>
          <div><strong>Animal:</strong> {chineseZodiac}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>Click for details</div>
        </div>
      </div>

      {/* Birth Information */}
      <div style={{
        background: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #e9ecef'
      }}>
        <h3>Birth Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <div><strong>Date:</strong> {birthData.date}</div>
          {birthData.time && <div><strong>Time:</strong> {birthData.time}</div>}
          {birthData.place && <div><strong>Place:</strong> {birthData.place}</div>}
          {birthData.timezone && <div><strong>Timezone:</strong> {birthData.timezone}</div>}
        </div>
      </div>

      {/* Critical Life Periods */}
      <div onClick={() => onShowModal('timeline')} style={{ cursor: 'pointer' }}>
        <LifePatternsTimeline periods={periods} />
      </div>

      {/* Planetary Returns */}
      <PlanetaryReturnsTimeline returns={planetaryReturns} />
    </div>
  );
};