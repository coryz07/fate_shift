# Advanced Astrological Timing API

This comprehensive system provides professional-grade astrological calculations combining multiple traditional and modern timing techniques. The framework integrates Hellenistic, Vedic, Medieval, and contemporary approaches for precise life timing analysis.

## System Architecture

### Core Components

1. **AstrologicalCalculator** - Base astronomical calculations using Swiss Ephemeris
2. **AdvancedTimingTechniques** - Multi-tradition timing methods
3. **FastAPI Backend** - REST API with 20+ specialized endpoints
4. **React Frontend Integration** - Ready for your existing UI

## Available Timing Systems

### ⭐ Hellenistic Techniques

#### Zodiacal Releasing (ZR)
**Endpoint:** `POST /timing/zodiacal-releasing`

The premier Hellenistic timing system based on Lot of Fortune or Spirit periods.

**Features:**
- Multi-level period analysis (L1-L4)
- Peak period identification
- Loosening of bond detection
- 360-day year calculations

**Parameters:**
- `starting_lot`: "fortune" or "spirit"
- `target_date`: Analysis date (optional, defaults to today)

**Example Response:**
```json
{
  "zodiacal_releasing": [
    {
      "level": 1,
      "sign": "Leo",
      "ruler": "sun",
      "peak": true,
      "loosening": false,
      "start_days": 0,
      "end_days": 6840
    }
  ]
}
```

#### Annual Profections
**Endpoint:** `POST /calculate/annual-profections`

12-year house activation cycle with time lord analysis.

**Features:**
- Current activated house and sign
- Time lord condition assessment
- Monthly profections
- House topic activation

### 🕉️ Vedic Techniques

#### Vimshottari Dasha
**Endpoint:** `POST /timing/vimshottari-dasha`

120-year planetary period system based on Moon's nakshatra.

**Features:**
- Mahadasha (major periods)
- Antardasha (sub-periods)
- Precise timing based on birth Moon
- Current and upcoming periods

**Example Response:**
```json
{
  "vimshottari_dasha": {
    "current_mahadasha": {
      "mahadasha": "venus",
      "start": "2020-01-15",
      "end": "2040-01-15",
      "years": 20
    },
    "current_antardasha": {
      "planet": "mercury",
      "years": 3.4
    }
  }
}
```

#### Chara Dasha (Framework)
Sign-based timing using Jaimini principles.

### 🏛️ Medieval/Persian Techniques

#### Firdaria
**Endpoint:** `POST /timing/firdaria`

75-year planetary cycles with day/night birth variations.

**Features:**
- Major period rulers
- 7-fold sub-period divisions
- Day vs. night birth sequences
- Persian classical methodology

### 🌟 Modern Techniques

#### Planetary Returns
**Endpoint:** `POST /timing/planetary-returns`

Calculate major planetary cycles (Saturn, Jupiter, etc.).

**Parameters:**
- `planet`: "saturn", "jupiter", "uranus", etc.
- `years_ahead`: Forecast range

#### Eclipse Sensitivity
**Endpoint:** `POST /timing/eclipse-sensitivity`

Identify eclipses hitting natal sensitive points.

**Features:**
- 5° orb to natal planets/angles
- Major life event timing
- Eclipse season analysis

#### Progressed Angles
**Endpoint:** `POST /timing/progressed-angles`

Secondary progression aspects to natal chart.

### 🎯 Composite Analysis

#### Full Advanced Analysis
**Endpoint:** `POST /timing/full-advanced-analysis`

Comprehensive analysis combining all timing systems.

**Returns:**
- All timing techniques in one response
- Analysis summary with key factors
- Multi-system convergence identification

**Example Summary:**
```json
{
  "analysis_summary": {
    "profected_house": 8,
    "profected_sign": "Scorpio",
    "time_lord": "mars",
    "current_dasha": "venus",
    "current_antardasha": "mercury",
    "firdaria_lord": "jupiter",
    "upcoming_eclipses": 2,
    "active_progressions": 3
  }
}
```

#### Composite Timing Analysis
**Endpoint:** `POST /timing/composite-analysis`

Multi-day intensity scoring and pattern recognition.

