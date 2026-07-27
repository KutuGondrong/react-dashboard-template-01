import { backendService } from './services/backendService';
import type {
  ApiAuthResponse,
  ApiErrorResponse,
  ApiUserListResponse,
} from '@/models/model.response';

export const apiSource = {
  async login(email: string, password: string): Promise<ApiAuthResponse> {
    const response = await backendService.post<ApiAuthResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async register(email: string, password: string): Promise<ApiAuthResponse> {
    const response = await backendService.post<ApiAuthResponse>('/auth/register', {
      email,
      password,
    });
    return response.data;
  },

  async getUsers(page: number, pageSize: number): Promise<ApiUserListResponse> {
    const response = await backendService.get<ApiUserListResponse>('/users', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  async logout(): Promise<void> {
    await backendService.post('/auth/logout');
  },
};

export function isApiError(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as ApiErrorResponse).message === 'string'
  );
}
