// Domain types for the booking system
export * from './auth';
export type SlotStatus = 'free' | 'locked' | 'booked';
export type BookingStatus = 'active' | 'cancelled' | 'completed';

export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  bufferBefore: number; // in minutes
  bufferAfter: number; // in minutes
  description?: string;
  icon?: string;
}

export interface WorkingHours {
  start: string; // "09:00"
  end: string; // "18:00"
}

export interface Specialist {
  id: string;
  name: string;
  specialization: string;
  avatar?: string;
  workingHours: Record<number, WorkingHours | null>; // 0 = Sunday, 1 = Monday, etc.
  serviceIds: string[];
}

export interface TimeSlot {
  id: string;
  specialistId: string;
  startTime: Date;
  endTime: Date;
  status: SlotStatus;
  lockedUntil?: Date;
  lockedBy?: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  specialistId: string;
  timeSlotId: string;
  userId: string;
  status: BookingStatus;
  createdAt: Date;
  startTime: Date;
  endTime: Date;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface BookingFormData {
  service: Service | null;
  specialist: Specialist | null;
  date: Date | null;
  timeSlot: TimeSlot | null;
  user: {
    name: string;
    phone: string;
  };
}

export type BookingStep = 'service' | 'specialist' | 'datetime' | 'confirm';
