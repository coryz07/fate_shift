import math
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import swisseph as swe


class AstrologicalCalculator:
    """
    Complete astrological calculation framework for natal charts,
    transits, progressions, and multiple astrological systems
    """

    def __init__(self, birth_date: str, birth_time: str, lat: float, lon: float, timezone_offset: int = -5):
        """
        Initialize with birth data
        birth_date: 'YYYY-MM-DD'
        birth_time: 'HH:MM:SS'
        lat, lon: decimal degrees (Sewickley, PA: 40.5387, -80.1844)
        timezone_offset: hours from UTC (EST = -5, EDT = -4)
        """
        self.birth_datetime = datetime.strptime(f"{birth_date} {birth_time}",
                                                "%Y-%m-%d %H:%M:%S")
        self.lat = lat
        self.lon = lon
        self.tz_offset = timezone_offset
        self.julian_day = self.calculate_julian_day()

        # Initialize Swiss Ephemeris
        # Use built-in ephemeris for basic calculations
        swe.set_ephe_path('')  # Use built-in ephemeris

    def calculate_julian_day(self) -> float:
        """Convert datetime to Julian Day for astronomical calculations"""
        dt = self.birth_datetime + timedelta(hours=-self.tz_offset)
        return swe.julday(dt.year, dt.month, dt.day,
                         dt.hour + dt.minute/60 + dt.second/3600)

    def calculate_houses(self, system: str = 'P') -> Dict[str, Any]:
        """
        Calculate house cusps
        Systems: P=Placidus, K=Koch, R=Regiomontanus, C=Campanus
        """
        houses, ascmc = swe.houses(self.julian_day, self.lat, self.lon,
                                   bytes(system, 'utf-8'))
        return {
            'cusps': houses,  # 12 house cusps
            'asc': ascmc[0],   # Ascendant
            'mc': ascmc[1],    # Midheaven
            'armc': ascmc[2],  # ARMC
            'vertex': ascmc[3] # Vertex
        }

    def calculate_planets(self) -> Dict[str, Dict[str, Any]]:
        """Calculate positions of all planets"""
        planets = {
            'sun': swe.SUN,
            'moon': swe.MOON,
            'mercury': swe.MERCURY,
            'venus': swe.VENUS,
            'mars': swe.MARS,
            'jupiter': swe.JUPITER,
            'saturn': swe.SATURN,
            'uranus': swe.URANUS,
            'neptune': swe.NEPTUNE,
            'pluto': swe.PLUTO,
            'north_node': swe.TRUE_NODE,
            'chiron': swe.CHIRON
        }

        positions = {}
        for name, planet_id in planets.items():
            try:
                # Try Swiss Ephemeris with built-in data first
                pos, ret = swe.calc_ut(self.julian_day, planet_id, swe.FLG_SWIEPH)
            except:
                # Fallback to Moshier ephemeris (built-in)
                pos, ret = swe.calc_ut(self.julian_day, planet_id, swe.FLG_MOSEPH)

            positions[name] = {
                'longitude': pos[0],  # Zodiacal longitude
                'latitude': pos[1],   # Zodiacal latitude
                'distance': pos[2],   # Distance in AU
                'speed': pos[3],      # Daily motion
                'sign': self.get_zodiac_sign(pos[0]),
                'degree': pos[0] % 30,
                'retrograde': pos[3] < 0
            }
        return positions

    def get_zodiac_sign(self, longitude: float) -> str:
        """Convert longitude to zodiac sign"""
        signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
        return signs[int(longitude / 30)]

    def calculate_aspects(self, positions: Dict[str, Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Calculate major aspects between planets"""
        aspects = {
            'conjunction': (0, 8),
            'sextile': (60, 6),
            'square': (90, 8),
            'trine': (120, 8),
            'opposition': (180, 8),
            'quincunx': (150, 3)
        }

        found_aspects = []
        planets = list(positions.keys())

        for i in range(len(planets)):
            for j in range(i+1, len(planets)):
                p1_lon = positions[planets[i]]['longitude']
                p2_lon = positions[planets[j]]['longitude']

                diff = abs(p1_lon - p2_lon)
                if diff > 180:
                    diff = 360 - diff

                for aspect_name, (angle, orb) in aspects.items():
                    if abs(diff - angle) <= orb:
                        found_aspects.append({
                            'planet1': planets[i],
                            'planet2': planets[j],
                            'aspect': aspect_name,
                            'angle': diff,
                            'orb': abs(diff - angle)
                        })

        return found_aspects

    def calculate_transits(self, target_date: str) -> List[Dict[str, Any]]:
        """Calculate current planetary transits to natal positions"""
        target_dt = datetime.strptime(target_date, "%Y-%m-%d")
        target_jd = swe.julday(target_dt.year, target_dt.month, target_dt.day, 12)

        natal_positions = self.calculate_planets()

        # Calculate current positions
        current_positions = {}
        planet_ids = {'sun': swe.SUN, 'moon': swe.MOON, 'mercury': swe.MERCURY,
                     'venus': swe.VENUS, 'mars': swe.MARS, 'jupiter': swe.JUPITER,
                     'saturn': swe.SATURN, 'uranus': swe.URANUS,
                     'neptune': swe.NEPTUNE, 'pluto': swe.PLUTO}

        for name, planet_id in planet_ids.items():
            try:
                pos, ret = swe.calc_ut(target_jd, planet_id, swe.FLG_SWIEPH)
            except:
                pos, ret = swe.calc_ut(target_jd, planet_id, swe.FLG_MOSEPH)
            current_positions[name] = pos[0]

        # Find aspects between transiting and natal planets
        transits = []
        aspect_orbs = {'conjunction': 8, 'opposition': 8, 'square': 8,
                      'trine': 8, 'sextile': 6}

        for transit_planet, transit_pos in current_positions.items():
            for natal_planet, natal_data in natal_positions.items():
                natal_pos = natal_data['longitude']
                diff = abs(transit_pos - natal_pos)
                if diff > 180:
                    diff = 360 - diff

                for aspect, orb in aspect_orbs.items():
                    aspect_angle = {'conjunction': 0, 'opposition': 180,
                                  'square': 90, 'trine': 120, 'sextile': 60}[aspect]

                    if abs(diff - aspect_angle) <= orb:
                        transits.append({
                            'transiting': transit_planet,
                            'natal': natal_planet,
                            'aspect': aspect,
                            'orb': abs(diff - aspect_angle),
                            'date': target_date
                        })

        return transits

    def calculate_progressions(self, target_date: str) -> Dict[str, Dict[str, Any]]:
        """Secondary progressions (day-for-year)"""
        target_dt = datetime.strptime(target_date, "%Y-%m-%d")
        years_elapsed = (target_dt - self.birth_datetime).days / 365.25

        # Progress the chart by days equal to years
        progressed_dt = self.birth_datetime + timedelta(days=years_elapsed)
        prog_jd = swe.julday(progressed_dt.year, progressed_dt.month,
                             progressed_dt.day, progressed_dt.hour +
                             progressed_dt.minute/60)

        # Calculate progressed positions
        progressed = {}
        planets = {'sun': swe.SUN, 'moon': swe.MOON, 'mercury': swe.MERCURY,
                  'venus': swe.VENUS, 'mars': swe.MARS}

        for name, planet_id in planets.items():
            try:
                pos, ret = swe.calc_ut(prog_jd, planet_id, swe.FLG_SWIEPH)
            except:
                pos, ret = swe.calc_ut(prog_jd, planet_id, swe.FLG_MOSEPH)
            progressed[name] = {
                'longitude': pos[0],
                'sign': self.get_zodiac_sign(pos[0]),
                'degree': pos[0] % 30
            }

        return progressed

    def calculate_solar_return(self, year: int) -> Dict[str, Any]:
        """Calculate solar return chart for given year"""
        # Find exact moment sun returns to natal position
        natal_sun = self.calculate_planets()['sun']['longitude']

        # Start from birthday in target year
        sr_date = self.birth_datetime.replace(year=year)
        sr_jd = swe.julday(sr_date.year, sr_date.month, sr_date.day, 12)

        # Find exact return moment (simplified)
        for i in range(5):  # Iterate to find exact moment
            try:
                sun_pos, _ = swe.calc_ut(sr_jd, swe.SUN, swe.FLG_SWIEPH)
            except:
                sun_pos, _ = swe.calc_ut(sr_jd, swe.SUN, swe.FLG_MOSEPH)
            diff = sun_pos[0] - natal_sun
            if abs(diff) < 0.001:
                break
            sr_jd += diff / 360  # Adjust by fraction of day

        return {
            'julian_day': sr_jd,
            'sun_position': natal_sun,
            'year': year
        }

    def calculate_bazi_pillars(self) -> Dict[str, str]:
        """
        Calculate Chinese Four Pillars (BaZi)
        Simplified version - full implementation requires Chinese calendar
        """
        # This is a simplified framework
        # Full BaZi requires complex Chinese calendar conversions

        stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
        branches = ['子', '丑', '寅', '卯', '辰', '巳',
                   '午', '未', '申', '酉', '戌', '亥']

        # Simplified calculation (proper BaZi needs lunar calendar)
        year = self.birth_datetime.year
        month = self.birth_datetime.month
        day = self.birth_datetime.day
        hour = self.birth_datetime.hour

        year_stem = (year - 4) % 10
        year_branch = (year - 4) % 12

        return {
            'year_pillar': f"{stems[year_stem]}{branches[year_branch]}",
            'month_pillar': "Requires lunar calendar conversion",
            'day_pillar': "Requires 60-day cycle calculation",
            'hour_pillar': f"Based on {hour}:00"
        }

    def critical_degree_analysis(self) -> List[Dict[str, Any]]:
        """Identify planets at critical degrees"""
        critical_degrees = {
            'cardinal': [0, 13, 26],  # Aries, Cancer, Libra, Capricorn
            'fixed': [8, 9, 21, 22],   # Taurus, Leo, Scorpio, Aquarius
            'mutable': [4, 17]         # Gemini, Virgo, Sagittarius, Pisces
        }

        planets = self.calculate_planets()
        critical_planets = []

        for planet, data in planets.items():
            degree_in_sign = data['degree']
            sign = data['sign']

            # Determine modality
            if sign in ['Aries', 'Cancer', 'Libra', 'Capricorn']:
                modality = 'cardinal'
            elif sign in ['Taurus', 'Leo', 'Scorpio', 'Aquarius']:
                modality = 'fixed'
            else:
                modality = 'mutable'

            for crit_deg in critical_degrees[modality]:
                if abs(degree_in_sign - crit_deg) < 1:
                    critical_planets.append({
                        'planet': planet,
                        'degree': degree_in_sign,
                        'sign': sign,
                        'critical_degree': crit_deg
                    })

        return critical_planets

    def calculate_arabic_parts(self) -> Dict[str, Any]:
        """Calculate Arabic Parts/Lots"""
        houses = self.calculate_houses()
        planets = self.calculate_planets()

        # Part of Fortune = ASC + Moon - Sun (day birth)
        # Part of Fortune = ASC + Sun - Moon (night birth)
        is_day_birth = planets['sun']['longitude'] > houses['asc'] or \
                      planets['sun']['longitude'] < houses['asc'] - 180

        if is_day_birth:
            pof = houses['asc'] + planets['moon']['longitude'] - \
                  planets['sun']['longitude']
        else:
            pof = houses['asc'] + planets['sun']['longitude'] - \
                  planets['moon']['longitude']

        if pof < 0:
            pof += 360
        elif pof > 360:
            pof -= 360

        return {
            'part_of_fortune': pof,
            'sign': self.get_zodiac_sign(pof),
            'degree': pof % 30
        }

    def calculate_zodiacal_releasing(self, target_date: str) -> Dict[str, Any]:
        """
        Hellenistic timing periods from Lot of Fortune/Spirit
        """
        planets = self.calculate_planets()
        houses = self.calculate_houses()
        arabic_parts = self.calculate_arabic_parts()

        target_dt = datetime.strptime(target_date, "%Y-%m-%d")
        years_elapsed = (target_dt - self.birth_datetime).days / 365.25

        # Planetary periods in order (simplified ZR)
        zr_periods = [
            ('sun', 19), ('moon', 25), ('mercury', 20), ('venus', 8),
            ('mars', 15), ('jupiter', 12), ('saturn', 27)
        ]

        # Start from Lot of Fortune ruler
        lot_fortune_sign = self.get_zodiac_sign(arabic_parts['part_of_fortune'])

        # Simplified period calculation
        current_period_index = int(years_elapsed / 7) % len(zr_periods)
        current_planet, period_length = zr_periods[current_period_index]

        return {
            'current_period': current_planet,
            'period_length': period_length,
            'years_into_period': years_elapsed % period_length,
            'lot_fortune_sign': lot_fortune_sign,
            'target_date': target_date
        }

    def calculate_annual_profections(self, current_age: int) -> Dict[str, Any]:
        """
        12-year house activation cycle
        """
        houses = self.calculate_houses()
        planets = self.calculate_planets()

        # Calculate which house is activated
        profected_house = (current_age % 12) + 1

        # Find house ruler (simplified - using sign on cusp)
        house_cusp = houses['cusps'][profected_house - 1]
        house_sign = self.get_zodiac_sign(house_cusp)

        # Traditional rulerships
        rulers = {
            'Aries': 'mars', 'Taurus': 'venus', 'Gemini': 'mercury',
            'Cancer': 'moon', 'Leo': 'sun', 'Virgo': 'mercury',
            'Libra': 'venus', 'Scorpio': 'mars', 'Sagittarius': 'jupiter',
            'Capricorn': 'saturn', 'Aquarius': 'saturn', 'Pisces': 'jupiter'
        }

        house_ruler = rulers.get(house_sign, 'sun')

        return {
            'profected_house': profected_house,
            'house_sign': house_sign,
            'house_ruler': house_ruler,
            'ruler_position': planets.get(house_ruler, {}),
            'current_age': current_age
        }

    def calculate_planetary_periods(self) -> Dict[str, Any]:
        """
        Vimshottari Dasha periods (simplified)
        """
        planets = self.calculate_planets()
        moon_pos = planets['moon']['longitude']

        # Nakshatra calculation (simplified - 27 nakshatras)
        nakshatra_num = int(moon_pos / 13.333333)  # 360/27

        # Vimshottari sequence
        dasha_sequence = [
            ('ketu', 7), ('venus', 20), ('sun', 6), ('moon', 10),
            ('mars', 7), ('rahu', 18), ('jupiter', 16), ('saturn', 19),
            ('mercury', 17)
        ]

        birth_ruler_index = nakshatra_num % len(dasha_sequence)
        birth_ruler, period_length = dasha_sequence[birth_ruler_index]

        return {
            'birth_nakshatra': nakshatra_num + 1,
            'birth_dasha_lord': birth_ruler,
            'dasha_period_years': period_length,
            'moon_position': moon_pos,
            'dasha_sequence': dasha_sequence
        }

    def analyze_stress_indicators(self, date_range: List[str]) -> Dict[str, Any]:
        """
        Analyze stress indicators over a date range
        Combines multiple astrological factors with weighted scoring
        """
        stress_analysis = {
            'overall_stress_score': 0,
            'peak_stress_dates': [],
            'stress_factors': [],
            'recommendations': []
        }

        natal_planets = self.calculate_planets()

        for date in date_range:
            daily_stress = 0
            factors_today = []

            # Calculate transits for this date
            transits = self.calculate_transits(date)

            # Weight different stress factors
            for transit in transits:
                weight = 0
                factor_desc = f"{transit['transiting']} {transit['aspect']} natal {transit['natal']}"

                # Hard aspects from malefics get higher weight
                if transit['transiting'] in ['mars', 'saturn', 'pluto']:
                    if transit['aspect'] in ['square', 'opposition']:
                        weight = 8
                        factor_desc += " (Major stress aspect)"
                    elif transit['aspect'] == 'conjunction':
                        weight = 6
                        factor_desc += " (Intense conjunction)"

                # Benefic aspects reduce stress
                elif transit['transiting'] in ['venus', 'jupiter']:
                    if transit['aspect'] in ['trine', 'sextile']:
                        weight = -2
                        factor_desc += " (Supportive aspect)"

                if weight != 0:
                    daily_stress += weight
                    factors_today.append({
                        'factor': factor_desc,
                        'weight': weight,
                        'orb': transit['orb']
                    })

            # Check for critical degrees
            critical_planets = self.critical_degree_analysis()
            if critical_planets:
                daily_stress += len(critical_planets) * 2
                factors_today.append({
                    'factor': f"{len(critical_planets)} planets at critical degrees",
                    'weight': len(critical_planets) * 2,
                    'orb': 0
                })

            if daily_stress > 10:  # Threshold for peak stress
                stress_analysis['peak_stress_dates'].append({
                    'date': date,
                    'stress_score': daily_stress,
                    'factors': factors_today
                })

            stress_analysis['overall_stress_score'] += daily_stress

        # Generate recommendations based on stress level
        avg_stress = stress_analysis['overall_stress_score'] / len(date_range)

        if avg_stress > 15:
            stress_analysis['recommendations'].extend([
                "This appears as a significant life transition period requiring heightened awareness",
                "Consider meditation and grounding practices during high-stress transits",
                "Avoid major decisions during peak stress periods"
            ])
        elif avg_stress > 8:
            stress_analysis['recommendations'].extend([
                "Moderate stress period - practice patience and self-care",
                "Good time for spiritual practices and reflection"
            ])
        else:
            stress_analysis['recommendations'].append(
                "Relatively stable period - good for planning and growth"
            )

        return stress_analysis

    def forensic_timing_analysis(self, target_date: str) -> Dict[str, Any]:
        """
        Dr. Celestine Starweaver's forensic timing analysis
        Combines multiple timing systems for critical period identification
        """
        target_dt = datetime.strptime(target_date, "%Y-%m-%d")
        current_age = (target_dt - self.birth_datetime).days / 365.25

        # Get all timing systems
        transits = self.calculate_transits(target_date)
        progressions = self.calculate_progressions(target_date)
        profections = self.calculate_annual_profections(int(current_age))
        zr = self.calculate_zodiacal_releasing(target_date)
        critical_degrees = self.critical_degree_analysis()

        # Identify converging factors
        convergence_score = 0
        convergence_factors = []

        # Check for hard transits to natal angles
        natal_houses = self.calculate_houses()
        for transit in transits:
            if transit['natal'] in ['asc', 'mc'] and transit['aspect'] in ['conjunction', 'square', 'opposition']:
                convergence_score += 5
                convergence_factors.append(f"Transiting {transit['transiting']} {transit['aspect']} natal angles")

        # Check for progressed planets at critical degrees
        for planet, data in progressions.items():
            if abs(data['degree'] - 0) < 1 or abs(data['degree'] - 29) < 1:
                convergence_score += 3
                convergence_factors.append(f"Progressed {planet} at critical degree in {data['sign']}")

        # Saturn returns and major planetary cycles
        saturn_cycle_years = [29, 58, 87]  # Approximate Saturn returns
        for cycle_year in saturn_cycle_years:
            if abs(current_age - cycle_year) < 1:
                convergence_score += 8
                convergence_factors.append(f"Saturn {cycle_year}-year cycle activation")

        # Technical assessment
        technical_analysis = ""
        if convergence_score >= 15:
            technical_analysis = f"Your progressed chart shows critical convergence patterns with transiting malefics forming hard aspects to natal angles. This convergence with {profections['house_ruler']} period rulership suggests a period of major life transformation requiring heightened awareness."
        elif convergence_score >= 8:
            technical_analysis = f"Multiple timing indicators suggest a significant transition period. The {profections['profected_house']} house profection combined with current transits indicates important developments."
        else:
            technical_analysis = f"Chart shows stable progressions with the {profections['profected_house']} house activated through annual profections. Standard monitoring protocols apply."

        return {
            'convergence_score': convergence_score,
            'convergence_factors': convergence_factors,
            'technical_analysis': technical_analysis,
            'profection_data': profections,
            'zodiacal_releasing': zr,
            'critical_transits': [t for t in transits if t['transiting'] in ['saturn', 'uranus', 'pluto']],
            'current_age': current_age,
            'target_date': target_date
        }

    def generate_full_natal_chart(self) -> Dict[str, Any]:
        """Generate complete natal chart analysis"""
        planets = self.calculate_planets()
        houses = self.calculate_houses()
        aspects = self.calculate_aspects(planets)
        critical = self.critical_degree_analysis()
        arabic_parts = self.calculate_arabic_parts()

        return {
            'planets': planets,
            'houses': houses,
            'aspects': aspects,
            'critical_degrees': critical,
            'arabic_parts': arabic_parts,
            'birth_info': {
                'date': self.birth_datetime.strftime('%Y-%m-%d'),
                'time': self.birth_datetime.strftime('%H:%M:%S'),
                'lat': self.lat,
                'lon': self.lon,
                'timezone_offset': self.tz_offset
            }
        }