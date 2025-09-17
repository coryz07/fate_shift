import React, { useState, useEffect } from 'react';
import { BirthData } from '../App';
import './FullBirthInput.css';

interface FullBirthInputProps {
  onBirthDataSubmit: (data: BirthData) => void;
}

interface LocationSuggestion {
  name: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
}

/**
 * Smart birth data input form with place autocomplete and timezone detection
 * @param props Component props
 * @returns JSX element
 */
export const FullBirthInput: React.FC<FullBirthInputProps> = ({ onBirthDataSubmit }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [place, setPlace] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [selectedTimezone, setSelectedTimezone] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  // Mock location data - in a real app, this would come from an API
  const mockLocations: LocationSuggestion[] = [
    { name: 'New York', country: 'United States', lat: 40.7128, lng: -74.0060, timezone: 'America/New_York' },
    { name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, timezone: 'Europe/London' },
    { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, timezone: 'Asia/Tokyo' },
    { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney' },
    { name: 'Los Angeles', country: 'United States', lat: 34.0522, lng: -118.2437, timezone: 'America/Los_Angeles' },
    { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, timezone: 'Europe/Paris' },
    { name: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, timezone: 'Europe/Berlin' },
    { name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, timezone: 'America/Toronto' }
  ];

  /**
   * Handle place input changes and filter suggestions
   */
  const handlePlaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPlace(value);
    
    if (value.length > 1) {
      const filtered = mockLocations.filter(location =>
        location.name.toLowerCase().includes(value.toLowerCase()) ||
        location.country.toLowerCase().includes(value.toLowerCase())
      );
      setLocationSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  /**
   * Handle location selection from suggestions
   */
  const handleLocationSelect = (location: LocationSuggestion) => {
    setPlace(`${location.name}, ${location.country}`);
    setSelectedTimezone(location.timezone);
    setShowSuggestions(false);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      alert('Please enter a birth date.');
      return;
    }

    const birthData: BirthData = {
      date,
      time: time || undefined,
      place: place || undefined,
      timezone: selectedTimezone || undefined
    };

    onBirthDataSubmit(birthData);
  };

  /**
   * Get current date in YYYY-MM-DD format for max attribute
   */
  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <form className="full-birth-input" onSubmit={handleSubmit}>
      <div className="input-group">
        <label htmlFor="birth-date" className="input-label">
          <span className="label-text">Birth Date *</span>
          <span className="label-description">Required for all calculations</span>
        </label>
        <input
          id="birth-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={getCurrentDate()}
          className="input-field"
          required
        />
      </div>

      <div className="advanced-toggle">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={isAdvancedMode}
            onChange={(e) => setIsAdvancedMode(e.target.checked)}
            className="toggle-checkbox"
          />
          <span className="toggle-slider"></span>
          <span className="toggle-text">Enable precise timing (optional but recommended)</span>
        </label>
      </div>

      {isAdvancedMode && (
        <div className="advanced-inputs">
          <div className="input-group">
            <label htmlFor="birth-time" className="input-label">
              <span className="label-text">Birth Time</span>
              <span className="label-description">More precise astrological calculations</span>
            </label>
            <input
              id="birth-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="input-group location-group">
            <label htmlFor="birth-place" className="input-label">
              <span className="label-text">Birth Location</span>
              <span className="label-description">City, country for timezone detection</span>
            </label>
            <div className="location-input-container">
              <input
                id="birth-place"
                type="text"
                value={place}
                onChange={handlePlaceChange}
                placeholder="Start typing city name..."
                className="input-field"
                onFocus={() => place.length > 1 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              {showSuggestions && locationSuggestions.length > 0 && (
                <div className="location-suggestions">
                  {locationSuggestions.map((location, index) => (
                    <div
                      key={index}
                      className="location-suggestion"
                      onClick={() => handleLocationSelect(location)}
                    >
                      <div className="location-name">{location.name}</div>
                      <div className="location-country">{location.country}</div>
                      <div className="location-timezone">{location.timezone}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedTimezone && (
              <div className="timezone-display">
                <span className="timezone-label">Detected timezone:</span>
                <span className="timezone-value">{selectedTimezone}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="form-actions">
        <button type="submit" className="submit-button">
          <span className="button-icon">✨</span>
          Generate Life Analysis
        </button>
        <div className="precision-note">
          {isAdvancedMode 
            ? 'Advanced mode: Maximum precision analysis'
            : 'Basic mode: Date-only analysis'
          }
        </div>
      </div>
    </form>
  );
};
