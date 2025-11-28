import { paths } from '../../core/types/api-types.js';

export type SignupDto =
  paths['/auth/signup']['post']['requestBody']['content']['application/json'] & {};

export type LoginDto =
  paths['/auth/login']['post']['requestBody']['content']['application/json'] & {};

export type AuthResponse =
  paths['/auth/login']['post']['responses']['200']['content']['application/json'] & {};
