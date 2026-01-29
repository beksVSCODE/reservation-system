import { AuthUser, LoginCredentials, RegisterData, UserRole } from '@/shared/types/auth';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory user store (persisted via authStore)
const usersStore: Map<string, { user: AuthUser; password: string }> = new Map();

// Pre-populate with demo users
const initDemoUsers = () => {
    if (usersStore.size === 0) {
        // Admin user
        usersStore.set('admin@booking.com', {
            user: {
                id: 'admin-001',
                email: 'admin@booking.com',
                name: 'Администратор',
                phone: '+996 700 000 000',
                role: 'admin',
                createdAt: new Date('2024-01-01'),
            },
            password: 'admin123',
        });

        // Regular users
        usersStore.set('user@booking.com', {
            user: {
                id: 'user-001',
                email: 'user@booking.com',
                name: 'Иван Петров',
                phone: '+996 555 123 456',
                role: 'user',
                createdAt: new Date('2024-06-15'),
            },
            password: 'user123',
        });

        usersStore.set('user2@booking.com', {
            user: {
                id: 'user-002',
                email: 'user2@booking.com',
                name: 'Мария Сидорова',
                phone: '+996 777 234 567',
                role: 'user',
                createdAt: new Date('2024-07-20'),
            },
            password: 'user123',
        });

        usersStore.set('user3@booking.com', {
            user: {
                id: 'user-003',
                email: 'user3@booking.com',
                name: 'Алексей Иванов',
                phone: '+996 550 345 678',
                role: 'user',
                createdAt: new Date('2024-08-10'),
            },
            password: 'user123',
        });
    }
};

initDemoUsers();

export const mockAuthApi = {
    async login(credentials: LoginCredentials): Promise<AuthUser> {
        await delay(500 + Math.random() * 300);

        const stored = usersStore.get(credentials.email.toLowerCase());

        if (!stored) {
            throw new Error('Пользователь с таким email не найден');
        }

        if (stored.password !== credentials.password) {
            throw new Error('Неверный пароль');
        }

        return stored.user;
    },

    async register(data: RegisterData): Promise<AuthUser> {
        await delay(600 + Math.random() * 300);

        const emailLower = data.email.toLowerCase();

        if (usersStore.has(emailLower)) {
            throw new Error('Пользователь с таким email уже существует');
        }

        const newUser: AuthUser = {
            id: `user-${Date.now()}`,
            email: emailLower,
            name: data.name,
            phone: data.phone,
            role: 'user',
            createdAt: new Date(),
        };

        usersStore.set(emailLower, {
            user: newUser,
            password: data.password,
        });

        return newUser;
    },

    async logout(): Promise<void> {
        await delay(200);
        // In a real app, this would invalidate the session
    },

    async getCurrentUser(userId: string): Promise<AuthUser | null> {
        await delay(200);

        for (const [, stored] of usersStore) {
            if (stored.user.id === userId) {
                return stored.user;
            }
        }

        return null;
    },

    // Admin-only: get all users
    async getAllUsers(): Promise<AuthUser[]> {
        await delay(300);
        return Array.from(usersStore.values()).map(s => s.user);
    },

    // Admin-only: update user role
    async updateUserRole(userId: string, newRole: UserRole): Promise<AuthUser> {
        await delay(400);

        for (const [email, stored] of usersStore) {
            if (stored.user.id === userId) {
                const updatedUser = { ...stored.user, role: newRole };
                usersStore.set(email, { ...stored, user: updatedUser });
                return updatedUser;
            }
        }

        throw new Error('Пользователь не найден');
    },
};
