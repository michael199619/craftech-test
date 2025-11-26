import authService from '../../core/auth/auth.service.js';
import {
  UpsertUserDto,
  UserResponse,
  UserResponseWithPassword,
} from './users.dto.js';
import { User } from './users.model.js';
import { UsersRepository } from './users.repository.js';

export class UsersService {
  constructor(private repo: UsersRepository) {}

  async getAll(page: number = 1, limit: number = 20) {
    const result = await this.repo.findAll(page, limit);

    return {
      data: result.data.map(this.mapToResponse),
      pagination: result.pagination,
    };
  }

  async getById(
    id: string,
    selectPassword: boolean = true,
  ): Promise<UserResponse | UserResponseWithPassword | null> {
    const user = await this.repo.findById(id, selectPassword);
    return user ? this.mapToResponse(user) : null;
  }

  async findByLogin(login: string, id?: string) {
    return this.repo.findByLogin(login, id);
  }

  async upsert(data: UpsertUserDto): Promise<UserResponseWithPassword> {
    const dto: UpsertUserDto = {
      ...data,
    };

    if (data.password) {
      dto.password = await authService.getBcryptHashPassword(data.password);
    }

    return await this.repo.upsert(dto);
  }

  async delete(id: string): Promise<void> {
    const user = await this.repo.findById(id);

    if (!user) {
      return;
    }

    await this.repo.delete(id);
  }

  private mapToResponse(user: User): UserResponse {
    const { password, ...userData } = user.toJSON();
    return userData;
  }
}
