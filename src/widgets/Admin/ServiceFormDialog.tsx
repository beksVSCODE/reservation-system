import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Service } from '@/shared/types';
import { useCreateService, useUpdateService } from '@/features/admin';

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service;
}

export const ServiceFormDialog = ({ open, onOpenChange, service }: ServiceFormDialogProps) => {
  const isEditing = !!service;
  const createService = useCreateService();
  const updateService = useUpdateService();

  const [formData, setFormData] = useState({
    name: service?.name || '',
    duration: service?.duration || 60,
    price: service?.price || 0,
    bufferBefore: service?.bufferBefore || 10,
    bufferAfter: service?.bufferAfter || 10,
    description: service?.description || '',
    icon: service?.icon || '📋',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await updateService.mutateAsync({ id: service.id, updates: formData });
      } else {
        await createService.mutateAsync(formData);
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
      duration: 60,
      price: 0,
      bufferBefore: 10,
      bufferAfter: 10,
      description: '',
      icon: '📋',
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    if (!isEditing) resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Редактировать услугу' : 'Добавить услугу'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Внесите изменения в услугу' : 'Заполните информацию о новой услуге'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Название</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="duration">Длительность (мин)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  step="15"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="price">Цена (с)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="100"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bufferBefore">Буфер до (мин)</Label>
                <Input
                  id="bufferBefore"
                  type="number"
                  min="0"
                  step="5"
                  value={formData.bufferBefore}
                  onChange={(e) => setFormData({ ...formData, bufferBefore: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bufferAfter">Буфер после (мин)</Label>
                <Input
                  id="bufferAfter"
                  type="number"
                  min="0"
                  step="5"
                  value={formData.bufferAfter}
                  onChange={(e) => setFormData({ ...formData, bufferAfter: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="icon">Иконка (emoji)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                maxLength={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={createService.isPending || updateService.isPending}>
              {isEditing ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
