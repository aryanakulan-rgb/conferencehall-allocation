import { Database } from '@/integrations/supabase/types';

export type UserRole = Database['public']['Enums']['app_role'];
export type BookingStatus = Database['public']['Enums']['booking_status'];
export type HallType = Database['public']['Enums']['hall_type'];

export type Hall = Database['public']['Tables']['halls']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Section = Database['public']['Tables']['sections']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  sectionId?: string | null;
}
