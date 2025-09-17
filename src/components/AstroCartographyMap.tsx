import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps';

const geoUrl = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

export interface AstroLine {
  planet: string;
  type: 'AC' | 'DC' | 'MC' | 'IC';
  coordinates: [number, number][];
  color: string;
  intensity: number;
}

export interface BirthLocation {
  latitude: number;
  longitude: number;
  name: string;
}

interface AstroCartographyMapProps {
  birthLocation: BirthLocation;
  astroLines: AstroLine[];
  onLocationClick?: (coordinates: [number, number]) => void;
}

export const AstroCartographyMap: React.FC<AstroCartographyMapProps> = ({
  birthLocation,
  astroLines,
  onLocationClick
}) => {
  const [hoveredLine, setHoveredLine] = useState<string | null>(null);

  const handleLocationClick = () => {
    if (onLocationClick) {
      // This is a simplified click handler - in a real implementation you'd convert screen coordinates to lat/lng
      onLocationClick([0, 0]);
    }
  };

  return (
    <div style={{ width: '100%', height: '500px', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{
          scale: 140,
          center: [0, 0]
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#f0f0f0"
                stroke="#d0d0d0"
                strokeWidth={0.5}
                onClick={handleLocationClick}
                style={{
                  default: { outline: 'none' },
                  hover: { fill: '#e0e0e0', outline: 'none' },
                  pressed: { outline: 'none' }
                }}
              />
            ))
          }
        </Geographies>

        {/* Birth Location Marker */}
        <Marker coordinates={[birthLocation.longitude, birthLocation.latitude]}>
          <circle r={6} fill="#ff6b6b" stroke="#fff" strokeWidth={2} />
          <text
            textAnchor="middle"
            y={-10}
            style={{ fontFamily: 'system-ui', fontSize: '12px', fill: '#333' }}
          >
            {birthLocation.name}
          </text>
        </Marker>

        {/* Astro-Cartography Lines */}
        {astroLines.map((line, index) => (
          <g key={`${line.planet}-${line.type}-${index}`}>
            {line.coordinates.length > 1 && (
              <Line
                from={line.coordinates[0]}
                to={line.coordinates[1]}
                stroke={line.color}
                strokeWidth={hoveredLine === `${line.planet}-${line.type}` ? 3 : 2}
                strokeOpacity={0.8}
                onMouseEnter={() => setHoveredLine(`${line.planet}-${line.type}`)}
                onMouseLeave={() => setHoveredLine(null)}
                style={{ cursor: 'pointer' }}
              />
            )}
          </g>
        ))}
      </ComposableMap>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(255,255,255,0.9)',
        padding: '10px',
        borderRadius: '6px',
        fontSize: '12px',
        maxWidth: '200px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Planetary Lines</div>
        {astroLines.slice(0, 5).map((line, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <div
              style={{
                width: '16px',
                height: '2px',
                backgroundColor: line.color,
                marginRight: '8px'
              }}
            />
            <span>{line.planet} {line.type}</span>
          </div>
        ))}
        {astroLines.length > 5 && (
          <div style={{ color: '#666', fontSize: '11px' }}>
            +{astroLines.length - 5} more lines...
          </div>
        )}
      </div>
    </div>
  );
};