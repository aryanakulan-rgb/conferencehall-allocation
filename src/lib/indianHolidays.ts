// Indian National and Major Holidays
// This list includes major gazetted holidays that are observed across India

export interface Holiday {
  date: string; // MM-DD format
  name: string;
}

// Returns holidays for a given year
export function getIndianHolidays(year: number): Holiday[] {
  return [
    // Fixed Date Holidays
    { date: '01-26', name: 'Republic Day' },
    { date: '08-15', name: 'Independence Day' },
    { date: '10-02', name: 'Gandhi Jayanti' },
    { date: '01-01', name: "New Year's Day" },
    { date: '05-01', name: 'May Day' },
    { date: '12-25', name: 'Christmas' },
    
    // Major Hindu Holidays (approximate dates - may vary by year)
    { date: '01-14', name: 'Makar Sankranti' },
    { date: '01-15', name: 'Pongal' },
    { date: '03-08', name: 'Maha Shivaratri' },
    { date: '03-25', name: 'Holi' },
    { date: '04-06', name: 'Ugadi/Gudi Padwa' },
    { date: '04-14', name: 'Ambedkar Jayanti' },
    { date: '04-21', name: 'Ram Navami' },
    { date: '08-26', name: 'Janmashtami' },
    { date: '10-02', name: 'Dussehra' },
    { date: '10-20', name: 'Dussehra (Vijayadashami)' },
    { date: '11-01', name: 'Diwali' },
    { date: '11-15', name: 'Guru Nanak Jayanti' },
    
    // Major Muslim Holidays (approximate - dates vary each year based on lunar calendar)
    { date: '03-31', name: 'Eid ul-Fitr' },
    { date: '06-07', name: 'Eid ul-Adha' },
    { date: '07-17', name: 'Muharram' },
    { date: '09-16', name: 'Milad un-Nabi' },
    
    // Christian Holidays
    { date: '04-18', name: 'Good Friday' },
    { date: '04-20', name: 'Easter' },
    
    // Other Important Days
    { date: '10-31', name: 'Sardar Patel Jayanti' },
    { date: '11-14', name: "Children's Day" },
  ];
}

// Check if a date is a holiday
export function isHoliday(date: Date): boolean {
  const year = date.getFullYear();
  const holidays = getIndianHolidays(year);
  const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return holidays.some(h => h.date === dateStr);
}

// Get holiday name for a date
export function getHolidayName(date: Date): string | null {
  const year = date.getFullYear();
  const holidays = getIndianHolidays(year);
  const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const holiday = holidays.find(h => h.date === dateStr);
  return holiday ? holiday.name : null;
}

// Check if a date is a Sunday (weekly holiday)
export function isSunday(date: Date): boolean {
  return date.getDay() === 0;
}

// Check if a date is a second Saturday (often a holiday in government offices)
export function isSecondSaturday(date: Date): boolean {
  if (date.getDay() !== 6) return false; // Not a Saturday
  const dayOfMonth = date.getDate();
  return dayOfMonth >= 8 && dayOfMonth <= 14;
}

// Check if date is any type of holiday (national, Sunday, or 2nd Saturday)
export function isHolidayOrWeekend(date: Date): boolean {
  return isHoliday(date) || isSunday(date) || isSecondSaturday(date);
}
