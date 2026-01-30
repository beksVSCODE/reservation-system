import { Service, Specialist, Booking, TimeSlot } from '../types';
import { mockServices, mockSpecialists, mockBookings } from './mockData';
import { validateImage } from '../lib/imageUtils';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate random failures (10% chance)
const maybeFailRequest = () => {
    if (Math.random() < 0.1) {
        throw new Error('Network error: Request failed');
    }
};

// LocalStorage keys
const STORAGE_KEYS = {
    SERVICES: 'booking-app-services',
    SPECIALISTS: 'booking-app-specialists',
    BOOKINGS: 'booking-app-bookings',
};

// Load data from localStorage or use defaults
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const stored = localStorage.getItem(key);
        if (!stored) return defaultValue;

        const parsed = JSON.parse(stored);

        // Convert date strings back to Date objects for bookings
        if (key === STORAGE_KEYS.BOOKINGS && Array.isArray(parsed)) {
            return parsed.map((booking: any) => ({
                ...booking,
                createdAt: new Date(booking.createdAt),
                startTime: new Date(booking.startTime),
                endTime: new Date(booking.endTime),
            })) as T;
        }

        return parsed;
    } catch {
        return defaultValue;
    }
};

// Save data to localStorage
const saveToStorage = <T>(key: string, data: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
};

// In-memory store with localStorage persistence
const servicesStore = loadFromStorage<Service[]>(STORAGE_KEYS.SERVICES, mockServices);
const specialistsStore = loadFromStorage<Specialist[]>(STORAGE_KEYS.SPECIALISTS, mockSpecialists);
const bookingsStore = loadFromStorage<Booking[]>(STORAGE_KEYS.BOOKINGS, [...mockBookings]);
const lockedSlotsStore: Map<string, { lockedUntil: Date; lockedBy: string }> = new Map();

