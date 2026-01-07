import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useHalls, useCreateHall, useUpdateHall, useToggleHallStatus, Hall } from '@/hooks/useHalls';
import { HallForm, HallFormData } from '@/components/admin/HallForm';
import { SectionManagement } from '@/components/admin/SectionManagement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Building, Plus, Search, MoreHorizontal, Pencil, Users } from 'lucide-react';
import { AdminTopBar } from '@/components/navigation/AdminTopBar';

export default function HallManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHall, setEditingHall] = useState<Hall | undefined>();

  const { data: halls = [], isLoading } = useHalls();
  const createHall = useCreateHall();
  const updateHall = useUpdateHall();
  const toggleStatus = useToggleHallStatus();

  const filteredHalls = halls.filter(hall =>
    hall.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hall.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setEditingHall(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (hall: Hall) => {
    setEditingHall(hall);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: HallFormData) => {
    if (editingHall) {
      await updateHall.mutateAsync({ id: editingHall.id, ...data });
    } else {
      await createHall.mutateAsync(data);
    }
    setDialogOpen(false);
    setEditingHall(undefined);
  };

  const handleToggleStatus = (hall: Hall) => {
    toggleStatus.mutate({ id: hall.id, is_active: !hall.is_active });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <AdminTopBar />
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Hall Management</h1>
            <p className="text-muted-foreground">
              Add, edit, and manage conference halls
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Hall
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Building className="h-4 w-4" />
              Total Halls
            </div>
            <p className="text-2xl font-bold mt-1">{halls.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-success text-sm">
              <span className="h-2 w-2 rounded-full bg-success" />
              Active
            </div>
            <p className="text-2xl font-bold mt-1">{halls.filter(h => h.is_active).length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span className="h-2 w-2 rounded-full bg-muted-foreground" />
              Inactive
            </div>
            <p className="text-2xl font-bold mt-1">{halls.filter(h => !h.is_active).length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Users className="h-4 w-4" />
              Total Capacity
            </div>
            <p className="text-2xl font-bold mt-1">{halls.reduce((sum, h) => sum + h.capacity, 0)}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search halls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hall Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-center">Capacity</TableHead>
                <TableHead>Facilities</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHalls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No halls found
                  </TableCell>
                </TableRow>
              ) : (
                filteredHalls.map((hall) => (
                  <TableRow key={hall.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{hall.name}</p>
                        {hall.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {hall.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={hall.type === 'conference' ? 'default' : 'outline'}>
                        {hall.type === 'conference' ? 'Conference' : 'Mini'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {hall.capacity}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {hall.facilities?.slice(0, 3).map((f) => (
                          <Badge key={f} variant="secondary" className="text-xs">
                            {f}
                          </Badge>
                        ))}
                        {(hall.facilities?.length || 0) > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{(hall.facilities?.length || 0) - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={hall.is_active}
                        onCheckedChange={() => handleToggleStatus(hall)}
                        disabled={toggleStatus.isPending}
                      />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(hall)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Hall
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Section Management */}
        <SectionManagement />
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingHall ? 'Edit Hall' : 'Add New Hall'}</DialogTitle>
            <DialogDescription>
              {editingHall
                ? 'Update the hall details below.'
                : 'Fill in the details to create a new hall.'}
            </DialogDescription>
          </DialogHeader>
          <HallForm
            hall={editingHall}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            isSubmitting={createHall.isPending || updateHall.isPending}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
