import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BookingStep, BookingFormData, Service, Specialist, TimeSlot } from '@/shared/types';

interface BookingState {
  currentStep: BookingStep;
  formData: BookingFormData;
  lockedSlotKey: string | null;
  lockExpiresAt: Date | null;
  
  // Actions
  setStep: (step: BookingStep) => void;
  setService: (service: Service | null) => void;
  setSpecialist: (specialist: Specialist | null) => void;
  setDate: (date: Date | null) => void;
  setTimeSlot: (slot: TimeSlot | null) => void;
  setUserData: (data: { name: string; phone: string }) => void;
  setLockedSlot: (slotKey: string | null, expiresAt: Date | null) => void;
  resetBooking: () => void;
  getCompletedSteps: () => BookingStep[];
}

const initialFormData: BookingFormData = {
  service: null,
  specialist: null,
  date: null,
  timeSlot: null,
  user: {
    name: '',
    phone: '',
  },
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      currentStep: 'service',
      formData: initialFormData,
      lockedSlotKey: null,
      lockExpiresAt: null,

      setStep: (step) => set({ currentStep: step }),
      
      setService: (service) => set((state) => ({
        formData: { ...state.formData, service, specialist: null, date: null, timeSlot: null },
        currentStep: service ? 'specialist' : 'service',
      })),
      
      setSpecialist: (specialist) => set((state) => ({
        formData: { ...state.formData, specialist, date: null, timeSlot: null },
        currentStep: specialist ? 'datetime' : 'specialist',
      })),
      
      setDate: (date) => set((state) => ({
        formData: { ...state.formData, date, timeSlot: null },
      })),
      
      setTimeSlot: (timeSlot) => set((state) => ({
        formData: { ...state.formData, timeSlot },
        currentStep: timeSlot ? 'confirm' : 'datetime',
      })),
      
      setUserData: (data) => set((state) => ({
        formData: { ...state.formData, user: data },
      })),

      setLockedSlot: (slotKey, expiresAt) => set({
        lockedSlotKey: slotKey,
        lockExpiresAt: expiresAt,
      }),
      
      resetBooking: () => set({
        currentStep: 'service',
        formData: initialFormData,
        lockedSlotKey: null,
        lockExpiresAt: null,
      }),

      getCompletedSteps: () => {
        const { formData } = get();
        const completed: BookingStep[] = [];
        
        if (formData.service) completed.push('service');
        if (formData.specialist) completed.push('specialist');
        if (formData.date && formData.timeSlot) completed.push('datetime');
        
        return completed;
      },
    }),
    {
      name: 'booking-storage',
      partialize: (state) => ({
        currentStep: state.currentStep,
        formData: {
          ...state.formData,
          date: state.formData.date ? state.formData.date.toISOString() : null,
          timeSlot: state.formData.timeSlot ? {
            ...state.formData.timeSlot,
            startTime: state.formData.timeSlot.startTime.toISOString(),
            endTime: state.formData.timeSlot.endTime.toISOString(),
          } : null,
        },
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.formData.date) {
          state.formData.date = new Date(state.formData.date as unknown as string);
        }
        if (state?.formData.timeSlot) {
          state.formData.timeSlot = {
            ...state.formData.timeSlot,
            startTime: new Date(state.formData.timeSlot.startTime as unknown as string),
            endTime: new Date(state.formData.timeSlot.endTime as unknown as string),
          };
        }
      },
    }
  )
);
