import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Specialist, WorkingHours } from '@/shared/types';
import { useCreateSpecialist, useUpdateSpecialist } from '@/features/admin';
import { useServices } from '@/features/booking';

interface SpecialistFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  specialist?: Specialist;
}

const DAYS = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

export const SpecialistFormDialog = ({ open, onOpenChange, specialist }: SpecialistFormDialogProps) => {
  const isEditing = !!specialist;
  const createSpecialist = useCreateSpecialist();
  const updateSpecialist = useUpdateSpecialist();
  const { data: services } = useServices();

  const [formData, setFormData] = useState({
    name: specialist?.name || '',
    specialization: specialist?.specialization || '',
    avatar: specialist?.avatar || '',
    serviceIds: specialist?.serviceIds || [],
    workingHours: specialist?.workingHours || {
      0: null,
      1: { start: '09:00', end: '18:00' },
      2: { start: '09:00', end: '18:00' },
      3: { start: '09:00', end: '18:00' },
      4: { start: '09:00', end: '18:00' },
      5: { start: '09:00', end: '18:00' },
      6: null,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await updateSpecialist.mutateAsync({ id: specialist.id, updates: formData });
      } else {
        await createSpecialist.mutateAsync(formData);
      }
      onOpenChange(false);
      resetForm();
    } catch {
      // Error handled by mutation
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      specialization: '',
      avatar: '',
      serviceIds: [],
      workingHours: {
        0: null,
        1: { start: '09:00', end: '18:00' },
        2: { start: '09:00', end: '18:00' },
        3: { start: '09:00', end: '18:00' },
        4: { start: '09:00', end: '18:00' },
        5: { start: '09:00', end: '18:00' },
        6: null,
      },
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    if (!isEditing) resetForm();
  };

  const toggleWorkingDay = (day: number) => {
    setFormData({
      ...formData,
      workingHours: {
        ...formData.workingHours,
        [day]: formData.workingHours[day] ? null : { start: '09:00', end: '18:00' },
      },
    });
  };

  const updateWorkingHours = (day: number, field: 'start' | 'end', value: string) => {
    const currentHours = formData.workingHours[day];
    if (!currentHours) return;

    setFormData({
      ...formData,
      workingHours: {
        ...formData.workingHours,
        [day]: { ...currentHours, [field]: value },
      },
    });
  };

  const toggleService = (serviceId: string) => {
    const currentIds = formData.serviceIds;
    setFormData({
      ...formData,
      serviceIds: currentIds.includes(serviceId)
        ? currentIds.filter(id => id !== serviceId)
        : [...currentIds, serviceId],
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Редактировать специалиста' : 'Добавить специалиста'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Внесите изменения в профиль специалиста' : 'Заполните информацию о новом специалисте'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">ФИО</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="specialization">Специализация</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="avatar">Ссылка на фото</Label>
              <Input
                id="avatar"
                type="url"
                placeholder="https://..."
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Услуги</Label>
              <div className="space-y-2">
                {services?.map(service => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`service-${service.id}`}
                      checked={formData.serviceIds.includes(service.id)}
                      onCheckedChange={() => toggleService(service.id)}
                    />
                    <label
                      htmlFor={`service-${service.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {service.icon} {service.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Рабочие часы</Label>
              <div className="space-y-3">
                {DAYS.map((dayName, dayIndex) => {
                  const hours = formData.workingHours[dayIndex];
                  return (
                    <div key={dayIndex} className="flex items-center gap-3">
                      <Checkbox
                        id={`day-${dayIndex}`}
                        checked={!!hours}
                        onCheckedChange={() => toggleWorkingDay(dayIndex)}
                      />
                      <label htmlFor={`day-${dayIndex}`} className="text-sm w-28 cursor-pointer">
                        {dayName}
                      </label>
                      {hours && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={hours.start}
                            onChange={(e) => updateWorkingHours(dayIndex, 'start', e.target.value)}
                            className="w-28"
                          />
                          <span>—</span>
                          <Input
                            type="time"
                            value={hours.end}
                            onChange={(e) => updateWorkingHours(dayIndex, 'end', e.target.value)}
                            className="w-28"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={createSpecialist.isPending || updateSpecialist.isPending}>
              {isEditing ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
