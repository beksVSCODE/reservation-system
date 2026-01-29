import { format, addMinutes, isSameDay, isAfter, isBefore, setHours, setMinutes } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatDate = (date: Date, formatStr: string = 'dd MMMM yyyy'): string => {
    return format(date, formatStr, { locale: ru });
};

export const formatTime = (date: Date): string => {
    return format(date, 'HH:mm');
};

export const formatDateTime = (date: Date): string => {
    return format(date, 'dd MMMM yyyy, HH:mm', { locale: ru });
};

export const parseTimeString = (timeStr: string): { hours: number; minutes: number } => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours, minutes };
};

export const setTimeOnDate = (date: Date, timeStr: string): Date => {
    const { hours, minutes } = parseTimeString(timeStr);
    return setMinutes(setHours(new Date(date), hours), minutes);
};

export const generateTimeSlots = (
    date: Date,
    startTime: string,
    endTime: string,
    slotDuration: number,
    bufferBefore: number,
    bufferAfter: number,
    existingBookings: { startTime: Date; endTime: Date }[],
    lockedSlots: Map<string, { lockedUntil: Date; lockedBy: string }>,
    currentUserId: string,
    specialistId: string
): { time: Date; status: 'free' | 'locked' | 'booked' }[] => {
    const slots: { time: Date; status: 'free' | 'locked' | 'booked' }[] = [];

    const dayStart = setTimeOnDate(date, startTime);
    const dayEnd = setTimeOnDate(date, endTime);
    const now = new Date();

    let currentSlot = dayStart;
    const totalSlotDuration = slotDuration + bufferBefore + bufferAfter;

    while (addMinutes(currentSlot, slotDuration) <= dayEnd) {
        const slotEnd = addMinutes(currentSlot, slotDuration);
        const slotStartWithBuffer = addMinutes(currentSlot, -bufferBefore);
        const slotEndWithBuffer = addMinutes(slotEnd, bufferAfter);

        // Check if slot is in the past
        if (isBefore(currentSlot, now) && isSameDay(currentSlot, now)) {
            currentSlot = addMinutes(currentSlot, 30);
            continue;
        }

        // Check for booking conflicts
        const isBooked = existingBookings.some(booking => {
            const bookingStart = new Date(booking.startTime);
            const bookingEnd = new Date(booking.endTime);
            return (
                (currentSlot >= bookingStart && currentSlot < bookingEnd) ||
                (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
                (currentSlot <= bookingStart && slotEnd >= bookingEnd)
            );
        });

        if (isBooked) {
            slots.push({ time: new Date(currentSlot), status: 'booked' });
            currentSlot = addMinutes(currentSlot, 30);
            continue;
        }

        // Check for locks
        const slotKey = `${specialistId}-${currentSlot.getTime()}`;
        const lockInfo = lockedSlots.get(slotKey);

        if (lockInfo && lockInfo.lockedUntil > now && lockInfo.lockedBy !== currentUserId) {
            slots.push({ time: new Date(currentSlot), status: 'locked' });
            currentSlot = addMinutes(currentSlot, 30);
            continue;
        }

        slots.push({ time: new Date(currentSlot), status: 'free' });
        currentSlot = addMinutes(currentSlot, 30);
    }

    return slots;
};

export const formatPrice = (price: number): string => {
    return `${price.toLocaleString('ru-RU')} с`;
};

export const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
        return `${minutes} мин`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
        return `${hours} ч`;
    }
    return `${hours} ч ${mins} мин`;
};
