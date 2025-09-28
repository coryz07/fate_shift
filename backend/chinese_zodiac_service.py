def get_chinese_zodiac(year):
    """Determines the Chinese Zodiac sign for a given year."""
    animals = [
        'Monkey', 'Rooster', 'Dog', 'Pig', 'Rat', 'Ox', 
        'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat'
    ]
    
    start_year = 1900  # Year of the Rat
    return animals[(year - start_year) % 12]