import { useUserBookings, useServices, useSpecialists, useCancelBooking } from '@/features/booking';
import { useAuthStore } from '@/features/auth';
import { Spinner } from '@/shared/ui/Spinner';
import { BookingCard } from './BookingCard';
import { RescheduleDialog } from './RescheduleDialog';
import { Booking, Service, Specialist } from '@/shared/types';
import { CalendarX } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

export const UserBookings = () => {
  const { user } = useAuthStore();
  const { data: bookings, isLoading: bookingsLoading } = useUserBookings(user?.id, user?.role);
  const { data: services } = useServices();
  const { data: specialists } = useSpecialists();
  const cancelBooking = useCancelBooking();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);

  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (selectedBooking) {
      await cancelBooking.mutateAsync(selectedBooking.id);
      setCancelDialogOpen(false);
      setSelectedBooking(null);
    }
  };

  const handleReschedule = (booking: Booking) => {
    setRescheduleBooking(booking);
    setRescheduleDialogOpen(true);
  };

  if (bookingsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  // Separate active and past bookings
  const now = new Date();
  const activeBookings = bookings?.filter(
    (b) => b.status === 'active' && new Date(b.startTime) >= now
  ) || [];
  const pastBookings = bookings?.filter(
    (b) => b.status !== 'active' || new Date(b.startTime) < now
  ) || [];

  const getService = (serviceId: string) => services?.find((s) => s.id === serviceId);
  const getSpecialist = (specialistId: string) => specialists?.find((s) => s.id === specialistId);

  return (
    <div className="space-y-8">
      {/* Active Bookings */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Активные записи</h2>
        {activeBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-lg border">
            <CalendarX className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">У вас нет активных записей</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                service={getService(booking.serviceId)}
                specialist={getSpecialist(booking.specialistId)}
                onCancel={() => handleCancelClick(booking)}
                onReschedule={() => handleReschedule(booking)}
                isLoading={cancelBooking.isPending}
              />
            ))}
          </div>
        )}
      </section>

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">История записей</h2>
          <div className="space-y-4">
            {pastBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                service={getService(booking.serviceId)}
                specialist={getSpecialist(booking.specialistId)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Reschedule Dialog */}
      {rescheduleBooking && (
        <RescheduleDialog
          open={rescheduleDialogOpen}
          onOpenChange={setRescheduleDialogOpen}
          booking={rescheduleBooking}
          service={getService(rescheduleBooking.serviceId)!}
          specialist={getSpecialist(rescheduleBooking.specialistId)!}
        />
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Отменить запись?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите отменить эту запись? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Нет, оставить</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Да, отменить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
