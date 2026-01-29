import { useState } from 'react';
import { Header } from '@/widgets/Header';
import { useAuthStore } from '@/features/auth';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Users, Briefcase } from 'lucide-react';
import { useServices, useSpecialists } from '@/features/booking';
import { useDeleteService, useDeleteSpecialist } from '@/features/admin';
import { ServiceFormDialog } from '@/widgets/Admin/ServiceFormDialog';
import { SpecialistFormDialog } from '@/widgets/Admin/SpecialistFormDialog';
import { Spinner } from '@/shared/ui/Spinner';
import { Service, Specialist } from '@/shared/types';
import { formatPrice, formatDuration } from '@/shared/lib/dateUtils';
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

const AdminContentPage = () => {
  const { user } = useAuthStore();
  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: specialists, isLoading: specialistsLoading } = useSpecialists();
  const deleteService = useDeleteService();
  const deleteSpecialist = useDeleteSpecialist();

  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [specialistDialogOpen, setSpecialistDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>();
  const [editingSpecialist, setEditingSpecialist] = useState<Specialist | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'service' | 'specialist'; id: string; name: string } | null>(null);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceDialogOpen(true);
  };

  const handleEditSpecialist = (specialist: Specialist) => {
    setEditingSpecialist(specialist);
    setSpecialistDialogOpen(true);
  };

  const handleDeleteClick = (type: 'service' | 'specialist', id: string, name: string) => {
    setItemToDelete({ type, id, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'service') {
        await deleteService.mutateAsync(itemToDelete.id);
      } else {
        await deleteSpecialist.mutateAsync(itemToDelete.id);
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleServiceDialogClose = (open: boolean) => {
    setServiceDialogOpen(open);
    if (!open) setEditingService(undefined);
  };

  const handleSpecialistDialogClose = (open: boolean) => {
    setSpecialistDialogOpen(open);
    if (!open) setEditingSpecialist(undefined);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Управление контентом</h1>
            <p className="text-muted-foreground mt-1">
              Управляйте услугами и специалистами вашего бизнеса
            </p>
          </div>

          <Tabs defaultValue="services" className="space-y-6">
            <TabsList>
              <TabsTrigger value="services" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Услуги
              </TabsTrigger>
              <TabsTrigger value="specialists" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Специалисты
              </TabsTrigger>
            </TabsList>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Услуги</h2>
                  <p className="text-sm text-muted-foreground">
                    Управление каталогом услуг
                  </p>
                </div>
                <Button onClick={() => setServiceDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить услугу
                </Button>
              </div>

              {servicesLoading ? (
                <div className="flex justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {services?.map(service => (
                    <Card key={service.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{service.icon}</div>
                            <div>
                              <CardTitle className="text-lg">{service.name}</CardTitle>
                              <CardDescription>{service.description}</CardDescription>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditService(service)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick('service', service.id, service.name)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Цена:</span>
                            <p className="font-semibold">{formatPrice(service.price)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Длительность:</span>
                            <p className="font-semibold">{formatDuration(service.duration)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Буфер до:</span>
                            <p>{service.bufferBefore} мин</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Буфер после:</span>
                            <p>{service.bufferAfter} мин</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Specialists Tab */}
            <TabsContent value="specialists" className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Специалисты</h2>
                  <p className="text-sm text-muted-foreground">
                    Управление командой специалистов
                  </p>
                </div>
                <Button onClick={() => setSpecialistDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить специалиста
                </Button>
              </div>

              {specialistsLoading ? (
                <div className="flex justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : (
                <div className="grid gap-4">
                  {specialists?.map(specialist => {
                    const workingDays = Object.entries(specialist.workingHours)
                      .filter(([_, hours]) => hours !== null)
                      .map(([day]) => {
                        const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
                        return days[parseInt(day)];
                      });

                    return (
                      <Card key={specialist.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                              {specialist.avatar ? (
                                <img
                                  src={specialist.avatar}
                                  alt={specialist.name}
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-semibold text-primary">
                                  {specialist.name.split(' ').map(n => n[0]).join('')}
                                </div>
                              )}
                              <div>
                                <CardTitle>{specialist.name}</CardTitle>
                                <CardDescription>{specialist.specialization}</CardDescription>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditSpecialist(specialist)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick('specialist', specialist.id, specialist.name)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm text-muted-foreground">Рабочие дни:</span>
                              <div className="flex gap-2 mt-1">
                                {workingDays.map(day => (
                                  <Badge key={day} variant="secondary">{day}</Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">Услуги:</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {specialist.serviceIds.map(serviceId => {
                                  const service = services?.find(s => s.id === serviceId);
                                  return service ? (
                                    <Badge key={serviceId} variant="outline">
                                      {service.icon} {service.name}
                                    </Badge>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Dialogs */}
      <ServiceFormDialog
        open={serviceDialogOpen}
        onOpenChange={handleServiceDialogClose}
        service={editingService}
      />
      <SpecialistFormDialog
        open={specialistDialogOpen}
        onOpenChange={handleSpecialistDialogClose}
        specialist={editingSpecialist}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы собираетесь удалить {itemToDelete?.type === 'service' ? 'услугу' : 'специалиста'} "{itemToDelete?.name}".
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminContentPage;
