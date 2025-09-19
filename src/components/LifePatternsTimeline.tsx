import React from 'react';
import type { CriticalPeriod } from '../services/precisionAstro';

export const LifePatternsTimeline: React.FC<{ periods: CriticalPeriod[] }> = ({ periods }) => (
  <div>
    <h2>Critical Life Patterns Timeline</h2>
    {periods.length === 0 && <div>Nothing major detected in the next cycle. Steady times ahead!</div>}
    <ul>
      {periods.map((p, i) => (
        <li key={i} style={{
          border: '1px solid #ccc',
          margin: '1em 0',
          padding: '1em',
          background: p.riskLevel === 'Super Critical' ? '#fff3f3'
                    : p.riskLevel === 'High' ? '#fff9e6'
                    : '#e6f7fa'
        }}>
          <strong>{p.label} ({new Date(p.startDate).getFullYear()})</strong>
          <div><b>When:</b> {new Date(p.startDate).toLocaleDateString()} – {new Date(p.endDate).toLocaleDateString()}</div>
          <div><b>Theme:</b> {p.theme}</div>
          <div><b>Risk Level:</b> {p.riskLevel}</div>
          <div style={{ fontWeight: 500, color: "#e00" }}>{p.advice}</div>
          <div><i>({p.system} method)</i></div>
        </li>
      ))}
    </ul>
  </div>
);
