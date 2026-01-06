import { useState, useEffect } from 'react';
import { Hall } from '@/hooks/useHalls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface HallFormProps {
  hall?: Hall;
  onSubmit: (data: HallFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export interface HallFormData {
  name: string;
  type: 'conference' | 'mini';
  capacity: number;
  description: string;
  facilities: string[];
  is_active: boolean;
}

const COMMON_FACILITIES = [
  'Projector',
  'Video Conferencing',
  'Audio System',
  'Whiteboard',
  'AC',
  'Smart TV',
  'WiFi',
  'Podium',
];

export function HallForm({ hall, onSubmit, onCancel, isSubmitting }: HallFormProps) {
  const [name, setName] = useState(hall?.name || '');
  const [type, setType] = useState<'conference' | 'mini'>(hall?.type || 'conference');
  const [capacity, setCapacity] = useState(hall?.capacity?.toString() || '20');
  const [description, setDescription] = useState(hall?.description || '');
  const [facilities, setFacilities] = useState<string[]>(hall?.facilities || []);
  const [isActive, setIsActive] = useState(hall?.is_active ?? true);
  const [newFacility, setNewFacility] = useState('');

  const handleAddFacility = (facility: string) => {
    if (facility && !facilities.includes(facility)) {
      setFacilities([...facilities, facility]);
    }
    setNewFacility('');
  };

  const handleRemoveFacility = (facility: string) => {
    setFacilities(facilities.filter(f => f !== facility));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    onSubmit({
      name: name.trim(),
      type,
      capacity: parseInt(capacity) || 20,
      description: description.trim(),
      facilities,
      is_active: isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Hall Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter hall name"
            maxLength={100}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Hall Type *</Label>
          <Select value={type} onValueChange={(v) => setType(v as 'conference' | 'mini')}>
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conference">Conference Hall</SelectItem>
              <SelectItem value="mini">Mini Hall</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity *</Label>
          <Input
            id="capacity"
            type="number"
            min={1}
            max={1000}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between space-x-2 pt-6">
          <Label htmlFor="active" className="text-sm font-medium">
            Active Status
          </Label>
          <Switch
            id="active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter hall description"
          rows={3}
          maxLength={500}
        />
      </div>

      <div className="space-y-3">
        <Label>Facilities</Label>
        
        {/* Quick add buttons */}
        <div className="flex flex-wrap gap-2">
          {COMMON_FACILITIES.filter(f => !facilities.includes(f)).map((facility) => (
            <Button
              key={facility}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddFacility(facility)}
            >
              <Plus className="h-3 w-3 mr-1" />
              {facility}
            </Button>
          ))}
        </div>

        {/* Custom facility input */}
        <div className="flex gap-2">
          <Input
            value={newFacility}
            onChange={(e) => setNewFacility(e.target.value)}
            placeholder="Add custom facility"
            maxLength={50}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddFacility(newFacility);
              }
            }}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleAddFacility(newFacility)}
            disabled={!newFacility.trim()}
          >
            Add
          </Button>
        </div>

        {/* Selected facilities */}
        {facilities.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-secondary/50">
            {facilities.map((facility) => (
              <Badge key={facility} variant="secondary" className="gap-1">
                {facility}
                <button
                  type="button"
                  onClick={() => handleRemoveFacility(facility)}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting || !name.trim()}>
          {isSubmitting ? 'Saving...' : hall ? 'Update Hall' : 'Create Hall'}
        </Button>
      </div>
    </form>
  );
}
