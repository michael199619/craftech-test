import { UserStatus } from './users.model.js';

export interface CreateUserDto {
  name: string;
  login: string;
  password: string;
}

export interface UpsertUserDto {
  id?: string;
  name?: string;
  login?: string;
  password: string;
  status: UserStatus;
}

export interface UserResponseWithPassword extends UserResponse {
  password: string;
}

export interface UserResponse {
  id: string;
  name: string;
  login: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}
