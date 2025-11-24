export interface SignupDto {
  name: string;
  login: string;
  password: string;
}

export interface LoginDto {
  login: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
}
