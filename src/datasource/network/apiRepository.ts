import { toAuthSession, toPaginatedUsers } from '@/models/model.map';
import type { ApiAuthResponse, ApiUserResponse } from '@/models/model.response';
import type {
  AuthSession,
  LoginCredentials,
  PaginatedResult,
  RegisterCredentials,
  User,
} from '@/models/model.type';

const MOCK_ADMIN_EMAIL = 'admin@mail.com';
const MOCK_ADMIN_PASSWORD = 'password123';

const MOCK_ADMIN_USER: ApiUserResponse = {
  id: 'usr_001',
  email: MOCK_ADMIN_EMAIL,
  full_name: 'Admin User',
  role: 'admin',
  avatar_url: null,
  created_at: '2024-01-15T08:00:00.000Z',
  is_active: true,
};

const MOCK_TOKEN = 'mock_jwt_token_admin_session_2024';

function createMockAuthResponse(user: ApiUserResponse): ApiAuthResponse {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  return {
    token: MOCK_TOKEN,
    user,
    expires_at: expiresAt.toISOString(),
  };
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class ValidationError extends Error {
  field: string;

  constructor(field: string, message: string) {
    super(message);
    this.field = field;
    this.name = 'ValidationError';
  }
}

export const apiRepository = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    await delay(800);

    if (!credentials.email.trim()) {
      throw new ValidationError('email', 'Email is required');
    }
    if (!validateEmail(credentials.email)) {
      throw new ValidationError('email', 'Please enter a valid email address');
    }
    if (!credentials.password) {
      throw new ValidationError('password', 'Password is required');
    }

    if (credentials.email === MOCK_ADMIN_EMAIL && credentials.password === MOCK_ADMIN_PASSWORD) {
      return toAuthSession(createMockAuthResponse(MOCK_ADMIN_USER));
    }

    throw new ValidationError('credentials', 'Invalid email or password');
  },

  async register(credentials: RegisterCredentials): Promise<AuthSession> {
    await delay(800);

    if (!credentials.email.trim()) {
      throw new ValidationError('email', 'Email is required');
    }
    if (!validateEmail(credentials.email)) {
      throw new ValidationError('email', 'Please enter a valid email address');
    }
    if (!credentials.password) {
      throw new ValidationError('password', 'Password is required');
    }
    if (credentials.password.length < 6) {
      throw new ValidationError('password', 'Password must be at least 6 characters');
    }
    if (credentials.password !== credentials.confirmPassword) {
      throw new ValidationError('confirmPassword', 'Passwords do not match');
    }

    const newUser: ApiUserResponse = {
      id: `usr_${Date.now()}`,
      email: credentials.email,
      full_name: credentials.email.split('@')[0],
      role: 'user',
      avatar_url: null,
      created_at: new Date().toISOString(),
      is_active: true,
    };

    return toAuthSession(createMockAuthResponse(newUser));
  },

  async getUsers(page: number, pageSize: number): Promise<PaginatedResult<User>> {
    await delay(600);

    const mockUsers: ApiUserResponse[] = [
      MOCK_ADMIN_USER,
      {
        id: 'usr_002',
        email: 'john.doe@mail.com',
        full_name: 'John Doe',
        role: 'user',
        avatar_url: null,
        created_at: '2024-02-20T10:30:00.000Z',
        is_active: true,
      },
      {
        id: 'usr_003',
        email: 'jane.smith@mail.com',
        full_name: 'Jane Smith',
        role: 'moderator',
        avatar_url: null,
        created_at: '2024-03-10T14:15:00.000Z',
        is_active: true,
      },
      {
        id: 'usr_004',
        email: 'bob.wilson@mail.com',
        full_name: 'Bob Wilson',
        role: 'user',
        avatar_url: null,
        created_at: '2024-04-05T09:00:00.000Z',
        is_active: false,
      },
      {
        id: 'usr_005',
        email: 'alice.brown@mail.com',
        full_name: 'Alice Brown',
        role: 'user',
        avatar_url: null,
        created_at: '2024-05-12T16:45:00.000Z',
        is_active: true,
      },
      {
        id: 'usr_006',
        email: 'test@mail.com',
        full_name: 'Test Brown',
        role: 'user',
        avatar_url: null,
        created_at: '2023-05-12T16:45:00.000Z',
        is_active: true,
      },
    ];

    const start = (page - 1) * pageSize;
    const paginatedData = mockUsers.slice(start, start + pageSize);

    return toPaginatedUsers({
      data: paginatedData,
      total: mockUsers.length,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(mockUsers.length / pageSize),
    });
  },

  async logout(): Promise<void> {
    await delay(300);
  },

  async getDashboardStats() {
    await delay(500);
    return {
      stats: [
        {
          id: 'stat_users',
          label_key: 'dashboard.totalUsers',
          value: 128,
          change_percent: 12,
          trend: 'up' as const,
        },
        {
          id: 'stat_sessions',
          label_key: 'dashboard.activeSessions',
          value: 42,
          change_percent: 5,
          trend: 'up' as const,
        },
        {
          id: 'stat_activity',
          label_key: 'dashboard.recentActivity',
          value: 89,
          change_percent: 18,
          trend: 'up' as const,
        },
      ],
      updated_at: new Date().toISOString(),
    };
  },

  async getRevenueChart() {
    await delay(600);
    return {
      id: 'chart_revenue',
      title_key: 'dashboard.charts.revenue',
      unit: 'M',
      data: [
        { label: 'Jan', value: 4.2 },
        { label: 'Feb', value: 5.1 },
        { label: 'Mar', value: 4.8 },
        { label: 'Apr', value: 6.3 },
        { label: 'May', value: 7.0 },
        { label: 'Jun', value: 8.2 },
      ],
    };
  },

  async getActivityChart() {
    await delay(550);
    return {
      id: 'chart_activity',
      title_key: 'dashboard.charts.activity',
      data: [
        { label: 'Mon', value: 24 },
        { label: 'Tue', value: 38 },
        { label: 'Wed', value: 31 },
        { label: 'Thu', value: 45 },
        { label: 'Fri', value: 52 },
        { label: 'Sat', value: 18 },
        { label: 'Sun', value: 12 },
      ],
    };
  },

  async getUserDistributionChart() {
    await delay(650);
    return {
      id: 'chart_distribution',
      title_key: 'dashboard.charts.userDistribution',
      total: 128,
      segments: [
        { label_key: 'dashboard.charts.admin', value: 12, color_token: 'primary' },
        { label_key: 'dashboard.charts.moderator', value: 18, color_token: 'accent' },
        { label_key: 'dashboard.charts.user', value: 98, color_token: 'success' },
      ],
    };
  },
};
