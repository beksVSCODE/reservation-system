import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { Booking } from '@/shared/types';
import { useToast } from '@/hooks/use-toast';

export const useServices = () => {
    return useQuery({
        queryKey: ['services'],
        queryFn: api.getServices,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useSpecialists = () => {
    return useQuery({
        queryKey: ['specialists'],
        queryFn: api.getSpecialists,
        staleTime: 5 * 60 * 1000,
    });
};

export const useSpecialistsByService = (serviceId: string | undefined) => {
    return useQuery({
        queryKey: ['specialists', 'service', serviceId],
        queryFn: () => api.getSpecialistsByService(serviceId!),
        enabled: !!serviceId,
        staleTime: 5 * 60 * 1000,
    });
};

export const useUserBookings = (userId: string | undefined, userRole?: 'guest' | 'user' | 'admin') => {
    return useQuery({
        queryKey: ['bookings', 'user', userId, userRole],
        queryFn: () => api.getBookings(userId, userRole),
        enabled: !!userId || userRole === 'admin',
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 30 * 1000,
    });
};

export const useSpecialistBookings = (
    specialistId: string | undefined,
    startDate: Date,
    endDate: Date
) => {
    return useQuery({
        queryKey: ['bookings', 'specialist', specialistId, startDate.toISOString(), endDate.toISOString()],
        queryFn: () => api.getBookingsBySpecialist(specialistId!, startDate, endDate),
        enabled: !!specialistId,
        staleTime: 10 * 1000,
        refetchInterval: 15 * 1000,
    });
};

export const useCreateBooking = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (booking: Omit<Booking, 'id' | 'createdAt'>) => api.createBooking(booking),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            toast({
                title: 'Бронирование создано',
                description: 'Ваша запись успешно оформлена',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Ошибка',
                description: error.message || 'Не удалось создать бронирование',
                variant: 'destructive',
            });
        },
    });
};

export const useCancelBooking = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (bookingId: string) => api.cancelBooking(bookingId),
        onMutate: async (bookingId) => {
            await queryClient.cancelQueries({ queryKey: ['bookings'] });

            const previousBookings = queryClient.getQueryData(['bookings', 'user']);

            queryClient.setQueryData(['bookings', 'user'], (old: Booking[] | undefined) =>
                old?.map(b => b.id === bookingId ? { ...b, status: 'cancelled' as const } : b)
            );

            return { previousBookings };
        },
        onError: (error: Error, _, context) => {
            if (context?.previousBookings) {
                queryClient.setQueryData(['bookings', 'user'], context.previousBookings);
            }
            toast({
                title: 'Ошибка',
                description: error.message || 'Не удалось отменить бронирование',
                variant: 'destructive',
            });
        },
        onSuccess: () => {
            toast({
                title: 'Запись отменена',
                description: 'Ваша запись успешно отменена',
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
    });
};

export const useRescheduleBooking = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ bookingId, newStartTime, newEndTime }: {
            bookingId: string;
            newStartTime: Date;
            newEndTime: Date
        }) => api.rescheduleBooking(bookingId, newStartTime, newEndTime),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            toast({
                title: 'Запись перенесена',
                description: 'Время записи успешно изменено',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Ошибка',
                description: error.message || 'Не удалось перенести запись',
                variant: 'destructive',
            });
        },
    });
};

export const useLockSlot = () => {
    return useMutation({
        mutationFn: ({ slotKey, userId }: { slotKey: string; userId: string }) =>
            api.lockSlot(slotKey, userId, 5),
    });
};

export const useUnlockSlot = () => {
    return useMutation({
        mutationFn: ({ slotKey, userId }: { slotKey: string; userId: string }) =>
            api.unlockSlot(slotKey, userId),
    });
};

export const useLockedSlots = (specialistId: string | undefined) => {
    return useQuery({
        queryKey: ['lockedSlots', specialistId],
        queryFn: () => api.getLockedSlots(specialistId!),
        enabled: !!specialistId,
        staleTime: 5 * 1000,
        refetchInterval: 10 * 1000,
    });
};
