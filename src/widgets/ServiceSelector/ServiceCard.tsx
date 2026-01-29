import { Card, CardContent } from '@/components/ui/card';
import { Service } from '@/shared/types';
import { formatPrice, formatDuration } from '@/shared/lib/dateUtils';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  isSelected?: boolean;
  onClick?: () => void;
}

export const ServiceCard = ({ service, isSelected, onClick }: ServiceCardProps) => {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50',
        isSelected && 'border-primary ring-2 ring-primary/20 shadow-lg'
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
              {service.icon || '📋'}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-card-foreground">{service.name}</h3>
              {service.description && (
                <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span>{formatDuration(service.duration)}</span>
                <span>•</span>
                <span className="font-medium text-foreground">{formatPrice(service.price)}</span>
              </div>
            </div>
          </div>
          {isSelected && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
