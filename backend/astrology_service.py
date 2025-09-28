import swisseph as swe
from datetime import datetime, timedelta

PLANETS = {
    'Sun': swe.SUN, 'Moon': swe.MOON, 'Mercury': swe.MERCURY, 'Venus': swe.VENUS, 'Mars': swe.MARS,
    'Jupiter': swe.JUPITER, 'Saturn': swe.SATURN, 'Uranus': swe.URANUS, 'Neptune': swe.NEPTUNE, 'Pluto': swe.PLUTO
}

TRANSITING_PLANETS = {
    'Mars': swe.MARS, 'Saturn': swe.SATURN, 'Uranus': swe.URANUS, 'Neptune': swe.NEPTUNE, 'Pluto': swe.PLUTO
}

ASPECTS = {
    0: "Conjunction", 90: "Square", 180: "Opposition"
}
ORB = 5  # Orb of influence for aspects

def get_julian_day(year, month, day, hour=0, minute=0, second=0):
    """Converts a calendar date to a Julian day."""
    return swe.julday(year, month, day, hour + minute/60 + second/3600)

def calculate_planets(julian_day):
    """Calculates the positions of the planets for a given Julian day."""
    planet_positions = {}
    for name, p_id in PLANETS.items():
        pos, _ = swe.calc_ut(julian_day, p_id)
        planet_positions[name] = { 'longitude': pos[0] }
    return planet_positions

def calculate_forensic_astrology(natal_jd):
    """
    Calculates challenging transits for the next year.
    This is a simplified example focusing on major hard aspects from outer planets.
    """
    cautious_periods = []
    natal_positions = calculate_planets(natal_jd)
    
    today = datetime.utcnow()
    for i in range(365): # Check for the next year
        current_date = today + timedelta(days=i)
        current_jd = get_julian_day(current_date.year, current_date.month, current_date.day)
        transiting_positions = calculate_planets(current_jd)

        for transiting_planet_name, transiting_planet_pos in transiting_positions.items():
            if transiting_planet_name not in TRANSITING_PLANETS:
                continue

            for natal_planet_name, natal_planet_pos in natal_positions.items():
                angle = abs(transiting_planet_pos['longitude'] - natal_planet_pos['longitude'])
                angle = angle if angle <= 180 else 360 - angle

                for aspect_angle, aspect_name in ASPECTS.items():
                    if abs(angle - aspect_angle) < ORB:
                        cautious_periods.append({
                            "date": current_date.strftime('%Y-%m-%d'),
                            "event": f"Transiting {transiting_planet_name} {aspect_name} Natal {natal_planet_name}",
                            "description": f"A period requiring caution. The energies of {transiting_planet_name} and {natal_planet_name} are in a challenging alignment, which can bring tests or pressures related to their domains."
                        })

    # Deduplicate and format
    unique_events = { (p['date'], p['event']): p for p in cautious_periods }
    return list(unique_events.values())