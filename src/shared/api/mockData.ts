import { Service, Specialist, Booking, User } from '../types';

export const mockServices: Service[] = [
    {
        id: 'service-1',
        name: 'Консультация',
        duration: 60,
        price: 2500,
        bufferBefore: 10,
        bufferAfter: 10,
        description: 'Первичная консультация со специалистом',
        icon: '💬',
    },
    {
        id: 'service-2',
        name: 'Диагностика',
        duration: 45,
        price: 1800,
        bufferBefore: 5,
        bufferAfter: 5,
        description: 'Комплексная диагностика',
        icon: '🔍',
    },
    {
        id: 'service-3',
        name: 'Терапия',
        duration: 90,
        price: 4000,
        bufferBefore: 15,
        bufferAfter: 15,
        description: 'Терапевтическая сессия',
        icon: '🩺',
    },
    {
        id: 'service-4',
        name: 'Экспресс-консультация',
        duration: 30,
        price: 1500,
        bufferBefore: 5,
        bufferAfter: 5,
        description: 'Быстрая консультация по конкретному вопросу',
        icon: '⚡',
    },
];

export const mockSpecialists: Specialist[] = [
    {
        id: 'specialist-1',
        name: 'Анна Петрова',
        specialization: 'Терапевт',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
        workingHours: {
            0: null, // Sunday - off
            1: { start: '09:00', end: '18:00' },
            2: { start: '09:00', end: '18:00' },
            3: { start: '09:00', end: '18:00' },
            4: { start: '09:00', end: '18:00' },
            5: { start: '09:00', end: '16:00' },
            6: null, // Saturday - off
        },
        serviceIds: ['service-1', 'service-2', 'service-3'],
    },
    {
        id: 'specialist-2',
        name: 'Дмитрий Иванов',
        specialization: 'Диагност',
        avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
        workingHours: {
            0: null,
            1: { start: '10:00', end: '19:00' },
            2: { start: '10:00', end: '19:00' },
            3: null, // Wednesday - off
            4: { start: '10:00', end: '19:00' },
            5: { start: '10:00', end: '19:00' },
            6: { start: '10:00', end: '15:00' },
        },
        serviceIds: ['service-1', 'service-2', 'service-4'],
    },
    {
        id: 'specialist-3',
        name: 'Елена Сидорова',
        specialization: 'Консультант',
        avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop&crop=face',
        workingHours: {
            0: null,
            1: { start: '08:00', end: '14:00' },
            2: { start: '08:00', end: '14:00' },
            3: { start: '08:00', end: '14:00' },
            4: { start: '08:00', end: '14:00' },
            5: { start: '08:00', end: '14:00' },
            6: null,
        },
        serviceIds: ['service-1', 'service-4'],
    },
];

export const mockUser: User = {
    id: 'user-1',
    name: 'Тестовый Пользователь',
    phone: '+7 (999) 123-45-67',
    email: 'test@example.com',
};

// Generate some mock bookings for demo
const today = new Date();
export const mockBookings: Booking[] = [
    // Bookings for user-001 (user@booking.com)
    {
        id: 'booking-1',
        serviceId: 'service-1',
        specialistId: 'specialist-1',
        timeSlotId: 'slot-1',
        userId: 'user-001',
        status: 'active',
        createdAt: new Date(today.getTime() - 24 * 60 * 60 * 1000),
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 10, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 11, 0),
    },
    {
        id: 'booking-2',
        serviceId: 'service-2',
        specialistId: 'specialist-2',
        timeSlotId: 'slot-2',
        userId: 'user-001',
        status: 'completed',
        createdAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3, 14, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3, 14, 45),
    },
    // Bookings for a different user (to test isolation)
    {
        id: 'booking-3',
        serviceId: 'service-3',
        specialistId: 'specialist-1',
        timeSlotId: 'slot-3',
        userId: 'user-002',
        status: 'active',
        createdAt: new Date(today.getTime() - 12 * 60 * 60 * 1000),
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 15, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 16, 30),
    },
    {
        id: 'booking-4',
        serviceId: 'service-1',
        specialistId: 'specialist-3',
        timeSlotId: 'slot-4',
        userId: 'user-003',
        status: 'active',
        createdAt: new Date(today.getTime() - 36 * 60 * 60 * 1000),
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 9, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 10, 0),
    },
];