**Features:**
- Weighted factor analysis
- Peak intensity date identification
- Multi-system convergence scoring
- Stress period forecasting

## Dr. Celestine Starweaver Integration

The system includes specialized forensic analysis capabilities matching your ASTROLOGY_SYSTEM_PROMPT:

### Forensic Timing Analysis
**Endpoint:** `POST /analyze/forensic-timing`

**Professional Technical Language:**
- "Your progressed Mars conjunct natal 8th house Pluto with transiting Saturn..."
- "This convergence with your Chinese elemental exhaustion cycle..."
- "Critical forensic pattern identification"

**Convergence Scoring:**
- Hard transits to angles: +5 points
- Progressed critical degrees: +3 points
- Saturn cycle activation: +8 points
- Multiple system alignment: Exponential weighting

## API Usage Examples

### Basic Birth Chart
```javascript
const birthData = {
  date: "1988-04-25",
  time: "08:08:00",
  lat: 40.5387,
  lon: -80.1844,
  timezone_offset: -4
};

// Get complete timing overview
const response = await fetch('/timing/full-advanced-analysis', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ birth_data: birthData })
});
```

### Stress Period Analysis
```javascript
const stressRequest = {
  birth_data: birthData,
  date_range: ["2024-01-01", "2024-01-31"] // January 2024
};

const stressAnalysis = await fetch('/analyze/stress-indicators', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(stressRequest)
});
```

### Date Range Composite Analysis
```javascript
const compositeRequest = {
  birth_data: birthData,
  date_range_start: "2024-12-01",
  date_range_end: "2025-03-01"
};

const composite = await fetch('/timing/composite-analysis', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(compositeRequest)
});
```

## Complete Endpoint Reference

### Core Calculations
- `POST /calculate/natal-chart` - Complete natal analysis
- `POST /calculate/transits` - Current transits
- `POST /calculate/progressions` - Secondary progressions
- `POST /calculate/solar-return` - Annual solar returns
- `POST /calculate/bazi` - Chinese Four Pillars

### Advanced Timing
- `POST /timing/zodiacal-releasing` - Hellenistic ZR periods
- `POST /timing/vimshottari-dasha` - Vedic dasha system
- `POST /timing/firdaria` - Persian/Medieval periods
- `POST /timing/planetary-returns` - Major planetary cycles
- `POST /timing/eclipse-sensitivity` - Eclipse impact analysis
- `POST /timing/progressed-angles` - Progression aspects
- `POST /timing/composite-analysis` - Multi-system analysis
- `POST /timing/full-advanced-analysis` - Complete overview

### Forensic Analysis
- `POST /analyze/forensic-timing` - Dr. Celestine's analysis
- `POST /analyze/stress-indicators` - Weighted stress scoring
- `POST /analyze/critical-periods` - Critical degree analysis

### Utilities
- `GET /health` - System health check
- `GET /docs` - Interactive API documentation

## Technical Notes

### Astronomical Precision
- Swiss Ephemeris integration with Moshier fallback
- Multiple house systems (Placidus, Koch, etc.)
- Configurable aspect orbs and critical degrees
- Professional-grade astronomical calculations

### Error Handling
- Comprehensive try/catch for ephemeris issues
- Graceful fallback to built-in calculations
- Detailed error messages for debugging

### Performance
- Optimized for multiple concurrent calculations
- Efficient caching of repeated astronomical data
- Fast response times for real-time applications

## Starting the System

```bash
cd /Users/cz/fate_shift/backend
./start_server.sh
```

**API Available at:** `http://localhost:8000`
**Interactive Docs:** `http://localhost:8000/docs`

## Integration with React Frontend

The system is designed to work seamlessly with your existing React app. The ASTROLOGY_SYSTEM_PROMPT constant is already integrated into your FullBirthInput component and can now be powered by this comprehensive calculation backend.

### Key Integration Points
1. **Birth Data Collection** - Your FullBirthInput component
2. **API Calls** - Fetch advanced timing analysis
3. **Dr. Celestine Responses** - Format using forensic analysis endpoints
4. **Multi-System Display** - Show convergent timing factors

This creates a complete professional astrological analysis system combining traditional wisdom with modern computational precision.