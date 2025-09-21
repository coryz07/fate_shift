from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import traceback

from astrological_calculator import AstrologicalCalculator
from advanced_timing import AdvancedTimingTechniques

app = FastAPI(title="Astrological Calculation API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class BirthData(BaseModel):
    date: str  # YYYY-MM-DD
    time: Optional[str] = "12:00:00"  # HH:MM:SS, default to noon
    place: Optional[str] = None
    timezone: Optional[str] = None
    lat: float = 40.5387  # Default to Sewickley, PA
    lon: float = -80.1844
    timezone_offset: int = -5  # Default to EST
    tradition: str = "Western"
    depth: str = "Standard"


class TransitRequest(BaseModel):
    birth_data: BirthData
    target_date: str  # YYYY-MM-DD


@app.get("/")
async def root():
    return {"message": "Astrological Calculation API is running"}


@app.post("/calculate/natal-chart")
async def calculate_natal_chart(birth_data: BirthData) -> Dict[str, Any]:
    """Calculate complete natal chart"""
    try:
        calculator = AstrologicalCalculator(
            birth_date=birth_data.date,
            birth_time=birth_data.time,
            lat=birth_data.lat,
            lon=birth_data.lon,
            timezone_offset=birth_data.timezone_offset
        )

        result = calculator.generate_full_natal_chart()

        # Add metadata
        result['metadata'] = {
            'tradition': birth_data.tradition,
            'depth': birth_data.depth,
            'calculation_type': 'natal_chart'
        }

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation error: {str(e)}")


@app.post("/calculate/transits")
async def calculate_transits(request: TransitRequest) -> Dict[str, Any]:
    """Calculate transits for a specific date"""
    try:
        calculator = AstrologicalCalculator(
            birth_date=request.birth_data.date,
            birth_time=request.birth_data.time,
            lat=request.birth_data.lat,
            lon=request.birth_data.lon,
            timezone_offset=request.birth_data.timezone_offset
        )

        transits = calculator.calculate_transits(request.target_date)

        return {
            'transits': transits,
            'target_date': request.target_date,
            'birth_info': {
                'date': request.birth_data.date,
                'time': request.birth_data.time
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transit calculation error: {str(e)}")


@app.post("/calculate/progressions")
async def calculate_progressions(request: TransitRequest) -> Dict[str, Any]:
    """Calculate secondary progressions for a specific date"""
    try:
        calculator = AstrologicalCalculator(
            birth_date=request.birth_data.date,
            birth_time=request.birth_data.time,
            lat=request.birth_data.lat,
            lon=request.birth_data.lon,
            timezone_offset=request.birth_data.timezone_offset
        )

        progressions = calculator.calculate_progressions(request.target_date)

        return {
            'progressions': progressions,
            'target_date': request.target_date,
            'birth_info': {
                'date': request.birth_data.date,
                'time': request.birth_data.time
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Progression calculation error: {str(e)}")


@app.post("/calculate/solar-return")
async def calculate_solar_return(birth_data: BirthData, year: int) -> Dict[str, Any]:
    """Calculate solar return for a specific year"""
    try:
        calculator = AstrologicalCalculator(
            birth_date=birth_data.date,
            birth_time=birth_data.time,
            lat=birth_data.lat,
            lon=birth_data.lon,
            timezone_offset=birth_data.timezone_offset
        )

        solar_return = calculator.calculate_solar_return(year)

        return {
            'solar_return': solar_return,
            'year': year,
            'birth_info': {
                'date': birth_data.date,
                'time': birth_data.time
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Solar return calculation error: {str(e)}")


@app.post("/calculate/bazi")
async def calculate_bazi(birth_data: BirthData) -> Dict[str, Any]:
    """Calculate Chinese BaZi Four Pillars"""
    try:
        calculator = AstrologicalCalculator(
            birth_date=birth_data.date,
            birth_time=birth_data.time,
            lat=birth_data.lat,
            lon=birth_data.lon,
            timezone_offset=birth_data.timezone_offset
        )

        bazi = calculator.calculate_bazi_pillars()

        return {
            'bazi_pillars': bazi,
            'birth_info': {
                'date': birth_data.date,
                'time': birth_data.time
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"BaZi calculation error: {str(e)}")


@app.post("/analyze/critical-periods")
async def analyze_critical_periods(birth_data: BirthData) -> Dict[str, Any]:
    """Analyze critical degrees and periods"""
    try:
        calculator = AstrologicalCalculator(
            birth_date=birth_data.date,
            birth_time=birth_data.time,
            lat=birth_data.lat,
            lon=birth_data.lon,
            timezone_offset=birth_data.timezone_offset
        )

        critical_degrees = calculator.critical_degree_analysis()

        # Calculate current transits for additional context
        today = datetime.now().strftime("%Y-%m-%d")
        current_transits = calculator.calculate_transits(today)

        return {
            'critical_degrees': critical_degrees,
            'current_transits': current_transits,
            'analysis_date': today,
            'birth_info': {
                'date': birth_data.date,
                'time': birth_data.time
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Critical period analysis error: {str(e)}")


@app.post("/analyze/forensic-timing")
async def forensic_timing_analysis(birth_data: BirthData, target_date: str) -> Dict[str, Any]:
    """Dr. Celestine Starweaver's forensic timing analysis"""
    try:
        calculator = AstrologicalCalculator(
            birth_date=birth_data.date,
            birth_time=birth_data.time,
            lat=birth_data.lat,
            lon=birth_data.lon,
            timezone_offset=birth_data.timezone_offset
        )

        analysis = calculator.forensic_timing_analysis(target_date)

        return {
            'forensic_analysis': analysis,
            'persona': 'Dr. Celestine Starweaver',
            'analysis_type': 'forensic_timing',
            'birth_info': {
                'date': birth_data.date,
                'time': birth_data.time
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forensic analysis error: {str(e)}")


@app.post("/calculate/zodiacal-releasing")
async def calculate_zodiacal_releasing(birth_data: BirthData, target_date: str) -> Dict[str, Any]:
    """Calculate Hellenistic zodiacal releasing periods"""
    try:
        calculator = AstrologicalCalculator(
            birth_date=birth_data.date,
            birth_time=birth_data.time,
            lat=birth_data.lat,
            lon=birth_data.lon,
            timezone_offset=birth_data.timezone_offset
        )

        zr_analysis = calculator.calculate_zodiacal_releasing(target_date)

        return {
            'zodiacal_releasing': zr_analysis,
            'target_date': target_date,
            'birth_info': {
                'date': birth_data.date,
                'time': birth_data.time
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Zodiacal releasing calculation error: {str(e)}")


@app.post("/calculate/annual-profections")
async def calculate_annual_profections(birth_data: BirthData, current_age: int) -> Dict[str, Any]:
    """Calculate annual profections for current age"""
    try:
        calculator = AstrologicalCalculator(
            birth_date=birth_data.date,
            birth_time=birth_data.time,
            lat=birth_data.lat,
            lon=birth_data.lon,
            timezone_offset=birth_data.timezone_offset
        )

        profections = calculator.calculate_annual_profections(current_age)

        return {
            'annual_profections': profections,
            'current_age': current_age,
            'birth_info': {
                'date': birth_data.date,
                'time': birth_data.time
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Annual profections calculation error: {str(e)}")


class StressAnalysisRequest(BaseModel):
    birth_data: BirthData
    date_range: list[str]  # List of dates in YYYY-MM-DD format


@app.post("/analyze/stress-indicators")
async def analyze_stress_indicators(request: StressAnalysisRequest) -> Dict[str, Any]:
    """Analyze stress indicators over a date range"""
    try:
        calculator = AstrologicalCalculator(
            birth_date=request.birth_data.date,
            birth_time=request.birth_data.time,
            lat=request.birth_data.lat,
            lon=request.birth_data.lon,
            timezone_offset=request.birth_data.timezone_offset
        )

        stress_analysis = calculator.analyze_stress_indicators(request.date_range)

        return {
            'stress_analysis': stress_analysis,
            'date_range': request.date_range,
            'birth_info': {
                'date': request.birth_data.date,
                'time': request.birth_data.time
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stress analysis error: {str(e)}")


@app.post("/calculate/planetary-periods")
async def calculate_planetary_periods(birth_data: BirthData) -> Dict[str, Any]:
    """Calculate Vimshottari Dasha periods"""
    try:
        calculator = AstrologicalCalculator(
            birth_date=birth_data.date,
            birth_time=birth_data.time,
            lat=birth_data.lat,
            lon=birth_data.lon,
            timezone_offset=birth_data.timezone_offset
        )

        periods = calculator.calculate_planetary_periods()

        return {
            'planetary_periods': periods,
            'birth_info': {
                'date': birth_data.date,
                'time': birth_data.time
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Planetary periods calculation error: {str(e)}")


# ============= ADVANCED TIMING ENDPOINTS =============

@app.post("/timing/zodiacal-releasing")
async def zodiacal_releasing_analysis(birth_data: BirthData, starting_lot: str = "fortune", target_date: Optional[str] = None) -> Dict[str, Any]:
    """Hellenistic Zodiacal Releasing periods analysis"""
    try:
        calculator = AstrologicalCalculator(
            birth_date=birth_data.date,
            birth_time=birth_data.time,
            lat=birth_data.lat,
            lon=birth_data.lon,
            timezone_offset=birth_data.timezone_offset
        )

        timing = AdvancedTimingTechniques(calculator)
        zr_analysis = timing.calculate_zodiacal_releasing(starting_lot, target_date)

        return {
            'zodiacal_releasing': zr_analysis,
            'starting_lot': starting_lot,
            'target_date': target_date or datetime.now().strftime("%Y-%m-%d"),
            'birth_info': {
                'date': birth_data.date,
                'time': birth_data.time
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Zodiacal releasing analysis error: {str(e)}")


@app.post("/timing/vimshottari-dasha")
async def vimshottari_dasha_analysis(birth_data: BirthData, current_date: Optional[str] = None) -> Dict[str, Any]:
    """Vedic Vimshottari Dasha periods analysis"""
    try:
        calculator = AstrologicalCalculator(
            birth_date=birth_data.date,
            birth_time=birth_data.time,
            lat=birth_data.lat,
            lon=birth_data.lon,
            timezone_offset=birth_data.timezone_offset
        )

        timing = AdvancedTimingTechniques(calculator)
        dasha_analysis = timing.calculate_vimshottari_dasha(current_date)

        return {
            'vimshottari_dasha': dasha_analysis,
            'current_date': current_date or datetime.now().strftime("%Y-%m-%d"),
            'birth_info': {
                'date': birth_data.date,
                'time': birth_data.time
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vimshottari Dasha analysis error: {str(e)}")


@app.post("/timing/firdaria")
async def firdaria_analysis(birth_data: BirthData, current_date: Optional[str] = None) -> Dict[str, Any]:
    """Medieval/Persian Firdaria periods analysis"""
    try:
        calculator = AstrologicalCalculator(
            birth_date=birth_data.date,
            birth_time=birth_data.time,
            lat=birth_data.lat,
            lon=birth_data.lon,
            timezone_offset=birth_data.timezone_offset
        )

        timing = AdvancedTimingTechniques(calculator)
        firdaria_analysis = timing.calculate_firdaria(current_date)

        return {
            'firdaria': firdaria_analysis,
            'current_date': current_date or datetime.now().strftime("%Y-%m-%d"),
            'birth_info': {
                'date': birth_data.date,
                'time': birth_data.time
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Firdaria analysis error: {str(e)}")


@app.post("/timing/planetary-returns")
async def planetary_returns_analysis(birth_data: BirthData, planet: str = "saturn", years_ahead: int = 5) -> Dict[str, Any]:
    """Calculate planetary returns (Saturn, Jupiter, etc.)"""
    try:
        calculator = AstrologicalCalculator(
            birth_date=birth_data.date,
            birth_time=birth_data.time,
            lat=birth_data.lat,
            lon=birth_data.lon,
            timezone_offset=birth_data.timezone_offset
        )

        timing = AdvancedTimingTechniques(calculator)
        returns = timing.calculate_planetary_returns(planet, years_ahead)

        return {
            'planetary_returns': returns,
            'planet': planet,
            'years_ahead': years_ahead,
            'birth_info': {
                'date': birth_data.date,
                'time': birth_data.time
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Planetary returns analysis error: {str(e)}")


@app.post("/timing/eclipse-sensitivity")
async def eclipse_sensitivity_analysis(birth_data: BirthData, years_range: int = 2) -> Dict[str, Any]:
    """Find eclipses hitting sensitive natal points"""
    try:
        calculator = AstrologicalCalculator(
            birth_date=birth_data.date,
            birth_time=birth_data.time,
            lat=birth_data.lat,
            lon=birth_data.lon,
            timezone_offset=birth_data.timezone_offset
        )

        timing = AdvancedTimingTechniques(calculator)
        eclipse_analysis = timing.calculate_eclipse_sensitivity(years_range)

        return {
            'eclipse_sensitivity': eclipse_analysis,
            'years_range': years_range,
            'birth_info': {
                'date': birth_data.date,
                'time': birth_data.time
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Eclipse sensitivity analysis error: {str(e)}")


@app.post("/timing/progressed-angles")
async def progressed_angles_analysis(birth_data: BirthData, target_date: Optional[str] = None) -> Dict[str, Any]:
    """Secondary progressed angles to natal/transiting planets"""
    try:
        calculator = AstrologicalCalculator(
            birth_date=birth_data.date,
            birth_time=birth_data.time,
            lat=birth_data.lat,
            lon=birth_data.lon,
            timezone_offset=birth_data.timezone_offset
        )

        timing = AdvancedTimingTechniques(calculator)
        progressed_analysis = timing.calculate_progressed_angles(target_date)

        return {
            'progressed_angles': progressed_analysis,
            'target_date': target_date or datetime.now().strftime("%Y-%m-%d"),
            'birth_info': {
                'date': birth_data.date,
                'time': birth_data.time
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Progressed angles analysis error: {str(e)}")


class CompositeTimingRequest(BaseModel):
    birth_data: BirthData
    date_range_start: str  # YYYY-MM-DD
    date_range_end: str    # YYYY-MM-DD


@app.post("/timing/composite-analysis")
async def composite_timing_analysis(request: CompositeTimingRequest) -> Dict[str, Any]:
    """Comprehensive multi-system timing analysis"""
    try:
        calculator = AstrologicalCalculator(
            birth_date=request.birth_data.date,
            birth_time=request.birth_data.time,
            lat=request.birth_data.lat,
            lon=request.birth_data.lon,
            timezone_offset=request.birth_data.timezone_offset
        )

        timing = AdvancedTimingTechniques(calculator)
        composite_analysis = timing.composite_timing_analysis(
            request.date_range_start,
            request.date_range_end
        )

        return {
            'composite_timing': composite_analysis,
            'date_range': {
                'start': request.date_range_start,
                'end': request.date_range_end
            },
            'birth_info': {
                'date': request.birth_data.date,
                'time': request.birth_data.time
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Composite timing analysis error: {str(e)}")


@app.post("/timing/full-advanced-analysis")
async def full_advanced_timing_analysis(birth_data: BirthData, target_date: Optional[str] = None) -> Dict[str, Any]:
    """Complete advanced timing analysis combining all techniques"""
    try:
        calculator = AstrologicalCalculator(
            birth_date=birth_data.date,
            birth_time=birth_data.time,
            lat=birth_data.lat,
            lon=birth_data.lon,
            timezone_offset=birth_data.timezone_offset
        )

        timing = AdvancedTimingTechniques(calculator)

        if not target_date:
            target_date = datetime.now().strftime("%Y-%m-%d")

        # Get all timing analyses
        profections = timing.calculate_annual_profections()
        zr = timing.calculate_zodiacal_releasing(target_date=target_date)
        dasha = timing.calculate_vimshottari_dasha(target_date)
        firdaria = timing.calculate_firdaria(target_date)
        returns = timing.calculate_planetary_returns('saturn', 10)
        eclipses = timing.calculate_eclipse_sensitivity(2)
        progressed = timing.calculate_progressed_angles(target_date)

        return {
            'full_advanced_analysis': {
                'annual_profections': profections,
                'zodiacal_releasing': zr,
                'vimshottari_dasha': dasha,
                'firdaria': firdaria,
                'saturn_returns': returns,
                'eclipse_sensitivity': eclipses,
                'progressed_angles': progressed
            },
            'target_date': target_date,
            'analysis_summary': {
                'profected_house': profections['profected_house'],
                'profected_sign': profections['profected_sign'],
                'time_lord': profections['time_lord'],
                'current_dasha': dasha['current_mahadasha']['mahadasha'] if dasha['current_mahadasha'] else None,
                'current_antardasha': dasha['current_antardasha']['planet'] if dasha['current_antardasha'] else None,
                'firdaria_lord': firdaria['major_period'] if firdaria else None,
                'upcoming_eclipses': len([e for e in eclipses if e['date'] > datetime.strptime(target_date, "%Y-%m-%d")]),
                'active_progressions': len(progressed)
            },
            'birth_info': {
                'date': birth_data.date,
                'time': birth_data.time
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Full advanced timing analysis error: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test if Swiss Ephemeris is working
        import swisseph as swe
        test_jd = swe.julday(2024, 1, 1, 12)
        pos, ret = swe.calc_ut(test_jd, swe.SUN, swe.FLG_SWIEPH)

        return {
            "status": "healthy",
            "swiss_ephemeris": "working",
            "test_calculation": f"Sun position on 2024-01-01: {pos[0]:.2f}°"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)