import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import swisseph as swe
from datetime import datetime

from astrology_service import get_julian_day, calculate_planets, calculate_forensic_astrology
from numerology_service import calculate_life_path_number
from chinese_zodiac_service import get_chinese_zodiac

# Set the path to the Swiss Ephemeris data files
ephe_path = os.path.join(os.path.dirname(__file__), 'ephe')
swe.set_ephe_path(ephe_path)

app = Flask(__name__)
CORS(app)

 @app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"})

 @app.route('/api/analysis', methods=['POST'])
def get_analysis():
    data = request.get_json()
    if not data or 'date' not in data:
        return jsonify({"error": "Missing birth date"}), 400

    try:
        # Date and Time
        birth_date_str = data['date']
        birth_time_str = data.get('time', '12:00') # Default to noon if no time is provided
        birth_datetime = datetime.strptime(f"{birth_date_str} {birth_time_str}", '%Y-%m-%d %H:%M')

        year = birth_datetime.year
        month = birth_datetime.month
        day = birth_datetime.day
        hour = birth_datetime.hour
        minute = birth_datetime.minute

        # Astrological Calculations
        jd = get_julian_day(year, month, day, hour, minute)
        planet_positions = calculate_planets(jd)

        # Numerology Calculation
        life_path_number = calculate_life_path_number(year, month, day)

        # Chinese Zodiac Calculation
        chinese_zodiac = get_chinese_zodiac(year)

        # Forensic Astrology Calculation
        forensic_analysis = calculate_forensic_astrology(jd)

        # Combine results
        analysis = {
            "astrology": planet_positions,
            "numerology": {
                "life_path_number": life_path_number
            },
            "chinese_zodiac": {
                "animal": chinese_zodiac
            },
            "forensic_astrology": forensic_analysis
        }

        return jsonify(analysis)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)