export const api = {
    // Services
    async getServices(): Promise<Service[]> {
        await delay(300 + Math.random() * 200);
        return servicesStore;
    },

    async getServiceById(id: string): Promise<Service | undefined> {
        await delay(200);
        return servicesStore.find(s => s.id === id);
    },

    // Specialists
    async getSpecialists(): Promise<Specialist[]> {
        await delay(300 + Math.random() * 200);
        return specialistsStore;
    },

    async getSpecialistById(id: string): Promise<Specialist | undefined> {
        await delay(200);
        return specialistsStore.find(s => s.id === id);
    },

    async getSpecialistsByService(serviceId: string): Promise<Specialist[]> {
        await delay(300 + Math.random() * 200);
        return specialistsStore.filter(s => s.serviceIds.includes(serviceId));
    },

    // Bookings
    async getBookings(userId?: string, userRole?: 'guest' | 'user' | 'admin'): Promise<Booking[]> {
        await delay(400 + Math.random() * 300);

        // Admin sees all bookings
        if (userRole === 'admin') {
            return bookingsStore;
        }

        // Regular users see only their bookings
        if (userId && userRole === 'user') {
            return bookingsStore.filter(b => b.userId === userId);
        }

        // Guests see no bookings
        return [];
    },

    async getBookingsBySpecialist(specialistId: string, startDate: Date, endDate: Date): Promise<Booking[]> {
        await delay(300);
        return bookingsStore.filter(b =>
            b.specialistId === specialistId &&
            b.status !== 'cancelled' &&
            b.startTime >= startDate &&
            b.endTime <= endDate
        );
    },

    async createBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
        await delay(500 + Math.random() * 300);
        maybeFailRequest();

        // Check for conflicts
        const conflicts = bookingsStore.filter(b =>
            b.specialistId === booking.specialistId &&
            b.status !== 'cancelled' &&
            ((booking.startTime >= b.startTime && booking.startTime < b.endTime) ||
                (booking.endTime > b.startTime && booking.endTime <= b.endTime))
        );

        if (conflicts.length > 0) {
            throw new Error('Слот уже занят. Пожалуйста, выберите другое время.');
        }

        const newBooking: Booking = {
            ...booking,
            id: `booking-${Date.now()}`,
            createdAt: new Date(),
        };

        bookingsStore.push(newBooking);
        saveToStorage(STORAGE_KEYS.BOOKINGS, bookingsStore);
        return newBooking;
    },

    async cancelBooking(bookingId: string): Promise<Booking> {
        await delay(400);
        maybeFailRequest();

        const index = bookingsStore.findIndex(b => b.id === bookingId);
        if (index === -1) {
            throw new Error('Бронирование не найдено');
        }

        bookingsStore[index] = { ...bookingsStore[index], status: 'cancelled' };
        saveToStorage(STORAGE_KEYS.BOOKINGS, bookingsStore);
        return bookingsStore[index];
    },

    async rescheduleBooking(
        bookingId: string,
        newStartTime: Date,
        newEndTime: Date
    ): Promise<Booking> {
        await delay(500);
        maybeFailRequest();

        const index = bookingsStore.findIndex(b => b.id === bookingId);
        if (index === -1) {
            throw new Error('Бронирование не найдено');
        }

        const booking = bookingsStore[index];

        // Check for conflicts
        const conflicts = bookingsStore.filter(b =>
            b.id !== bookingId &&
            b.specialistId === booking.specialistId &&
            b.status !== 'cancelled' &&
            ((newStartTime >= b.startTime && newStartTime < b.endTime) ||
                (newEndTime > b.startTime && newEndTime <= b.endTime))
        );

        if (conflicts.length > 0) {
            throw new Error('Выбранное время уже занято');
        }

        bookingsStore[index] = {
            ...booking,
            startTime: newStartTime,
            endTime: newEndTime,
        };

        saveToStorage(STORAGE_KEYS.BOOKINGS, bookingsStore);
        return bookingsStore[index];
    },

    // Slot locking
    async lockSlot(slotKey: string, userId: string, durationMinutes: number = 5): Promise<{ lockedUntil: Date }> {
        await delay(200);
        maybeFailRequest();

        const existing = lockedSlotsStore.get(slotKey);
        if (existing && existing.lockedUntil > new Date() && existing.lockedBy !== userId) {
            throw new Error('Слот уже заблокирован другим пользователем');
        }

        const lockedUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
        lockedSlotsStore.set(slotKey, { lockedUntil, lockedBy: userId });

        return { lockedUntil };
    },

    async unlockSlot(slotKey: string, userId: string): Promise<void> {
        await delay(100);
        const existing = lockedSlotsStore.get(slotKey);
        if (existing?.lockedBy === userId) {
            lockedSlotsStore.delete(slotKey);
        }
    },

    async getLockedSlots(specialistId: string): Promise<Map<string, { lockedUntil: Date; lockedBy: string }>> {
        await delay(100);
        const result = new Map<string, { lockedUntil: Date; lockedBy: string }>();
        const now = new Date();

        lockedSlotsStore.forEach((value, key) => {
            if (key.startsWith(specialistId) && value.lockedUntil > now) {
                result.set(key, value);
            }
        });

        return result;
    },

    // Admin Content Management - Services
    async createService(service: Omit<Service, 'id'>): Promise<Service> {
        await delay(400);
        maybeFailRequest();

        const newService: Service = {
            ...service,
            id: `service-${Date.now()}`,
        };

        servicesStore.push(newService);
        saveToStorage(STORAGE_KEYS.SERVICES, servicesStore);
        return newService;
    },

    async updateService(id: string, updates: Partial<Omit<Service, 'id'>>): Promise<Service> {
        await delay(400);
        maybeFailRequest();

        const index = servicesStore.findIndex(s => s.id === id);
        if (index === -1) {
            throw new Error('Услуга не найдена');
        }

        servicesStore[index] = { ...servicesStore[index], ...updates };
        saveToStorage(STORAGE_KEYS.SERVICES, servicesStore);
        return servicesStore[index];
    },

    async deleteService(id: string): Promise<void> {
        await delay(300);
        maybeFailRequest();

        const index = servicesStore.findIndex(s => s.id === id);
        if (index === -1) {
            throw new Error('Услуга не найдена');
        }

        // Check if service is used in active bookings
        const activeBookings = bookingsStore.filter(b => b.serviceId === id && b.status === 'active');
        if (activeBookings.length > 0) {
            throw new Error('Невозможно удалить услугу с активными бронированиями');
        }

        servicesStore.splice(index, 1);
        saveToStorage(STORAGE_KEYS.SERVICES, servicesStore);
    },

    // Admin Content Management - Specialists
    async createSpecialist(specialist: Omit<Specialist, 'id'>): Promise<Specialist> {
        await delay(400);
        maybeFailRequest();

        // Валидация изображения (если указано)
        if (specialist.avatar) {
            const validation = validateImage(specialist.avatar);
            if (!validation.valid) {
                throw new Error(validation.error || 'Неверное изображение');
            }
        }

        const newSpecialist: Specialist = {
            ...specialist,
            id: `specialist-${Date.now()}`,
        };

        specialistsStore.push(newSpecialist);
        saveToStorage(STORAGE_KEYS.SPECIALISTS, specialistsStore);
        return newSpecialist;
    },

    async updateSpecialist(id: string, updates: Partial<Omit<Specialist, 'id'>>): Promise<Specialist> {
        await delay(400);
        maybeFailRequest();

        const index = specialistsStore.findIndex(s => s.id === id);
        if (index === -1) {
            throw new Error('Специалист не найден');
        }

        // Валидация изображения (если обновляется)
        if (updates.avatar) {
            const validation = validateImage(updates.avatar);
            if (!validation.valid) {
                throw new Error(validation.error || 'Неверное изображение');
            }
        }

        specialistsStore[index] = { ...specialistsStore[index], ...updates };
        saveToStorage(STORAGE_KEYS.SPECIALISTS, specialistsStore);
        return specialistsStore[index];
    },

    async deleteSpecialist(id: string): Promise<void> {
        await delay(300);
        maybeFailRequest();

        const index = specialistsStore.findIndex(s => s.id === id);
        if (index === -1) {
            throw new Error('Специалист не найден');
        }

        // Check if specialist has active bookings
        const activeBookings = bookingsStore.filter(b => b.specialistId === id && b.status === 'active');
        if (activeBookings.length > 0) {
            throw new Error('Невозможно удалить специалиста с активными бронированиями');
        }

        specialistsStore.splice(index, 1);
        saveToStorage(STORAGE_KEYS.SPECIALISTS, specialistsStore);
    },

    // Utility: Reset to default data
    async resetToDefaults(): Promise<void> {
        await delay(200);

        // Clear localStorage
        localStorage.removeItem(STORAGE_KEYS.SERVICES);
        localStorage.removeItem(STORAGE_KEYS.SPECIALISTS);
        localStorage.removeItem(STORAGE_KEYS.BOOKINGS);

        // Reset in-memory stores
        servicesStore.length = 0;
        servicesStore.push(...mockServices);

        specialistsStore.length = 0;
        specialistsStore.push(...mockSpecialists);

        bookingsStore.length = 0;
        bookingsStore.push(...mockBookings);
    },
};
