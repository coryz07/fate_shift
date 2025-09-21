# Astrological Calculation Backend

This Python backend provides comprehensive astrological calculations using Swiss Ephemeris for precise astronomical data.

## Features

### Core Calculations
- **Natal Charts**: Complete planetary positions, houses, and aspects
- **Transits**: Current planetary positions relative to natal chart
- **Progressions**: Secondary progressions (day-for-year method)
- **Solar Returns**: Annual sun return calculations
- **Arabic Parts**: Part of Fortune and other lots

### Advanced Timing Techniques
- **Zodiacal Releasing**: Hellenistic timing periods from Lot of Fortune/Spirit
- **Annual Profections**: 12-year house activation cycle
- **Planetary Periods**: Vimshottari Dasha framework
- **Critical Degrees**: Anaretic and critical degree identification

### Forensic Analysis (Dr. Celestine Starweaver)
- **Forensic Timing Analysis**: Multi-system convergence analysis
- **Stress Indicators**: Weighted analysis of challenging transits
- **Pattern Detection**: Technical astrological assessment

## Setup

1. **Install Dependencies**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Start Server**:
   ```bash
   ./start_server.sh
   ```

## API Endpoints

### Basic Calculations
- `POST /calculate/natal-chart` - Complete natal chart
- `POST /calculate/transits` - Transit calculations
- `POST /calculate/progressions` - Secondary progressions
- `POST /calculate/solar-return` - Solar return chart
- `POST /calculate/bazi` - Chinese Four Pillars

### Advanced Analysis
- `POST /analyze/forensic-timing` - Dr. Celestine's forensic analysis
- `POST /calculate/zodiacal-releasing` - Hellenistic timing
- `POST /calculate/annual-profections` - House profections
- `POST /analyze/stress-indicators` - Multi-date stress analysis
- `POST /calculate/planetary-periods` - Vimshottari Dasha

### Utilities
- `GET /health` - Server health check
- `GET /docs` - Interactive API documentation

## Example Usage

```python
from astrological_calculator import AstrologicalCalculator

# Initialize with birth data
calc = AstrologicalCalculator(
    birth_date="1988-04-25",
    birth_time="08:08:00",
    lat=40.5387,  # Sewickley, PA
    lon=-80.1844,
    timezone_offset=-4  # EDT
)

# Generate natal chart
natal_chart = calc.generate_full_natal_chart()

# Forensic timing analysis
forensic = calc.forensic_timing_analysis("2024-12-27")
print(forensic['technical_analysis'])
```

## Technical Notes

- Uses Swiss Ephemeris for astronomical precision
- Supports multiple house systems (Placidus, Koch, etc.)
- Configurable aspect orbs and critical degrees
- Professional forensic language for critical periods
- CORS enabled for React frontend integration

## Dependencies

- `pyswisseph` - Swiss Ephemeris calculations
- `fastapi` - Web API framework
- `uvicorn` - ASGI server
- `pydantic` - Data validation
- `python-dateutil` - Date utilities