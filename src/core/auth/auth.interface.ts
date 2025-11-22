import { SignOptions } from 'jsonwebtoken';

export enum TokenType {
  OK = 'OK',
  REVOKED = 'REVOKED',
  INVALID_VERSION = 'INVALID_VERSION',
}

export interface AuthOptions {
  accessExpiresIn: SignOptions['expiresIn'];
  refreshExpiresIn: SignOptions['expiresIn'];
  jwtSecret: string;
}

export interface RefreshPayload {
  sub: string;
  jti: string;
  sessionVersion: number;
  exp?: number;
}
