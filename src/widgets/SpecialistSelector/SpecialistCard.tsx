import { Card, CardContent } from '@/components/ui/card';
import { Specialist } from '@/shared/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface SpecialistCardProps {
  specialist: Specialist;
  isSelected?: boolean;
  onClick?: () => void;
}

export const SpecialistCard = ({ specialist, isSelected, onClick }: SpecialistCardProps) => {
  const initials = specialist.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  // Get working days
  const workingDays = Object.entries(specialist.workingHours)
    .filter(([_, hours]) => hours !== null)
    .map(([day]) => {
      const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
      return dayNames[parseInt(day)];
    });

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
            <Avatar className="h-14 w-14">
              <AvatarImage src={specialist.avatar} alt={specialist.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg text-card-foreground">{specialist.name}</h3>
              <p className="text-sm text-muted-foreground">{specialist.specialization}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Работает: {workingDays.join(', ')}
              </p>
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
