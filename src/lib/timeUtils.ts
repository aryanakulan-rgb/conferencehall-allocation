// Time slots in 24-hour format (used as values)
export const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

// Convert 24-hour time to 12-hour format
export function formatTime12Hour(time24: string): string {
  if (!time24) return '';
  
  const [hoursStr, minutes] = time24.split(':');
  const hours = parseInt(hoursStr, 10);
  
  if (isNaN(hours)) return time24;
  
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  
  return `${hours12}:${minutes} ${period}`;
}

// Format time range in 12-hour format
export function formatTimeRange12Hour(startTime: string, endTime: string): string {
  return `${formatTime12Hour(startTime)} - ${formatTime12Hour(endTime)}`;
}

// Format date to YYYY-MM-DD in local timezone (avoids UTC conversion issues)
export function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
