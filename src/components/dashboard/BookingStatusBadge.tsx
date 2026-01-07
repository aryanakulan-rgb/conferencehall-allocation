import { cn } from '@/lib/utils';
import { BookingStatus } from '@/types';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface BookingStatusBadgeProps {
  status: BookingStatus;
  size?: 'sm' | 'md';
}

export function BookingStatusBadge({ status, size = 'md' }: BookingStatusBadgeProps) {
  const config = {
    pending: {
      label: 'Booked',
      className: 'status-pending',
      icon: Clock,
    },
    approved: {
      label: 'Approved',
      className: 'status-approved',
      icon: CheckCircle,
    },
    rejected: {
      label: 'Rejected',
      className: 'status-rejected',
      icon: XCircle,
    },
  };

  const { label, className, icon: Icon } = config[status];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border font-medium",
      className,
      sizeClasses
    )}>
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      {label}
    </span>
  );
}
