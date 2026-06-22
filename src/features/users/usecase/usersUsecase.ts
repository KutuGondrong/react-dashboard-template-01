import { apiRepository } from '@/datasource/network/apiRepository';
import type { PaginatedResult, User } from '@/models/model.type';

export const usersUsecase = {
  async getUsers(page: number, pageSize: number): Promise<PaginatedResult<User>> {
    return apiRepository.getUsers(page, pageSize);
  },
};
