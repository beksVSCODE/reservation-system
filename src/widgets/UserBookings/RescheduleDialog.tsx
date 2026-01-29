import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Booking, Service, Specialist, TimeSlot } from '@/shared/types';
import { useAvailableSlots, useRescheduleBooking } from '@/features/booking';
import { formatDate, formatTime } from '@/shared/lib/dateUtils';
import { Spinner } from '@/shared/ui/Spinner';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ru } from 'date-fns/locale';

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking;
  service: Service;
  specialist: Specialist;
}

export const RescheduleDialog = ({
  open,
  onOpenChange,
  booking,
  service,
  specialist,
}: RescheduleDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  
  const { data: availableSlots, isLoading: slotsLoading } = useAvailableSlots(
    specialist.id,
    selectedDate || new Date(),
    service.duration
  );
  
  const rescheduleBooking = useRescheduleBooking();

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedDate(undefined);
      setSelectedSlot(null);
    }
  }, [open]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleConfirm = async () => {
    if (!selectedSlot) return;

    try {
      await rescheduleBooking.mutateAsync({
        bookingId: booking.id,
        newStartTime: selectedSlot.startTime,
        newEndTime: selectedSlot.endTime,
      });
      onOpenChange(false);
    } catch {
      // Error handled by mutation
    }
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Перенести запись</DialogTitle>
          <DialogDescription>
            Выберите новую дату и время для вашей записи
          </DialogDescription>
        </DialogHeader>

        {/* Current booking info */}
        <div className="rounded-lg bg-muted/50 p-4 space-y-2">
          <p className="text-sm font-medium">Текущая запись:</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            <span>{formatDate(new Date(booking.startTime), 'dd MMMM yyyy, EEEE')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Date Selection */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Выберите дату</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={isDateDisabled}
              locale={ru}
              className="rounded-md border"
            />
          </div>

          {/* Time Slot Selection */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Выберите время</h3>
            
            {!selectedDate ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                Сначала выберите дату
              </div>
            ) : slotsLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Spinner size="md" />
              </div>
            ) : !availableSlots || availableSlots.length === 0 ? (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  На выбранную дату нет доступных слотов
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant={selectedSlot?.id === slot.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSlotSelect(slot)}
                    className={cn(
                      'justify-center',
                      selectedSlot?.id === slot.id && 'ring-2 ring-primary'
                    )}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(slot.startTime)}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected new time preview */}
        {selectedDate && selectedSlot && (
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 space-y-2">
            <p className="text-sm font-medium text-primary">Новое время записи:</p>
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4" />
              <span className="font-medium">
                {formatDate(selectedDate, 'dd MMMM yyyy, EEEE')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span className="font-medium">
                {formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={rescheduleBooking.isPending}
          >
            Отмена
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedSlot || rescheduleBooking.isPending}
          >
            {rescheduleBooking.isPending ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Переношу...
              </>
            ) : (
              'Подтвердить перенос'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
