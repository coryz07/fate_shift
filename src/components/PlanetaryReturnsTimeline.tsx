import React, { useState } from 'react';
import type { PlanetaryReturn } from '../services/precisionAstro';

interface PlanetaryReturnsTimelineProps {
  returns: PlanetaryReturn[];
}

export const PlanetaryReturnsTimeline: React.FC<PlanetaryReturnsTimelineProps> = ({ returns }) => {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'all' | 'next10' | 'past10'>('next10');

  const currentYear = new Date().getFullYear();
  const filteredReturns = returns.filter(r => {
    const returnYear = new Date(r.date).getFullYear();
    switch (timeRange) {
      case 'next10':
        return returnYear >= currentYear && returnYear <= currentYear + 10;
      case 'past10':
        return returnYear >= currentYear - 10 && returnYear <= currentYear;
      case 'all':
      default:
        return returnYear >= currentYear - 5 && returnYear <= currentYear + 25;
    }
  });

  const displayReturns = selectedPlanet
    ? filteredReturns.filter(r => r.planet === selectedPlanet)
    : filteredReturns;

  const planets = [...new Set(returns.map(r => r.planet))];

  const getIntensityStyle = (intensity: string) => {
    switch (intensity) {
      case 'Peak':
        return { background: '#ff6b6b', color: 'white', fontWeight: 'bold' };
      case 'High':
        return { background: '#ffa726', color: 'white' };
      case 'Medium':
        return { background: '#ffcc02', color: 'black' };
      case 'Low':
        return { background: '#e0e0e0', color: 'black' };
      default:
        return { background: '#f0f0f0', color: 'black' };
    }
  };

  return (
    <div style={{ margin: '20px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Planetary Returns Timeline</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="next10">Next 10 Years</option>
            <option value="past10">Past 10 Years</option>
            <option value="all">Extended View</option>
          </select>
          <select
            value={selectedPlanet || ''}
            onChange={(e) => setSelectedPlanet(e.target.value || null)}
            style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">All Planets</option>
            {planets.map(planet => (
              <option key={planet} value={planet}>{planet}</option>
            ))}
          </select>
        </div>
      </div>

      {displayReturns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          No planetary returns in the selected time range.
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Timeline line */}
          <div style={{
            position: 'absolute',
            left: '50px',
            top: '0',
            bottom: '0',
            width: '2px',
            background: '#ddd'
          }} />

          {displayReturns.map((returnData) => {
            const returnYear = new Date(returnData.date).getFullYear();
            const isUpcoming = returnYear >= currentYear;

            return (
              <div
                key={`${returnData.planet}-${returnData.returnNumber}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '15px',
                  position: 'relative'
                }}
              >
                {/* Timeline dot */}
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: returnData.color,
                  border: '2px solid white',
                  boxShadow: '0 0 0 2px #ddd',
                  marginRight: '20px',
                  zIndex: 1
                }} />

                {/* Content card */}
                <div style={{
                  flex: 1,
                  background: isUpcoming ? '#f8f9ff' : '#f5f5f5',
                  border: `1px solid ${isUpcoming ? '#e6f0ff' : '#e0e0e0'}`,
                  borderRadius: '8px',
                  padding: '15px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: returnData.color }}>
                        {returnData.planet} Return #{returnData.returnNumber}
                      </h4>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        {returnYear} (Age {returnData.ageAtReturn})
                      </div>
                    </div>
                    <span
                      style={{
                        ...getIntensityStyle(returnData.intensity),
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    >
                      {returnData.intensity}
                    </span>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <strong>Theme:</strong> {returnData.theme}
                  </div>

                  <div style={{ fontSize: '14px', lineHeight: '1.4', color: '#555' }}>
                    {returnData.description}
                  </div>

                  {isUpcoming && (
                    <div style={{
                      marginTop: '10px',
                      padding: '8px',
                      background: '#e8f5e8',
                      borderRadius: '4px',
                      fontSize: '13px',
                      color: '#2d5016'
                    }}>
                      <strong>Preparation:</strong> Focus on {returnData.theme.toLowerCase()}-related growth and development.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div style={{
        marginTop: '25px',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Understanding Planetary Returns</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '13px' }}>
          <div><strong>Mars (2.1 years):</strong> Energy cycles, action phases</div>
          <div><strong>Jupiter (11.9 years):</strong> Growth, expansion, opportunity</div>
          <div><strong>Saturn (29.5 years):</strong> Structure, responsibility, maturation</div>
          <div><strong>Uranus (84 years):</strong> Revolutionary change, awakening</div>
          <div><strong>Neptune (165 years):</strong> Spiritual development, dreams</div>
        </div>
      </div>
    </div>
  );
};