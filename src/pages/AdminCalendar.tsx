import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminTopBar } from "@/components/navigation/AdminTopBar";
import { useBookings } from "@/hooks/useBookings";
import { useHalls } from "@/hooks/useHalls";
import { useProfiles } from "@/hooks/useProfiles";
import { useSections } from "@/hooks/useSections";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const AdminCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedHallId, setSelectedHallId] = useState<string>("all");
  
  const { data: bookings = [], isLoading: bookingsLoading } = useBookings();
  const { data: halls = [], isLoading: hallsLoading } = useHalls();
  const { data: profiles = [] } = useProfiles();
  const { data: sections = [] } = useSections();

  const isLoading = bookingsLoading || hallsLoading;

  const getHallName = (hallId: string) => {
    return halls.find(h => h.id === hallId)?.name || "Unknown Hall";
  };

  const getUserName = (userId: string) => {
    return profiles.find(p => p.id === userId)?.name || "Unknown User";
  };

  const getUserSection = (userId: string) => {
    const profile = profiles.find(p => p.id === userId);
    if (!profile?.section_id) return null;
    return sections.find(s => s.id === profile.section_id)?.name || null;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved": return "default";
      case "pending": return "secondary";
      case "rejected": return "destructive";
      default: return "outline";
    }
  };

  // Filter bookings by selected hall
  const filteredBookings = selectedHallId === "all" 
    ? bookings 
    : bookings.filter(b => b.hall_id === selectedHallId);

  // Get bookings for the selected date
  const selectedDateBookings = filteredBookings.filter(booking => 
    isSameDay(new Date(booking.date), selectedDate)
  );

  // Get dates that have bookings for calendar highlighting
  const datesWithBookings = filteredBookings.map(b => new Date(b.date));

  const hasBookingOnDate = (date: Date) => {
    return datesWithBookings.some(d => isSameDay(d, date));
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <AdminTopBar />
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <AdminTopBar />
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Booking Calendar Overview</h1>
          <Select value={selectedHallId} onValueChange={setSelectedHallId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Hall" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Halls</SelectItem>
              {halls.filter(h => h.is_active).map(hall => (
                <SelectItem key={hall.id} value={hall.id}>{hall.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar View */}
          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border pointer-events-auto"
                modifiers={{
                  booked: (date) => hasBookingOnDate(date),
                }}
                modifiersClassNames={{
                  booked: "bg-primary/20 font-bold",
                }}
              />
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 rounded bg-primary/20" />
                <span>Dates with bookings</span>
              </div>
            </CardContent>
          </Card>

          {/* Bookings Summary for Selected Date */}
          <Card>
            <CardHeader>
              <CardTitle>
                Bookings on {format(selectedDate, "MMMM d, yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateBookings.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No bookings for this date
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedDateBookings.map(booking => {
                    const sectionName = getUserSection(booking.user_id);
                    return (
                      <div 
                        key={booking.id} 
                        className="p-3 border rounded-lg space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{booking.purpose}</p>
                            <p className="text-sm text-muted-foreground">
                              {getUserName(booking.user_id)}
                              {sectionName && ` • ${sectionName}`}
                            </p>
                          </div>
                          <Badge variant={getStatusVariant(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span>{getHallName(booking.hall_id)}</span>
                          <span className="mx-2">•</span>
                          <span>{booking.start_time} - {booking.end_time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Full Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Hall</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No bookings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(booking => (
                        <TableRow 
                          key={booking.id}
                          className={cn(
                            isSameDay(new Date(booking.date), selectedDate) && "bg-muted/50"
                          )}
                        >
                          <TableCell>{format(new Date(booking.date), "MMM d, yyyy")}</TableCell>
                          <TableCell>{booking.start_time} - {booking.end_time}</TableCell>
                          <TableCell>{getHallName(booking.hall_id)}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{booking.purpose}</TableCell>
                          <TableCell>{getUserName(booking.user_id)}</TableCell>
                          <TableCell>{getUserSection(booking.user_id) || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(booking.status)}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminCalendar;
