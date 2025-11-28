import { paths } from '../../core/types/api-types.js';

export type UpsertUserDto =
  paths['/users/{id}']['put']['requestBody']['content']['application/json'] & {
    id?: string;
  };

export interface UserResponseWithPassword extends UserResponse {
  password: string;
}

export type UserResponse =
  paths['/users/{id}']['get']['responses']['200']['content']['application/json'] & {};

export type GetAllResponse =
  paths['/users']['get']['responses']['200']['content']['application/json'] & {};

export type DeleteUserResponse =
  | paths['/users/{id}']['delete']['responses']['200']['content']['application/json']
  | {};
