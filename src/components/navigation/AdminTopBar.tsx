import { Breadcrumbs } from './Breadcrumbs';

interface AdminTopBarProps {
  className?: string;
}

export function AdminTopBar({ className }: AdminTopBarProps) {
  return (
    <div className={className || ''}>
      <Breadcrumbs />
    </div>
  );
}