def reduce_number(n):
    """Reduces a number to a single digit, unless it is a master number (11, 22, 33)."""
    if n in [11, 22, 33]:
        return n
    
    while n > 9:
        n = sum(int(digit) for digit in str(n))
        if n in [11, 22, 33]:
            return n
            
    return n

def calculate_life_path_number(year, month, day):
    """Calculates the Life Path Number from a birth date."""
    year_reduced = reduce_number(year)
    month_reduced = reduce_number(month)
    day_reduced = reduce_number(day)
    
    life_path_sum = year_reduced + month_reduced + day_reduced
    
    return reduce_number(life_path_sum)