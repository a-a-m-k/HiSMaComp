export const YEARS = [800, 1000, 1200, 1300, 1400, 1500, 1600, 1750] as const;

export const CENTURY_MAP: Record<(typeof YEARS)[number], number> = {
  800: 9, // Year 800 is 9th century (801-900)
  1000: 11, // Year 1000 is 11th century (1001-1100)
  1200: 13, // Year 1200 is 13th century (1201-1300)
  1300: 14, // Year 1300 is 14th century (1301-1400)
  1400: 15, // Year 1400 is 15th century (1401-1500)
  1500: 16, // Year 1500 is 16th century (1501-1600)
  1600: 17, // Year 1600 is 17th century (1601-1700)
  1750: 18, // Year 1750 is 18th century (1701-1800)
};

export const MAX_CACHE_SIZE = 50;
