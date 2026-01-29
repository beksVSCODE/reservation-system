import { Link } from 'react-router-dom';
import { Header } from '@/widgets/Header';
import { ServiceSelector } from '@/widgets/ServiceSelector';
import { useBookingStore } from '@/features/booking';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Clock, Shield, Users } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const setService = useBookingStore((s) => s.setService);

  const features = [
    {
      icon: Calendar,
      title: 'Удобное расписание',
      description: 'Выбирайте удобное время из доступных слотов',
    },
    {
      icon: Users,
      title: 'Выбор специалиста',
      description: 'Записывайтесь к понравившемуся специалисту',
    },
    {
      icon: Clock,
      title: 'Временная блокировка',
      description: 'Слот резервируется на 5 минут для вашего удобства',
    },
    {
      icon: Shield,
      title: 'Надёжность',
      description: 'Защита от двойных бронирований и конфликтов',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
              Онлайн-бронирование
              <br />
              <span className="text-primary">без лишних хлопот</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Выберите услугу, специалиста и удобное время. 
              Вся запись займёт менее минуты.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/booking')}
              className="gap-2"
            >
              Записаться сейчас
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16">
        <h2 className="text-2xl font-bold text-center mb-12">Как это работает</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 rounded-xl bg-card border transition-shadow hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Services Section */}
      <section className="container py-16 border-t">
        <div className="max-w-3xl mx-auto">
          <ServiceSelector
            selectedService={null}
            onSelect={(service) => {
              setService(service);
              navigate('/booking');
            }}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 BookingApp. Тестовое задание Frontend.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
