import { randomBytes } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserResponse } from '../../modules/users/users.dto.js';
import { UserStatus } from '../../modules/users/users.model.js';
import { UsersRepository } from '../../modules/users/users.repository.js';
import { UsersService } from '../../modules/users/users.service.js';
import { jwtConfig } from '../config.js';
import { getSession, Session, setSession } from '../cookies.js';
import { logger } from '../logger.js';
import { TokenType } from './auth.interface.js';
import authService from './auth.service.js';

const usersRepo = new UsersRepository();
const usersService = new UsersService(usersRepo);

export async function getUserBySession({
  accessToken,
}: Session): Promise<UserResponse | null> {
  const payload = jwt.verify(accessToken, jwtConfig.secret) as {
    sub: string;
    jti: string;
    sessionVersion?: number;
  };

  const validationResult = await authService.validateAccess(
    payload.sub,
    payload.jti,
    payload.sessionVersion,
  );

  if (validationResult === TokenType.OK) {
    return usersService.getById(payload.sub, false);
  }

  return null;
}

export const authGuard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = getSession(req);
    let user: UserResponse | null = null;

    if (session) {
      try {
        user = await getUserBySession(session);
      } catch (error) {
        logger.debug('Token validation failed', { error });
        throw error;
      }
    }

    if (!user) {
      const randomPassword = randomBytes(32).toString('hex');

      const hashedPassword =
        await authService.getBcryptHashPassword(randomPassword);

      const anonymousUser = await usersRepo.upsert({
        name: '',
        login: '',
        password: hashedPassword,
        status: UserStatus.ANONYMOUS,
      });

      const { payload, refreshToken, accessToken } =
        await authService.signTokens(anonymousUser.id);

      await authService.saveRefreshHash(
        anonymousUser.id,
        payload.jti,
        refreshToken,
        payload.exp!,
      );

      setSession(res, { accessToken, refreshToken, userId: anonymousUser.id });

      user = await usersService.getById(anonymousUser.id, false);

      logger.info('Anonymous user created', {
        userId: anonymousUser.id,
      });
    }

    req.user = user!;

    next();
  } catch (error) {
    logger.error('Auth guard error', { error });
    res.status(500).json({ error: error?.toString() });
  }
};
