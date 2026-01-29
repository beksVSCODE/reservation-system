import { SpecialistCard } from './SpecialistCard';
import { useSpecialistsByService } from '@/features/booking';
import { Specialist, Service } from '@/shared/types';
import { Spinner } from '@/shared/ui/Spinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface SpecialistSelectorProps {
  service: Service;
  selectedSpecialist: Specialist | null;
  onSelect: (specialist: Specialist) => void;
  onBack: () => void;
}

export const SpecialistSelector = ({ 
  service, 
  selectedSpecialist, 
  onSelect, 
  onBack 
}: SpecialistSelectorProps) => {
  const { data: specialists, isLoading, error } = useSpecialistsByService(service.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Ошибка загрузки специалистов</p>
        <p className="text-sm text-muted-foreground mt-2">Попробуйте обновить страницу</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Назад
      </Button>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Выберите специалиста</h2>
        <p className="text-muted-foreground mt-2">
          Услуга: <span className="font-medium text-foreground">{service.name}</span>
        </p>
      </div>
      
      {specialists?.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Нет доступных специалистов для этой услуги</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {specialists?.map((specialist) => (
            <SpecialistCard
              key={specialist.id}
              specialist={specialist}
              isSelected={selectedSpecialist?.id === specialist.id}
              onClick={() => onSelect(specialist)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
