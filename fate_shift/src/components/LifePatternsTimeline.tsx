import React, { useState } from 'react';
import type { CriticalPeriod } from '../services/precisionAstro';

export interface TimelinePeriod {
  label: string;
  startDate: string;
  endDate: string;
  riskLevel: string;
  theme: string;
  advice: string;
  system: string;
  explanation?: string;
  color?: string;
}

interface Props {
  periods: CriticalPeriod[];
}

export const LifePatternsTimeline: React.FC<Props> = ({ periods }) => {
  const [modalPeriod, setModalPeriod] = useState<CriticalPeriod | null>(null);

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Super Critical': return '#e74c3c';
      case 'High': return '#f39c12';
      case 'Elevated': return '#f1c40f';
      case 'Moderate': return '#27ae60';
      default: return '#888';
    }
  };

  return (
    <div className="timeline-container">
      <h2>Critical Life Patterns Timeline</h2>
      {periods.length === 0 && <div>Nothing major detected in the next cycle. Steady times ahead!</div>}

      {periods.map((period) => {
        const color = getRiskLevelColor(period.riskLevel);
        return (
          <div
            key={period.label + period.startDate}
            className="timeline-period"
            style={{
              borderLeft: `4px solid ${color}`,
              margin: 8,
              padding: 8,
              background: '#f7f7f7',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onClick={() => setModalPeriod(period)}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f7f7f7'}
          >
            <strong style={{ color }}>{period.label}</strong>
            <span style={{ marginLeft: 8, fontStyle: 'italic' }}>{period.theme}</span>
            <span style={{ marginLeft: 8, color: '#666' }}>{period.riskLevel}</span>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              {new Date(period.startDate).toLocaleDateString()} — {new Date(period.endDate).toLocaleDateString()}
            </div>
            <div style={{ fontSize: 12, color: '#4a90e2', cursor: 'pointer', marginTop: 6 }}>
              Click for full explanation
            </div>
          </div>
        );
      })}

      {modalPeriod && (
        <div
          className="timeline-modal"
          style={{
            position: 'fixed',
            top: 60,
            left: '10%',
            width: '80%',
            maxWidth: '600px',
            background: '#fff',
            zIndex: 100,
            border: '2px solid #2d6cdf',
            borderRadius: 12,
            boxShadow: '0 3px 20px rgba(0,0,0,0.10)',
            padding: 20,
            maxHeight: '80vh',
            overflowY: 'auto'
          }}
        >
          <div
            style={{
              float: 'right',
              cursor: 'pointer',
              fontSize: 22,
              padding: 8,
              color: '#666',
              lineHeight: 1
            }}
            onClick={() => setModalPeriod(null)}
          >
            ✖
          </div>
          <h3 style={{ marginTop: 0, color: getRiskLevelColor(modalPeriod.riskLevel) }}>
            {modalPeriod.label}
          </h3>
          <div style={{ marginBottom: 10 }}>
            <strong>{modalPeriod.theme}</strong> ({modalPeriod.system})
          </div>
          <div style={{ marginBottom: 10, fontSize: 14, color: '#666' }}>
            <strong>Period:</strong> {new Date(modalPeriod.startDate).toLocaleDateString()} — {new Date(modalPeriod.endDate).toLocaleDateString()}
          </div>
          <div style={{ marginBottom: 10, fontSize: 14 }}>
            <strong>Risk Level:</strong> <span style={{ color: getRiskLevelColor(modalPeriod.riskLevel) }}>{modalPeriod.riskLevel}</span>
          </div>
          <div style={{ margin: '14px 0', lineHeight: 1.5 }}>
            <strong>Explanation:</strong> This period represents a significant time based on {modalPeriod.system.toLowerCase()} calculations,
            focusing on themes of {modalPeriod.theme.toLowerCase()}. The {modalPeriod.riskLevel.toLowerCase()} risk level indicates
            the intensity of potential changes or challenges during this time.
          </div>
          <div style={{
            background: '#f8f9fa',
            padding: 12,
            borderRadius: 6,
            borderLeft: '4px solid #007bff'
          }}>
            <strong>Advice:</strong> <em>{modalPeriod.advice}</em>
          </div>
        </div>
      )}

      {/* Backdrop for modal */}
      {modalPeriod && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99
          }}
          onClick={() => setModalPeriod(null)}
        />
      )}
    </div>
  );
};
