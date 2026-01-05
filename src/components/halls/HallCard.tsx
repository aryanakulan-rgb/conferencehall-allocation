import { Hall } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, Wifi, Monitor, Volume2, ThermometerSun } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HallCardProps {
  hall: Hall;
  onBook?: () => void;
  showBookButton?: boolean;
}

const facilityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Projector': Monitor,
  'Video Conferencing': Wifi,
  'Audio System': Volume2,
  'AC': ThermometerSun,
};

export function HallCard({ hall, onBook, showBookButton = true }: HallCardProps) {
  return (
    <div className={cn(
      "group rounded-xl border bg-card p-6 shadow-soft transition-all duration-300 hover:shadow-card",
      !hall.isActive && "opacity-60"
    )}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg text-foreground">{hall.name}</h3>
            {!hall.isActive && (
              <Badge variant="secondary" className="text-xs">Inactive</Badge>
            )}
          </div>
          <Badge variant={hall.type === 'conference' ? 'default' : 'outline'} className="capitalize">
            {hall.type === 'conference' ? 'Conference Hall' : 'Mini Hall'}
          </Badge>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MapPin className="h-5 w-5" />
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {hall.description}
      </p>

      <div className="flex items-center gap-2 mb-4 text-sm text-foreground">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{hall.capacity}</span>
        <span className="text-muted-foreground">people capacity</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {hall.facilities.slice(0, 4).map((facility) => {
          const Icon = facilityIcons[facility] || Monitor;
          return (
            <div
              key={facility}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary text-xs text-secondary-foreground"
            >
              <Icon className="h-3 w-3" />
              {facility}
            </div>
          );
        })}
        {hall.facilities.length > 4 && (
          <div className="px-2 py-1 rounded-md bg-secondary text-xs text-muted-foreground">
            +{hall.facilities.length - 4} more
          </div>
        )}
      </div>

      {showBookButton && hall.isActive && (
        <Button 
          variant="accent" 
          className="w-full"
          onClick={onBook}
        >
          Book This Hall
        </Button>
      )}
    </div>
  );
}
