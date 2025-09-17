import React, { useMemo, useState } from 'react';
import { AstroCartographyMap, AstroLine, BirthLocation } from '../components/AstroCartographyMap';
import { BirthData } from '../App';

interface AstroCartographyScreenProps {
  birthData: BirthData;
  onReset: () => void;
}

export const AstroCartographyScreen: React.FC<AstroCartographyScreenProps> = ({
  birthData,
  onReset
}) => {
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);

  const birthLocation: BirthLocation = useMemo(() => {
    // In a real implementation, you'd geocode the place name to coordinates
    // For now, using sample coordinates
    return {
      latitude: 40.7128, // Default to NYC
      longitude: -74.0060,
      name: birthData.place || 'Birth Location'
    };
  }, [birthData]);

  const astroLines: AstroLine[] = useMemo(() => {
    // Generate sample astro-cartography lines based on birth data
    const lines: AstroLine[] = [];
    const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
    const colors = ['#ffcc00', '#c0c0c0', '#ff6600', '#ff99cc', '#ff0000', '#8b4513', '#4b0082'];
    const lineTypes: ('AC' | 'DC' | 'MC' | 'IC')[] = ['AC', 'DC', 'MC', 'IC'];

    planets.forEach((planet, planetIndex) => {
      lineTypes.forEach((type, typeIndex) => {
        // Generate curved lines across the globe (simplified calculation)
        const baseOffset = (planetIndex * 30 + typeIndex * 7.5) - 180;
        lines.push({
          planet,
          type,
          coordinates: [
            [baseOffset, -85],
            [baseOffset, 85]
          ],
          color: colors[planetIndex],
          intensity: Math.random() * 0.8 + 0.2
        });
      });
    });

    return lines;
  }, [birthData]);

  const handleLocationClick = (coordinates: [number, number]) => {
    setSelectedLocation(coordinates);
  };

  const getLocationInterpretation = () => {
    if (!selectedLocation) return null;

    return (
      <div style={{
        margin: '20px 0',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <h4>Location Analysis</h4>
        <p><strong>Coordinates:</strong> {selectedLocation[1].toFixed(2)}°, {selectedLocation[0].toFixed(2)}°</p>
        <p>
          <strong>Planetary Influences:</strong> This location shows strong influences from Mars (energy, action)
          and Jupiter (expansion, luck) based on your birth chart. Consider this area for career advancement
          or starting new ventures.
        </p>
        <p>
          <strong>Recommended Activities:</strong> Business development, competitive sports, leadership roles,
          educational pursuits.
        </p>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1>Astro-Cartography Map</h1>
          <p style={{ color: '#666', margin: '5px 0' }}>
            Discover how planetary energies influence different geographical locations
          </p>
        </div>
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
          ← Back to Analysis
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{
          background: '#e3f2fd',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '15px'
        }}>
          <h3>Birth Information</h3>
          <p><strong>Date:</strong> {birthData.date}</p>
          {birthData.time && <p><strong>Time:</strong> {birthData.time}</p>}
          {birthData.place && <p><strong>Place:</strong> {birthData.place}</p>}
        </div>
      </div>

      <AstroCartographyMap
        birthLocation={birthLocation}
        astroLines={astroLines}
        onLocationClick={handleLocationClick}
      />

      {getLocationInterpretation()}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginTop: '30px'
      }}>
        <div style={{
          background: '#fff3cd',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #ffeaa7'
        }}>
          <h4>📍 How to Use</h4>
          <ul style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <li>Colored lines represent planetary influences across the globe</li>
            <li>Click anywhere on the map to get location-specific insights</li>
            <li>AC/DC lines affect relationships and partnerships</li>
            <li>MC/IC lines influence career and home life</li>
          </ul>
        </div>

        <div style={{
          background: '#d1ecf1',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #bee5eb'
        }}>
          <h4>🌟 Line Meanings</h4>
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <div><strong>AC:</strong> How others perceive you</div>
            <div><strong>DC:</strong> Relationships & partnerships</div>
            <div><strong>MC:</strong> Career & public reputation</div>
            <div><strong>IC:</strong> Home & family life</div>
          </div>
        </div>

        <div style={{
          background: '#f8d7da',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #f5c6cb'
        }}>
          <h4>⚡ Power Locations</h4>
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <div><strong>Sun Lines:</strong> Confidence & vitality</div>
            <div><strong>Moon Lines:</strong> Intuition & emotions</div>
            <div><strong>Mars Lines:</strong> Energy & action</div>
            <div><strong>Jupiter Lines:</strong> Luck & expansion</div>
          </div>
        </div>
      </div>
    </div>
  );
};