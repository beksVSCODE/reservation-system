import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Clock, User, Calendar, CreditCard, AlertTriangle } from 'lucide-react';
import { Service, Specialist, TimeSlot } from '@/shared/types';
import { formatDate, formatTime, formatPrice, formatDuration } from '@/shared/lib/dateUtils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Spinner } from '@/shared/ui/Spinner';
import { useCreateBooking, useBookingStore } from '@/features/booking';
import { useAuthStore } from '@/features/auth';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
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

interface BookingSummaryProps {
  service: Service;
  specialist: Specialist;
  date: Date;
  timeSlot: TimeSlot;
  onBack: () => void;
}

export const BookingSummary = ({
  service,
  specialist,
  date,
  timeSlot,
  onBack,
}: BookingSummaryProps) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const createBooking = useCreateBooking();
  const resetBooking = useBookingStore((s) => s.resetBooking);
  const setUserData = useBookingStore((s) => s.setUserData);
  const lockExpiresAt = useBookingStore((s) => s.lockExpiresAt);
  
  const [userData, setLocalUserData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Lock timer countdown
  useEffect(() => {
    if (!lockExpiresAt) return;

    const updateTimer = () => {
      const now = new Date();
      const expires = new Date(lockExpiresAt);
      const remaining = Math.max(0, Math.floor((expires.getTime() - now.getTime()) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        // Lock expired, go back
        onBack();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [lockExpiresAt, onBack]);

  const handleInputChange = (field: 'name' | 'phone', value: string) => {
    setLocalUserData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirm = async () => {
    // Проверка авторизации
    if (!isAuthenticated || !user?.id) {
      setShowAuthDialog(true);
      toast({
        title: '⚠️ Требуется авторизация',
        description: 'Для бронирования необходимо войти в систему или зарегистрироваться',
        variant: 'destructive',
      });
      return;
    }

    setUserData(userData);

    try {
      await createBooking.mutateAsync({
        serviceId: service.id,
        specialistId: specialist.id,
        timeSlotId: timeSlot.id,
        userId: user.id,
        status: 'active',
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
      });

      resetBooking();
      navigate('/profile');
    } catch {
      // Error handled by mutation
    }
  };

  const initials = specialist.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemaining > 0 && timeRemaining < 60;

  return (
    <div className="animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Назад
      </Button>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Подтверждение записи</h2>
        <p className="text-muted-foreground mt-2">Проверьте данные и подтвердите бронирование</p>
      </div>

      {/* Timer Warning */}
      {timeRemaining > 0 && (
        <div className={cn(
          'flex items-center justify-center gap-2 mb-6 p-3 rounded-lg',
          isLowTime ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
        )}>
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">
            Слот заблокирован на {formatTimeRemaining(timeRemaining)}
          </span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Booking Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Детали записи</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Service */}
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xl">
                {service.icon || '📋'}
              </div>
              <div>
                <p className="font-medium">{service.name}</p>
                <p className="text-sm text-muted-foreground">{formatDuration(service.duration)}</p>
              </div>
            </div>

            {/* Specialist */}
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={specialist.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{specialist.name}</p>
                <p className="text-sm text-muted-foreground">{specialist.specialization}</p>
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{formatDate(date, 'dd MMMM yyyy, EEEE')}</p>
                <p className="text-sm text-muted-foreground">
                  {formatTime(timeSlot.startTime)} – {formatTime(timeSlot.endTime)}
                </p>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CreditCard className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Стоимость</p>
                <p className="font-semibold text-lg">{formatPrice(service.price)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ваши данные</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                value={userData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Введите ваше имя"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={userData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+7 (___) ___-__-__"
              />
            </div>

            <Button
              onClick={handleConfirm}
              disabled={!userData.name || !userData.phone || createBooking.isPending}
              className="w-full mt-6"
              size="lg"
            >
              {createBooking.isPending ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Оформление...
                </>
              ) : (
                'Подтвердить запись'
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Нажимая кнопку, вы соглашаетесь с условиями записи
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Auth Required Dialog */}
      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Требуется авторизация</AlertDialogTitle>
            <AlertDialogDescription>
              Для оформления бронирования необходимо войти в систему или зарегистрироваться.
              <br /><br />
              Это позволит вам управлять своими записями и получать уведомления.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowAuthDialog(false)}>
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                resetBooking();
                navigate('/login', { 
                  state: { 
                    from: '/booking',
                    message: 'Войдите, чтобы завершить бронирование' 
                  } 
                });
              }}
            >
              Войти
            </AlertDialogAction>
            <AlertDialogAction 
              onClick={() => {
                resetBooking();
                navigate('/register', { 
                  state: { 
                    from: '/booking',
                    message: 'Зарегистрируйтесь, чтобы завершить бронирование' 
                  } 
                });
              }}
              className="bg-primary"
            >
              Регистрация
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
