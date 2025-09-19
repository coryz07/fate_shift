import React, { useMemo } from 'react';
import { getSunSign, getLifePathNumber, getChineseZodiac, getCriticalLifePeriods, getMajorPlanetaryReturns } from '../services/precisionAstro';
import { LifePatternsTimeline } from '../components/LifePatternsTimeline';
import { PlanetaryReturnsTimeline } from '../components/PlanetaryReturnsTimeline';
import { exportAsPDF, exportAsCSV } from '../utils/exportReport';
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
          <h3 style={{ margin: 0, color: '#333' }}>Astrology</h3>
          <p>Sun Sign: {sunSign}</p>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Click for details</div>
        </div>

        <div style={{
          background: "#e8f5e8",
          padding: "15px",
          borderRadius: "8px",
          cursor: 'pointer'
        }} onClick={() => onShowModal('numerology')}>
          <h3 style={{ margin: 0, color: '#333' }}>Numerology</h3>
          <p>Life Path: {lifePath}</p>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Click for details</div>
        </div>

        <div style={{
          background: "#fff3cd",
          padding: "15px",
          borderRadius: "8px",
          cursor: 'pointer'
        }} onClick={() => onShowModal('chinese')}>
          <h3 style={{ margin: 0, color: '#333' }}>Chinese Zodiac</h3>
          <p>Animal: {chineseZodiac}</p>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Click for details</div>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>Birth Information</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => exportAsPDF(periods, "Life Patterns Report")}
              style={{
                padding: '8px 16px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Export PDF
            </button>
            <button
              onClick={() => exportAsCSV(periods, "Life Patterns Report")}
              style={{
                padding: '8px 16px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Export CSV
            </button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <div>Date: {birthData.date}</div>
          {birthData.time && <div>Time: {birthData.time}</div>}
          {birthData.place && <div>Place: {birthData.place}</div>}
          {birthData.timezone && <div>Timezone: {birthData.timezone}</div>}
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
