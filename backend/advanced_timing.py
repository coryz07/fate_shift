import math
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import swisseph as swe


class AdvancedTimingTechniques:
    """
    Advanced timing techniques for astrological analysis including
    Hellenistic, Vedic, Medieval, and modern methods
    """

    def __init__(self, natal_calculator):
        """Initialize with a base AstrologicalCalculator instance"""
        self.calc = natal_calculator
        self.natal_planets = self.calc.calculate_planets()
        self.natal_houses = self.calc.calculate_houses()

    # ============= HELLENISTIC TECHNIQUES =============

    def calculate_zodiacal_releasing(self, starting_lot='fortune', target_date=None):
        """
        Zodiacal Releasing from Lot of Fortune or Spirit
        Peak periods and loosening of bonds
        """
        # Calculate Lot of Fortune/Spirit
        lots = self.calc.calculate_arabic_parts()
        if starting_lot == 'fortune':
            starting_point = lots['part_of_fortune']
        else:  # Lot of Spirit
            starting_point = self._calculate_lot_of_spirit()

        # Period rulers in zodiacal order (in years)
        sign_periods = {
            'Aries': 15, 'Taurus': 8, 'Gemini': 20, 'Cancer': 25,
            'Leo': 19, 'Virgo': 20, 'Libra': 8, 'Scorpio': 15,
            'Sagittarius': 12, 'Capricorn': 27, 'Aquarius': 30, 'Pisces': 12
        }

        # Convert to 360-day years for calculation
        sign = self.calc.get_zodiac_sign(starting_point)

        if not target_date:
            target_date = datetime.now()
        else:
            target_date = datetime.strptime(target_date, "%Y-%m-%d")

        days_elapsed = (target_date - self.calc.birth_datetime).days

        # Calculate current period
        periods = []
        current_days = 0
        current_sign = sign
        level = 1

        while current_days < days_elapsed and level <= 4:
            period_years = sign_periods[current_sign]
            period_days = period_years * 360

            if level == 2:  # L2 periods are months not years
                period_days = period_years * 30
            elif level == 3:  # L3 periods are weeks
                period_days = period_years * 7
            elif level == 4:  # L4 periods are days
                period_days = period_years

            periods.append({
                'level': level,
                'sign': current_sign,
                'ruler': self._get_sign_ruler(current_sign),
                'start_days': current_days,
                'end_days': current_days + period_days,
                'peak': self._is_peak_period(current_sign),
                'loosening': self._check_loosening_bond(current_sign, level)
            })

            if current_days + period_days > days_elapsed:
                level += 1
                if level <= 4:
                    # Calculate sub-period starting sign
                    current_sign = self._get_next_zr_sign(current_sign)
            else:
                current_days += period_days
                current_sign = self._get_next_sign(current_sign)

        return periods

    def _calculate_lot_of_spirit(self):
        """Calculate Lot of Spirit (reverse of Fortune for day/night)"""
        planets = self.natal_planets
        houses = self.natal_houses

        is_day_birth = planets['sun']['longitude'] > houses['asc'] or \
                      planets['sun']['longitude'] < houses['asc'] - 180

        if is_day_birth:
            spirit = houses['asc'] + planets['sun']['longitude'] - \
                    planets['moon']['longitude']
        else:
            spirit = houses['asc'] + planets['moon']['longitude'] - \
                    planets['sun']['longitude']

        if spirit < 0:
            spirit += 360
        elif spirit > 360:
            spirit -= 360

        return spirit

    def _is_peak_period(self, sign):
        """Check if sign contains Fortune 10th or its ruler"""
        # Simplified - would need full implementation
        angular_signs = self._get_angular_signs_from_fortune()
        return sign in angular_signs

    def _check_loosening_bond(self, sign, level):
        """Check for loosening of bond (malefic handoff)"""
        ruler = self._get_sign_ruler(sign)
        return ruler in ['mars', 'saturn'] and level >= 2

    def calculate_annual_profections(self, current_age=None):
        """
        Annual profections - each year activates next house
        Returns activated house, sign, and time lord
        """
        if current_age is None:
            current_age = (datetime.now() - self.calc.birth_datetime).days / 365.25

        current_age = int(current_age)

        # Profected house (1st house = 0 years, 2nd = 1 year, etc.)
        profected_house = (current_age % 12) + 1

        # Get sign of profected house
        house_cusp = self.natal_houses['cusps'][profected_house - 1]
        profected_sign = self.calc.get_zodiac_sign(house_cusp)

        # Time lord is ruler of profected sign
        time_lord = self._get_sign_ruler(profected_sign)

        # Check condition of time lord in natal chart
        lord_data = self.natal_planets[time_lord]

        # Monthly profections
        current_month = datetime.now().month
        monthly_profection = ((profected_house - 1 + current_month - 1) % 12) + 1

        return {
            'year_age': current_age,
            'profected_house': profected_house,
            'profected_sign': profected_sign,
            'time_lord': time_lord,
            'lord_condition': {
                'sign': lord_data['sign'],
                'house': self._get_planet_house(time_lord),
                'retrograde': lord_data['retrograde'],
                'aspects': self._get_planet_aspects(time_lord)
            },
            'monthly_profection': monthly_profection,
            'activated_topics': self._get_house_topics(profected_house)
        }

    # ============= VEDIC TECHNIQUES =============

    def calculate_vimshottari_dasha(self, current_date=None):
        """
        Vimshottari Dasha - 120 year cycle based on Moon's nakshatra
        Most important Vedic timing system
        """
        if not current_date:
            current_date = datetime.now()
        else:
            current_date = datetime.strptime(current_date, "%Y-%m-%d")

        # Get Moon's position in sidereal zodiac
        moon_tropical = self.natal_planets['moon']['longitude']
        ayanamsa = 24.12  # Lahiri ayanamsa for 1988 (simplified)
        moon_sidereal = moon_tropical - ayanamsa
        if moon_sidereal < 0:
            moon_sidereal += 360

        # Calculate nakshatra (27 lunar mansions)
        nakshatra = int(moon_sidereal / 13.333333)
        nakshatra_degree = moon_sidereal % 13.333333

        # Mahadasha rulers and years
        dasha_sequence = [
            ('ketu', 7), ('venus', 20), ('sun', 6), ('moon', 10),
            ('mars', 7), ('rahu', 18), ('jupiter', 16), ('saturn', 19),
            ('mercury', 17)
        ]

        # Starting dasha based on nakshatra
        nakshatra_rulers = ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu',
                           'jupiter', 'saturn', 'mercury'] * 3
        starting_ruler = nakshatra_rulers[nakshatra]

        # Calculate elapsed portion of first dasha
        first_dasha_index = next(i for i, (ruler, _) in enumerate(dasha_sequence)
                                if ruler == starting_ruler)
        first_dasha_years = dasha_sequence[first_dasha_index][1]
        elapsed_portion = nakshatra_degree / 13.333333
        remaining_years = first_dasha_years * (1 - elapsed_portion)

        # Build dasha timeline
        dashas = []
        current_dasha_end = self.calc.birth_datetime + timedelta(days=remaining_years * 365.25)

        dashas.append({
            'mahadasha': starting_ruler,
            'start': self.calc.birth_datetime,
            'end': current_dasha_end,
            'years': remaining_years
        })

        # Add subsequent dashas
        dasha_index = (first_dasha_index + 1) % 9
        while current_dasha_end < current_date + timedelta(days=365*10):  # Next 10 years
            ruler, years = dasha_sequence[dasha_index]
            start = current_dasha_end
            end = start + timedelta(days=years * 365.25)
            dashas.append({
                'mahadasha': ruler,
                'start': start,
                'end': end,
                'years': years
            })
            current_dasha_end = end
            dasha_index = (dasha_index + 1) % 9

        # Find current dasha and calculate antardasha
        current_dasha = None
        for dasha in dashas:
            if dasha['start'] <= current_date < dasha['end']:
                current_dasha = dasha
                break

        # Calculate antardasha (sub-period)
        antardashas = self._calculate_antardasha(current_dasha, current_date)

        return {
            'current_mahadasha': current_dasha,
            'current_antardasha': antardashas['current'],
            'next_antardashas': antardashas['upcoming'],
            'all_dashas': dashas
        }

    def _calculate_antardasha(self, mahadasha, current_date):
        """Calculate sub-periods within mahadasha"""
        dasha_years = {
            'ketu': 7, 'venus': 20, 'sun': 6, 'moon': 10,
            'mars': 7, 'rahu': 18, 'jupiter': 16, 'saturn': 19, 'mercury': 17
        }

        # Antardasha sequence starts with mahadasha lord
        sequence = ['ketu', 'venus', 'sun', 'moon', 'mars',
                   'rahu', 'jupiter', 'saturn', 'mercury']
        start_index = sequence.index(mahadasha['mahadasha'])
        antardasha_sequence = sequence[start_index:] + sequence[:start_index]

        antardashas = []
        current_start = mahadasha['start']
        current_antardasha = None

        for planet in antardasha_sequence:
            # Proportional years: (planet years * mahadasha years) / 120
            years = (dasha_years[planet] * mahadasha['years']) / 120
            end = current_start + timedelta(days=years * 365.25)

            antardasha_data = {
                'planet': planet,
                'start': current_start,
                'end': end,
                'years': years
            }
            antardashas.append(antardasha_data)

            if current_start <= current_date < end:
                current_antardasha = antardasha_data

            current_start = end
            if current_start > mahadasha['end']:
                break

        upcoming = [a for a in antardashas if a['start'] > current_date][:3]

        return {
            'current': current_antardasha,
            'upcoming': upcoming
        }

    def calculate_chara_dasha(self):
        """Jaimini Chara Dasha - sign-based timing for Vedic"""
        # Complex calculation requiring specific Jaimini rules
        # Framework provided
        signs_strength = {}

        for i in range(12):
            sign_degree = i * 30
            sign = self.calc.get_zodiac_sign(sign_degree)

            # Calculate sign strength based on Jaimini rules
            strength = self._calculate_jaimini_strength(sign)
            signs_strength[sign] = strength

        return signs_strength

    # ============= MEDIEVAL/PERSIAN TECHNIQUES =============

    def calculate_firdaria(self, current_date=None):
        """
        Medieval/Persian time periods
        75-year cycle divided among planets
        """
        if not current_date:
            current_date = datetime.now()
        else:
            current_date = datetime.strptime(current_date, "%Y-%m-%d")

        # Day or night birth determines sequence
        is_day_birth = self.natal_planets['sun']['longitude'] > self.natal_houses['asc'] or \
                      self.natal_planets['sun']['longitude'] < self.natal_houses['asc'] - 180

        if is_day_birth:
            sequence = [
                ('sun', 10), ('venus', 8), ('mercury', 13), ('moon', 9),
                ('saturn', 11), ('jupiter', 12), ('mars', 7),
                ('north_node', 3), ('south_node', 2)
            ]
        else:
            sequence = [
                ('moon', 9), ('saturn', 11), ('jupiter', 12), ('mars', 7),
                ('sun', 10), ('venus', 8), ('mercury', 13),
                ('north_node', 3), ('south_node', 2)
            ]

        # Calculate current Firdaria
        days_elapsed = (current_date - self.calc.birth_datetime).days
        years_elapsed = days_elapsed / 365.25

        current_years = 0
        for planet, years in sequence:
            if current_years <= years_elapsed < current_years + years:
                current_firdaria = planet
                years_into_period = years_elapsed - current_years
                years_remaining = years - years_into_period

                # Calculate sub-period
                sub_period = self._calculate_firdaria_subperiod(
                    planet, years, years_into_period
                )

                return {
                    'major_period': planet,
                    'years_in': years_into_period,
                    'years_remaining': years_remaining,
                    'sub_period': sub_period,
                    'period_years': years,
                    'sequence': sequence
                }
            current_years += years

        return None

    def _calculate_firdaria_subperiod(self, major_planet, total_years, years_in):
        """Each Firdaria divided into 7 sub-periods"""
        planets = ['sun', 'venus', 'mercury', 'moon', 'saturn', 'jupiter', 'mars']

        # Start with major planet
        if major_planet in planets:
            planets.remove(major_planet)
            planets.insert(0, major_planet)

        sub_years = total_years / 7
        current_sub = int(years_in / sub_years)

        if current_sub < len(planets):
            return {
                'ruler': planets[current_sub],
                'years': sub_years,
                'position': current_sub + 1
            }
        return None

    # ============= MODERN/SYNCRETIC TECHNIQUES =============

    def calculate_planetary_returns(self, planet='saturn', years_ahead=5):
        """
        Calculate planetary returns (Saturn, Jupiter, etc.)
        Critical life timing markers
        """
        returns = []
        planet_data = self.natal_planets[planet]
        natal_position = planet_data['longitude']

        # Orbital periods in years
        orbital_periods = {
            'jupiter': 11.86, 'saturn': 29.46, 'uranus': 84.01,
            'neptune': 164.79, 'pluto': 247.92, 'mars': 1.88,
            'venus': 0.615, 'mercury': 0.24
        }

        if planet not in orbital_periods:
            return None

        period = orbital_periods[planet]
        current_date = datetime.now()

        for i in range(1, int(years_ahead / period) + 2):
            return_date = self.calc.birth_datetime + timedelta(days=period * i * 365.25)

            if return_date > current_date and return_date < current_date + timedelta(days=years_ahead * 365):
                returns.append({
                    'planet': planet,
                    'return_number': i,
                    'approximate_date': return_date,
                    'age': period * i
                })

        return returns

    def calculate_eclipse_sensitivity(self, years_range=2):
        """
        Find eclipses hitting sensitive natal points
        Major life event triggers
        """
        sensitive_points = []

        # Get natal positions to check
        check_points = {
            'sun': self.natal_planets['sun']['longitude'],
            'moon': self.natal_planets['moon']['longitude'],
            'asc': self.natal_houses['asc'],
            'mc': self.natal_houses['mc']
        }

        # Get nodes for eclipse path
        north_node = self.natal_planets['north_node']['longitude']

        # Check eclipse dates (simplified - would need ephemeris)
        current_date = datetime.now()

        for days in range(0, years_range * 365, 173):  # ~6 months between eclipse seasons
            check_date = current_date + timedelta(days=days)
            jd = swe.julday(check_date.year, check_date.month, check_date.day)

            # Check for eclipse (simplified)
            try:
                sun_pos, _ = swe.calc_ut(jd, swe.SUN, swe.FLG_SWIEPH)
                moon_pos, _ = swe.calc_ut(jd, swe.MOON, swe.FLG_SWIEPH)
                node_pos, _ = swe.calc_ut(jd, swe.TRUE_NODE, swe.FLG_SWIEPH)
            except:
                sun_pos, _ = swe.calc_ut(jd, swe.SUN, swe.FLG_MOSEPH)
                moon_pos, _ = swe.calc_ut(jd, swe.MOON, swe.FLG_MOSEPH)
                node_pos, _ = swe.calc_ut(jd, swe.TRUE_NODE, swe.FLG_MOSEPH)

            # If Sun/Moon near nodes = eclipse
            if abs(sun_pos[0] - node_pos[0]) < 18:  # Eclipse zone
                eclipse_degree = sun_pos[0]

                # Check if hits natal points
                for point_name, natal_degree in check_points.items():
                    if abs(eclipse_degree - natal_degree) < 5:  # 5° orb
                        sensitive_points.append({
                            'date': check_date,
                            'eclipse_degree': eclipse_degree,
                            'natal_point': point_name,
                            'natal_degree': natal_degree,
                            'orb': abs(eclipse_degree - natal_degree)
                        })

        return sensitive_points

    def calculate_progressed_angles(self, target_date=None):
        """
        Secondary progressed angles to natal/transiting planets
        Internal psychological timing
        """
        if not target_date:
            target_date = datetime.now()
        else:
            target_date = datetime.strptime(target_date, "%Y-%m-%d")

        # Get progressions
        progressed = self.calc.calculate_progressions(target_date.strftime("%Y-%m-%d"))

        # Find exact aspects forming
        forming_aspects = []

        for prog_planet, prog_data in progressed.items():
            prog_longitude = prog_data['longitude']

            # Check aspects to natal positions
            for natal_planet, natal_data in self.natal_planets.items():
                natal_longitude = natal_data['longitude']

                # Calculate aspect
                diff = abs(prog_longitude - natal_longitude)
                if diff > 180:
                    diff = 360 - diff

                aspects = {0: 'conjunction', 60: 'sextile', 90: 'square',
                          120: 'trine', 180: 'opposition'}

                for angle, name in aspects.items():
                    if abs(diff - angle) < 1:  # 1° orb for progressions
                        forming_aspects.append({
                            'progressed': prog_planet,
                            'natal': natal_planet,
                            'aspect': name,
                            'exact_orb': abs(diff - angle),
                            'applying': self._is_aspect_applying(prog_data, natal_data, angle)
                        })

        return forming_aspects

    # ============= UTILITY FUNCTIONS =============

    def _get_sign_ruler(self, sign):
        """Traditional sign rulerships"""
        rulers = {
            'Aries': 'mars', 'Taurus': 'venus', 'Gemini': 'mercury',
            'Cancer': 'moon', 'Leo': 'sun', 'Virgo': 'mercury',
            'Libra': 'venus', 'Scorpio': 'mars', 'Sagittarius': 'jupiter',
            'Capricorn': 'saturn', 'Aquarius': 'saturn', 'Pisces': 'jupiter'
        }
        return rulers.get(sign, None)

    def _get_planet_house(self, planet):
        """Determine which house a planet occupies"""
        planet_lon = self.natal_planets[planet]['longitude']
        houses = self.natal_houses['cusps']

        for i in range(12):
            house_start = houses[i]
            house_end = houses[(i + 1) % 12]

            if house_end < house_start:  # Crosses 0° Aries
                if planet_lon >= house_start or planet_lon < house_end:
                    return i + 1
            else:
                if house_start <= planet_lon < house_end:
                    return i + 1

        return 1  # Default to 1st house

    def _get_planet_aspects(self, planet):
        """Get all aspects for a specific planet"""
        aspects = self.calc.calculate_aspects(self.natal_planets)
        return [a for a in aspects if a['planet1'] == planet or a['planet2'] == planet]

    def _get_house_topics(self, house_num):
        """Traditional house significations"""
        topics = {
            1: ['self', 'body', 'appearance', 'vitality'],
            2: ['money', 'possessions', 'resources', 'values'],
            3: ['communication', 'siblings', 'short trips', 'learning'],
            4: ['home', 'family', 'roots', 'foundation'],
            5: ['creativity', 'children', 'pleasure', 'romance'],
            6: ['health', 'work', 'service', 'routine'],
            7: ['partnerships', 'marriage', 'others', 'contracts'],
            8: ['transformation', 'shared resources', 'crisis', 'death'],
            9: ['philosophy', 'travel', 'higher learning', 'beliefs'],
            10: ['career', 'reputation', 'status', 'authority'],
            11: ['friends', 'groups', 'hopes', 'wishes'],
            12: ['isolation', 'spirituality', 'hidden things', 'endings']
        }
        return topics.get(house_num, [])

    def _get_angular_signs_from_fortune(self):
        """Get angular signs from Lot of Fortune for ZR peaks"""
        fortune = self.calc.calculate_arabic_parts()['part_of_fortune']
        fortune_sign = self.calc.get_zodiac_sign(fortune)

        # Angular = 1st, 4th, 7th, 10th from Fortune
        signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']

        fortune_index = signs.index(fortune_sign)
        angular_indices = [fortune_index, (fortune_index + 3) % 12,
                          (fortune_index + 6) % 12, (fortune_index + 9) % 12]

        return [signs[i] for i in angular_indices]

    def _get_next_sign(self, current_sign):
        """Get next sign in zodiacal order"""
        signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
        current_index = signs.index(current_sign)
        return signs[(current_index + 1) % 12]

    def _get_next_zr_sign(self, current_sign):
        """Get next sign for ZR sub-periods (cadent house)"""
        signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
        current_index = signs.index(current_sign)
        # Cadent = 11 signs forward
        return signs[(current_index + 11) % 12]

    def _calculate_jaimini_strength(self, sign):
        """Calculate sign strength for Jaimini techniques"""
        # Simplified - full Jaimini requires complex rules
        strength = 0

        # Check for planets in sign
        for planet, data in self.natal_planets.items():
            if data['sign'] == sign:
                if planet in ['jupiter', 'mercury']:
                    strength += 2
                elif planet in ['sun', 'venus']:
                    strength += 1
                elif planet in ['mars', 'saturn']:
                    strength -= 1

        return strength

    def _is_aspect_applying(self, prog_data, natal_data, target_angle):
        """Check if progressed aspect is applying or separating"""
        # Simplified - would need to calculate future positions
        return True  # Placeholder

    def composite_timing_analysis(self, date_range_start, date_range_end):
        """
        Combine multiple timing techniques for comprehensive analysis
        Weight different factors for pattern recognition
        """
        start = datetime.strptime(date_range_start, "%Y-%m-%d")
        end = datetime.strptime(date_range_end, "%Y-%m-%d")

        analysis = []

        current = start
        while current <= end:
            date_str = current.strftime("%Y-%m-%d")

            # Collect all timing factors
            factors = {
                'date': date_str,
                'transits': len(self.calc.calculate_transits(date_str)),
                'profection_activated': self.calculate_annual_profections(),
                'progressions': len(self.calculate_progressed_angles(date_str)),
                'dasha': self.calculate_vimshottari_dasha(date_str)['current_mahadasha']['mahadasha'],
                'firdaria': self.calculate_firdaria(date_str)['major_period'] if self.calculate_firdaria(date_str) else None
            }

            # Calculate composite score
            score = 0

            # Weight hard transits heavily
            hard_transits = [t for t in self.calc.calculate_transits(date_str)
                            if t['aspect'] in ['square', 'opposition']]
            score += len(hard_transits) * 3

            # Add malefic time lords
            if factors['dasha'] in ['mars', 'saturn', 'rahu', 'ketu']:
                score += 5

            if factors['firdaria'] in ['mars', 'saturn', 'south_node']:
                score += 4

            # Check for eclipse proximity
            eclipses = self.calculate_eclipse_sensitivity()
            for eclipse in eclipses:
                if abs((eclipse['date'] - current).days) < 30:
                    score += 10

            factors['intensity_score'] = score
            analysis.append(factors)

            current += timedelta(days=1)

        # Sort by intensity score
        analysis.sort(key=lambda x: x['intensity_score'], reverse=True)

        return {
            'peak_intensity_dates': analysis[:10],  # Top 10 most intense
            'full_analysis': analysis
        }