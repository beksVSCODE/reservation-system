import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { Service, Specialist } from '@/shared/types';
import { useToast } from '@/hooks/use-toast';

// Service Management Hooks
export const useCreateService = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (service: Omit<Service, 'id'>) => api.createService(service),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            toast({
                title: 'Услуга создана',
                description: 'Новая услуга успешно добавлена',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Ошибка',
                description: error.message || 'Не удалось создать услугу',
                variant: 'destructive',
            });
        },
    });
};

export const useUpdateService = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<Service, 'id'>> }) =>
            api.updateService(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            toast({
                title: 'Услуга обновлена',
                description: 'Изменения успешно сохранены',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Ошибка',
                description: error.message || 'Не удалось обновить услугу',
                variant: 'destructive',
            });
        },
    });
};

export const useDeleteService = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (id: string) => api.deleteService(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            toast({
                title: 'Услуга удалена',
                description: 'Услуга успешно удалена из системы',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Ошибка',
                description: error.message || 'Не удалось удалить услугу',
                variant: 'destructive',
            });
        },
    });
};

// Specialist Management Hooks
export const useCreateSpecialist = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (specialist: Omit<Specialist, 'id'>) => api.createSpecialist(specialist),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['specialists'] });
            toast({
                title: 'Специалист добавлен',
                description: 'Новый специалист успешно добавлен',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Ошибка',
                description: error.message || 'Не удалось добавить специалиста',
                variant: 'destructive',
            });
        },
    });
};

export const useUpdateSpecialist = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<Specialist, 'id'>> }) =>
            api.updateSpecialist(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['specialists'] });
            toast({
                title: 'Специалист обновлён',
                description: 'Изменения успешно сохранены',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Ошибка',
                description: error.message || 'Не удалось обновить специалиста',
                variant: 'destructive',
            });
        },
    });
};

export const useDeleteSpecialist = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (id: string) => api.deleteSpecialist(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['specialists'] });
            toast({
                title: 'Специалист удалён',
                description: 'Специалист успешно удалён из системы',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Ошибка',
                description: error.message || 'Не удалось удалить специалиста',
                variant: 'destructive',
            });
        },
    });
};
