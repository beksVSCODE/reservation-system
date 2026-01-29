import { ServiceCard } from './ServiceCard';
import { useServices } from '@/features/booking';
import { Service } from '@/shared/types';
import { Spinner } from '@/shared/ui/Spinner';

interface ServiceSelectorProps {
  selectedService: Service | null;
  onSelect: (service: Service) => void;
}

export const ServiceSelector = ({ selectedService, onSelect }: ServiceSelectorProps) => {
  const { data: services, isLoading, error } = useServices();

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
        <p className="text-destructive">Ошибка загрузки услуг</p>
        <p className="text-sm text-muted-foreground mt-2">Попробуйте обновить страницу</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Выберите услугу</h2>
        <p className="text-muted-foreground mt-2">Какую услугу вы хотите забронировать?</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {services?.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            isSelected={selectedService?.id === service.id}
            onClick={() => onSelect(service)}
          />
        ))}
      </div>
    </div>
  );
};
