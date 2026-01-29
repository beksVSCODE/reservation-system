import { useState, useEffect, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Lock, AlertCircle, LogIn } from 'lucide-react';
import { Specialist, Service, TimeSlot } from '@/shared/types';
import { useSpecialistBookings, useLockedSlots, useLockSlot } from '@/features/booking';
import { useAuthStore } from '@/features/auth';
import { generateTimeSlots, formatTime, formatDate } from '@/shared/lib/dateUtils';
import { Spinner } from '@/shared/ui/Spinner';
import { cn } from '@/lib/utils';
import { addDays, startOfDay, endOfDay, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

interface DateTimeSelectorProps {
  service: Service;
  specialist: Specialist;
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
  onDateSelect: (date: Date) => void;
  onSlotSelect: (slot: TimeSlot) => void;
  onBack: () => void;
}

export const DateTimeSelector = ({
  service,
  specialist,
  selectedDate,
  selectedSlot,
  onDateSelect,
  onSlotSelect,
  onBack,
}: DateTimeSelectorProps) => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [internalDate, setInternalDate] = useState<Date | undefined>(selectedDate || undefined);
  const lockSlot = useLockSlot();

  // Calculate date range for booking query
  const queryStartDate = internalDate || new Date();
  const queryEndDate = addDays(queryStartDate, 7);

  const { data: bookings, isLoading: bookingsLoading } = useSpecialistBookings(
    specialist.id,
    startOfDay(queryStartDate),
    endOfDay(queryEndDate)
  );

  const { data: lockedSlots } = useLockedSlots(specialist.id);

  // Determine which days the specialist works
  const isDateDisabled = (date: Date) => {
    const dayOfWeek = date.getDay();
    const workingHours = specialist.workingHours[dayOfWeek];
    const isPast = date < startOfDay(new Date());
    return !workingHours || isPast;
  };

  // Generate time slots for selected date
  const timeSlots = useMemo(() => {
    if (!internalDate) return [];

    const dayOfWeek = internalDate.getDay();
    const workingHours = specialist.workingHours[dayOfWeek];

    if (!workingHours) return [];

    const dayBookings = bookings?.filter(b => 
      isSameDay(new Date(b.startTime), internalDate)
    ) || [];

    return generateTimeSlots(
      internalDate,
      workingHours.start,
      workingHours.end,
      service.duration,
      service.bufferBefore,
      service.bufferAfter,
      dayBookings,
      lockedSlots || new Map(),
      user?.id || '',
      specialist.id
    );
  }, [internalDate, bookings, lockedSlots, service, specialist, user]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setInternalDate(date);
      onDateSelect(date);
    }
  };

  const handleSlotClick = async (slot: { time: Date; status: 'free' | 'locked' | 'booked' }) => {
    if (slot.status !== 'free' || !user?.id) return;

    const slotKey = `${specialist.id}-${slot.time.getTime()}`;
    
    try {
      const result = await lockSlot.mutateAsync({ slotKey, userId: user.id });
      
      const timeSlot: TimeSlot = {
        id: slotKey,
        specialistId: specialist.id,
        startTime: slot.time,
        endTime: new Date(slot.time.getTime() + service.duration * 60 * 1000),
        status: 'locked',
        lockedUntil: result.lockedUntil,
        lockedBy: user.id,
      };
      
      onSlotSelect(timeSlot);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Назад
      </Button>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Выберите дату и время</h2>
        <p className="text-muted-foreground mt-2">
          {specialist.name} • {service.name}
        </p>
      </div>

      {/* Auth Warning */}
      {!isAuthenticated && (
        <Alert className="mb-6 border-warning bg-warning/10">
          <LogIn className="h-4 w-4 text-warning" />
          <AlertDescription className="text-sm">
            <div className="flex items-center justify-between">
              <span>
                Для завершения бронирования необходимо войти в систему
              </span>
              <div className="flex gap-2 ml-4">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate('/login', { state: { from: '/booking' } })}
                >
                  Войти
                </Button>
                <Button 
                  size="sm"
                  onClick={() => navigate('/register', { state: { from: '/booking' } })}
                >
                  Регистрация
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">{/* Calendar */}
        {/* Calendar */}
        <Card>
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={internalDate}
              onSelect={handleDateSelect}
              disabled={isDateDisabled}
              locale={ru}
              className="rounded-md"
              classNames={{
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              }}
            />
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card>
          <CardContent className="p-4">
            {!internalDate ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <Clock className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Выберите дату для просмотра доступного времени</p>
              </div>
            ) : bookingsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner />
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Нет доступных слотов на эту дату</p>
              </div>
            ) : (
              <>
                <h3 className="font-medium mb-4 text-center">
                  {formatDate(internalDate, 'dd MMMM, EEEE')}
                </h3>
                <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time.getTime()}
                      onClick={() => handleSlotClick(slot)}
                      disabled={slot.status !== 'free'}
                      className={cn(
                        'relative flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                        slot.status === 'free' && 'slot-free cursor-pointer',
                        slot.status === 'locked' && 'slot-locked',
                        slot.status === 'booked' && 'slot-booked',
                        selectedSlot?.startTime.getTime() === slot.time.getTime() && 
                          'ring-2 ring-primary ring-offset-2'
                      )}
                    >
                      {formatTime(slot.time)}
                      {slot.status === 'locked' && (
                        <Lock className="absolute -top-1 -right-1 h-3 w-3" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded bg-success/20 border border-success/30" />
                    Свободно
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded bg-warning/20 border border-warning/30" />
                    Заблокировано
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded bg-muted border border-muted" />
                    Занято
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
