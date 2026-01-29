import { useBookingStore } from '@/features/booking';
import { ServiceSelector } from '@/widgets/ServiceSelector';
import { SpecialistSelector } from '@/widgets/SpecialistSelector';
import { DateTimeSelector } from '@/widgets/DateTimeSelector';
import { BookingSummary } from '@/widgets/BookingSummary';
import { StepIndicator } from '@/shared/ui/StepIndicator';
import { BookingStep } from '@/shared/types';
import { Header } from '@/widgets/Header';

const STEPS = [
  { id: 'service' as const, label: 'Услуга' },
  { id: 'specialist' as const, label: 'Специалист' },
  { id: 'datetime' as const, label: 'Дата и время' },
  { id: 'confirm' as const, label: 'Подтверждение' },
];

const BookingPage = () => {
  const {
    currentStep,
    formData,
    lockExpiresAt,
    setStep,
    setService,
    setSpecialist,
    setDate,
    setTimeSlot,
    setLockedSlot,
    getCompletedSteps,
  } = useBookingStore();

  const completedSteps = getCompletedSteps();

  const handleStepClick = (stepId: string) => {
    const step = stepId as BookingStep;
    const stepIndex = STEPS.findIndex((s) => s.id === step);
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

    // Can only go back or to completed steps
    if (stepIndex <= currentIndex || completedSteps.includes(step)) {
      setStep(step);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'service':
        return (
          <ServiceSelector
            selectedService={formData.service}
            onSelect={(service) => setService(service)}
          />
        );

      case 'specialist':
        if (!formData.service) {
          setStep('service');
          return null;
        }
        return (
          <SpecialistSelector
            service={formData.service}
            selectedSpecialist={formData.specialist}
            onSelect={(specialist) => setSpecialist(specialist)}
            onBack={() => setStep('service')}
          />
        );

      case 'datetime':
        if (!formData.service || !formData.specialist) {
          setStep('specialist');
          return null;
        }
        return (
          <DateTimeSelector
            service={formData.service}
            specialist={formData.specialist}
            selectedDate={formData.date}
            selectedSlot={formData.timeSlot}
            onDateSelect={(date) => setDate(date)}
            onSlotSelect={(slot) => {
              setTimeSlot(slot);
              if (slot.lockedUntil) {
                setLockedSlot(slot.id, slot.lockedUntil);
              }
            }}
            onBack={() => setStep('specialist')}
          />
        );

      case 'confirm':
        if (!formData.service || !formData.specialist || !formData.date || !formData.timeSlot) {
          setStep('datetime');
          return null;
        }
        return (
          <BookingSummary
            service={formData.service}
            specialist={formData.specialist}
            date={formData.date}
            timeSlot={formData.timeSlot}
            onBack={() => setStep('datetime')}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <StepIndicator
            steps={STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
          />
        </div>

        <div className="max-w-4xl mx-auto">{renderStep()}</div>
      </main>
    </div>
  );
};

export default BookingPage;
