import { apiRepository } from '@/datasource/network/apiRepository';
import type { AuthSession, LoginCredentials, RegisterCredentials } from '@/models/model.type';

export const authUsecase = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    return apiRepository.login(credentials);
  },

  async register(credentials: RegisterCredentials): Promise<AuthSession> {
    return apiRepository.register(credentials);
  },

  async logout(): Promise<void> {
    return apiRepository.logout();
  },
};
