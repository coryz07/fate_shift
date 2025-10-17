from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
import pytz
import swisseph as swe
import os

EPHE_PATH = os.getenv("EPHE_PATH", "./ephemeris")
swe.set_ephe_path(EPHE_PATH)

app = FastAPI(title="Fate Shift Ephemeris API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten for prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class When(BaseModel):
    year: int = Field(..., ge=-3000, le=3000)
    month: int = Field(..., ge=1, le=12)
    day: int = Field(..., ge=1, le=31)
    hour: float = Field(12.0, ge=0, le=24)  # decimal hours, local unless tz omitted
    tz: Optional[str] = None  # e.g., "America/New_York"

def to_ut_jd(w: When) -> float:
    hour = int(w.hour)
    minute = int(round((w.hour - hour) * 60))
    if w.tz:
        tz = pytz.timezone(w.tz)
        dt_local = tz.localize(datetime(w.year, w.month, w.day, hour, minute, 0))
        dt_utc = dt_local.astimezone(timezone.utc)
        ut_hour = dt_utc.hour + dt_utc.minute/60 + dt_utc.second/3600
        return swe.julday(dt_utc.year, dt_utc.month, dt_utc.day, ut_hour)
    else:
        # treat given hour as already UT
        return swe.julday(w.year, w.month, w.day, w.hour)

FLAGS = swe.FLG_SWIEPH | swe.FLG_SPEED  # Swiss eph + speeds

@app.get("/health")
def health():
    return {"status": "ok", "ephe_path": EPHE_PATH}

@app.post("/planet/{name}")
def planet(name: str, when: When):
    jd = to_ut_jd(when)
    name_upper = name.upper()
    # Map common names
    name_map = {
        "SUN": swe.SUN, "MOON": swe.MOON, "MERCURY": swe.MERCURY,
        "VENUS": swe.VENUS, "MARS": swe.MARS, "JUPITER": swe.JUPITER,
        "SATURN": swe.SATURN, "URANUS": swe.URANUS, "NEPTUNE": swe.NEPTUNE,
        "PLUTO": swe.PLUTO, "CHIRON": swe.CHIRON, "CERES": swe.CERES,
        "PALLAS": swe.PALLAS, "JUNO": swe.JUNO, "VESTA": swe.VESTA,
    }
    if name_upper not in name_map:
        raise HTTPException(400, f"Unknown planet/asteroid name: {name}")
    pos, _ = swe.calc_ut(jd, name_map[name_upper], FLAGS)
    return {"jd": jd, "name": name_upper, "lon": pos[0], "lat": pos[1], "dist": pos[2],
            "speed_lon": pos[3]}

@app.post("/asteroid/{minor_number}")
def asteroid(minor_number: int, when: When):
    # Swiss Ephemeris uses SE_AST_OFFSET + minor number
    planet_id = swe.AST_OFFSET + minor_number
    jd = to_ut_jd(when)
    try:
        pos, _ = swe.calc_ut(jd, planet_id, FLAGS)
        return {"jd": jd, "minor": minor_number, "lon": pos[0], "lat": pos[1],
                "dist": pos[2], "speed_lon": pos[3]}
    except Exception as e:
        raise HTTPException(500, f"Asteroid calc failed: {e}")
