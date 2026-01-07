// Kerala Government Holidays
// Based on official Kerala Government notification for 2026

export interface Holiday {
  date: string; // MM-DD format
  name: string;
}

// Kerala Government holidays for 2026
export function getKeralaHolidays(year: number): Holiday[] {
  // Note: Some dates vary by year based on lunar calendar
  // This list is based on Kerala Government notification for 2026
  if (year === 2026) {
    return [
      { date: '01-02', name: 'Mannam Jayanti' },
      { date: '01-26', name: 'Republic Day' },
      { date: '02-15', name: 'Sivarathri' },
      { date: '03-04', name: 'Holi' },
      { date: '03-20', name: 'Eid ul-Fitr (Ramzan)' },
      { date: '04-02', name: 'Maundy Thursday (Pesaha Vyazham)' },
      { date: '04-03', name: 'Good Friday' },
      { date: '04-05', name: 'Easter Sunday' },
      { date: '04-14', name: 'Dr. B.R. Ambedkar Jayanti' },
      { date: '04-15', name: 'Vishu' },
      { date: '05-01', name: 'May Day' },
      { date: '05-27', name: 'Bakrid (Eid ul-Adha)' },
      { date: '06-25', name: 'Muharram' },
      { date: '08-12', name: 'Karkidaka Vavu Bali' },
      { date: '08-15', name: 'Independence Day' },
      { date: '08-25', name: 'First Onam / Milad-i-Sherif' },
      { date: '08-26', name: 'Thiruvonam' },
      { date: '08-27', name: 'Third Onam' },
      { date: '08-28', name: 'Fourth Onam / Ayyankali Jayanti / Sree Narayana Guru Jayanthi' },
      { date: '09-04', name: 'Janmashtami' },
      { date: '09-21', name: 'Sree Narayana Guru Samadhi Day' },
      { date: '10-02', name: 'Gandhi Jayanti' },
      { date: '10-20', name: 'Mahanavami' },
      { date: '10-21', name: 'Vijayadashami (Dussehra)' },
      { date: '11-08', name: 'Deepavali' },
      { date: '12-25', name: 'Christmas' },
    ];
  }
  
  // Fallback for other years with common Kerala holidays
  return [
    { date: '01-02', name: 'Mannam Jayanti' },
    { date: '01-26', name: 'Republic Day' },
    { date: '04-14', name: 'Dr. B.R. Ambedkar Jayanti' },
    { date: '04-15', name: 'Vishu' },
    { date: '05-01', name: 'May Day' },
    { date: '08-15', name: 'Independence Day' },
    { date: '10-02', name: 'Gandhi Jayanti' },
    { date: '12-25', name: 'Christmas' },
  ];
}

// Alias for backward compatibility
export function getIndianHolidays(year: number): Holiday[] {
  return getKeralaHolidays(year);
}

// Check if a date is a holiday
export function isHoliday(date: Date): boolean {
  const year = date.getFullYear();
  const holidays = getKeralaHolidays(year);
  const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return holidays.some(h => h.date === dateStr);
}

// Get holiday name for a date
export function getHolidayName(date: Date): string | null {
  const year = date.getFullYear();
  const holidays = getKeralaHolidays(year);
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
