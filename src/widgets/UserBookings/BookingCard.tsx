import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Booking, Service, Specialist } from '@/shared/types';
import { formatDateTime, formatPrice, formatDuration } from '@/shared/lib/dateUtils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingCardProps {
  booking: Booking;
  service: Service | undefined;
  specialist: Specialist | undefined;
  onCancel?: () => void;
  onReschedule?: () => void;
  isLoading?: boolean;
}

export const BookingCard = ({
  booking,
  service,
  specialist,
  onCancel,
  onReschedule,
  isLoading,
}: BookingCardProps) => {
  const initials = specialist?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '??';

  const statusConfig = {
    active: { label: 'Активна', className: 'bg-success/10 text-success border-success/30' },
    completed: { label: 'Завершена', className: 'bg-muted text-muted-foreground border-muted' },
    cancelled: { label: 'Отменена', className: 'bg-destructive/10 text-destructive border-destructive/30' },
  };

  const status = statusConfig[booking.status];
  const isPast = new Date(booking.startTime) < new Date();
  const canModify = booking.status === 'active' && !isPast;

  return (
    <Card className={cn(
      'transition-all',
      booking.status === 'cancelled' && 'opacity-60'
    )}>
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 hidden sm:flex">
              <AvatarImage src={specialist?.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-semibold text-foreground">
                  {service?.name || 'Услуга'}
                </h3>
                <Badge variant="outline" className={cn('text-xs', status.className)}>
                  {status.label}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-2">
                {specialist?.name || 'Специалист'}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDateTime(new Date(booking.startTime))}
                </span>
                {service && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(service.duration)}
                  </span>
                )}
              </div>

              {service && (
                <p className="text-sm font-medium text-foreground mt-2">
                  {formatPrice(service.price)}
                </p>
              )}
            </div>
          </div>

          {canModify && (
            <div className="flex sm:flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onReschedule}
                disabled={isLoading}
                className="flex-1 sm:flex-none"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Перенести
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 sm:flex-none text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4 mr-1" />
                Отменить
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
