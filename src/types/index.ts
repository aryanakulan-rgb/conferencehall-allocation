export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  section: string;
}

export interface Hall {
  id: string;
  name: string;
  type: 'conference' | 'mini';
  capacity: number;
  facilities: string[];
  isActive: boolean;
  description: string;
}

export type BookingStatus = 'pending' | 'approved' | 'rejected';

export interface Booking {
  id: string;
  hallId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: BookingStatus;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  name: string;
  code: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}
