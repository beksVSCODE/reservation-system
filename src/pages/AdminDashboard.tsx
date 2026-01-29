import { useEffect, useState } from 'react';
import { Header } from '@/widgets/Header';
import { useAuthStore, mockAuthApi } from '@/features/auth';
import { api } from '@/shared/api/client';
import { AuthUser } from '@/shared/types/auth';
import { Booking, Service, Specialist } from '@/shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/shared/ui/Spinner';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';

interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  activeBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  totalRevenue: number;
  bookingsByService: Record<string, number>;
  bookingsBySpecialist: Record<string, number>;
}

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [usersData, bookingsData, servicesData, specialistsData] = await Promise.all([
          mockAuthApi.getAllUsers(),
          api.getBookings(undefined, 'admin'), // Admin sees all bookings
          api.getServices(),
          api.getSpecialists(),
        ]);

        setUsers(usersData);
        setBookings(bookingsData);
        setServices(servicesData);
        setSpecialists(specialistsData);

        // Calculate stats
        const activeBookings = bookingsData.filter(b => b.status === 'active');
        const cancelledBookings = bookingsData.filter(b => b.status === 'cancelled');
        const completedBookings = bookingsData.filter(b => b.status === 'completed');

        const bookingsByService: Record<string, number> = {};
        const bookingsBySpecialist: Record<string, number> = {};

        bookingsData.forEach(booking => {
          bookingsByService[booking.serviceId] = (bookingsByService[booking.serviceId] || 0) + 1;
          bookingsBySpecialist[booking.specialistId] = (bookingsBySpecialist[booking.specialistId] || 0) + 1;
        });

        // Calculate revenue from active and completed bookings
        const revenueBookings = [...activeBookings, ...completedBookings];
        const totalRevenue = revenueBookings.reduce((sum, booking) => {
          const service = servicesData.find(s => s.id === booking.serviceId);
          return sum + (service?.price || 0);
        }, 0);

        setStats({
          totalUsers: usersData.length,
          totalBookings: bookingsData.length,
          activeBookings: activeBookings.length,
          cancelledBookings: cancelledBookings.length,
          completedBookings: completedBookings.length,
          totalRevenue,
          bookingsByService,
          bookingsBySpecialist,
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner size="lg" />
          </div>
        </main>
      </div>
    );
  }

  const getServiceName = (serviceId: string) => {
    return services.find(s => s.id === serviceId)?.name || serviceId;
  };

  const getSpecialistName = (specialistId: string) => {
    return specialists.find(s => s.id === specialistId)?.name || specialistId;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Панель администратора</h1>
            <p className="text-muted-foreground mt-1">
              Добро пожаловать, {user?.name}. Вот обзор системы бронирования.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Зарегистрировано в системе
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего бронирований</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalBookings}</div>
                <p className="text-xs text-muted-foreground">
                  За всё время
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Активные записи</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats?.activeBookings}</div>
                <p className="text-xs text-muted-foreground">
                  Ожидают выполнения
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Общий доход</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalRevenue.toLocaleString('ru-RU')} с</div>
                <p className="text-xs text-muted-foreground">
                  От активных и завершённых
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status Breakdown */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card className="border-l-4 border-l-primary/70">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{stats?.completedBookings}</p>
                    <p className="text-sm text-muted-foreground">Завершено</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-accent-foreground/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-accent-foreground/70" />
                  <div>
                    <p className="text-2xl font-bold">{stats?.activeBookings}</p>
                    <p className="text-sm text-muted-foreground">Активные</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-destructive">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <XCircle className="h-8 w-8 text-destructive" />
                  <div>
                    <p className="text-2xl font-bold">{stats?.cancelledBookings}</p>
                    <p className="text-sm text-muted-foreground">Отменено</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {/* Bookings by Service */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Бронирования по услугам
                </CardTitle>
                <CardDescription>Распределение записей по типам услуг</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats && Object.entries(stats.bookingsByService).map(([serviceId, count]) => {
                    const service = services.find(s => s.id === serviceId);
                    const percentage = Math.round((count / stats.totalBookings) * 100);
                    return (
                      <div key={serviceId} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{getServiceName(serviceId)}</span>
                          <span className="font-medium">{count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {(!stats || Object.keys(stats.bookingsByService).length === 0) && (
                    <p className="text-sm text-muted-foreground">Нет данных</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bookings by Specialist */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Нагрузка специалистов
                </CardTitle>
                <CardDescription>Распределение записей по специалистам</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats && Object.entries(stats.bookingsBySpecialist).map(([specialistId, count]) => {
                    const percentage = Math.round((count / stats.totalBookings) * 100);
                    return (
                      <div key={specialistId} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{getSpecialistName(specialistId)}</span>
                          <span className="font-medium">{count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-accent-foreground/50 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {(!stats || Object.keys(stats.bookingsBySpecialist).length === 0) && (
                    <p className="text-sm text-muted-foreground">Нет данных</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Пользователи системы
              </CardTitle>
              <CardDescription>Все зарегистрированные пользователи</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium">Имя</th>
                      <th className="text-left py-3 px-2 font-medium">Email</th>
                      <th className="text-left py-3 px-2 font-medium">Телефон</th>
                      <th className="text-left py-3 px-2 font-medium">Роль</th>
                      <th className="text-left py-3 px-2 font-medium">Дата регистрации</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b last:border-0">
                        <td className="py-3 px-2">{u.name}</td>
                        <td className="py-3 px-2 text-muted-foreground">{u.email}</td>
                        <td className="py-3 px-2 text-muted-foreground">{u.phone || '—'}</td>
                        <td className="py-3 px-2">
                          <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                            {u.role === 'admin' ? 'Администратор' : 'Пользователь'}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {format(new Date(u.createdAt), 'd MMM yyyy', { locale: ru })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Последние бронирования
              </CardTitle>
              <CardDescription>Все записи в системе</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium">Услуга</th>
                      <th className="text-left py-3 px-2 font-medium">Специалист</th>
                      <th className="text-left py-3 px-2 font-medium">Дата и время</th>
                      <th className="text-left py-3 px-2 font-medium">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 10).map((booking) => (
                      <tr key={booking.id} className="border-b last:border-0">
                        <td className="py-3 px-2">{getServiceName(booking.serviceId)}</td>
                        <td className="py-3 px-2">{getSpecialistName(booking.specialistId)}</td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {format(new Date(booking.startTime), 'd MMM yyyy, HH:mm', { locale: ru })}
                        </td>
                        <td className="py-3 px-2">
                          <Badge 
                            variant={
                              booking.status === 'active' ? 'default' :
                              booking.status === 'completed' ? 'secondary' :
                              'destructive'
                            }
                          >
                            {booking.status === 'active' ? 'Активна' :
                             booking.status === 'completed' ? 'Завершена' :
                             'Отменена'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-muted-foreground">
                          Нет бронирований
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
