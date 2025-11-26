import { Request, Response } from 'express';
import { getUserBySession } from '../../core/auth/auth.guard.js';
import authService from '../../core/auth/auth.service.js';
import { clearSession, getSession, setSession } from '../../core/cookies.js';
import { HandlerException } from '../../core/error-handler.js';
import { logger } from '../../core/logger.js';
import { UserStatus } from '../users/users.model.js';
import { UsersService } from '../users/users.service.js';
import { AuthResponse, LoginDto, SignupDto } from './auth.dto.js';

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     summary: Регистрация (система доступна без регистрации)
 *     description: Если у пользователя есть сессия ввиде анонима, то данные пишутся в этого пользователя
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - login
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               login:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Пользователь зарегистрирован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */
export class AuthController {
  constructor(private usersService: UsersService) {}

  signup = async (req: Request<{}, {}, SignupDto>, res: Response) => {
    const { name, login, password } = req.body;
    const session = getSession(req);
    let user;

    if (session) {
      try {
        user = await getUserBySession(session);

        if (user?.status === UserStatus.AUTHORIZED) {
          throw new HandlerException(401, 'Пользователь уже авторизован');
        }
      } catch (e) {
        logger.debug('Session is invalid', e);
        clearSession(res);
      }
    }

    if (login && (await this.usersService.findByLogin(login, user?.id))) {
      throw new HandlerException(400, 'Логин должен быть уникальным');
    }

    const userAuthored = await this.usersService.upsert({
      id: user?.id,
      name,
      login,
      password,
      status: UserStatus.AUTHORIZED,
    });

    const { accessToken, refreshToken } = await authService.login(
      userAuthored.id,
      password,
      userAuthored.password,
    );

    const response: AuthResponse = {
      accessToken,
      refreshToken,
      userId: userAuthored.id,
    };

    await setSession(res, response);

    logger.info('User signed up', {
      userId: userAuthored.id,
      login: userAuthored.login,
    });
    res.status(200).json(response);
  };

  /**
   * @openapi
   * /auth/login:
   *   post:
   *     summary: Вход
   *     tags:
   *       - Auth
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - login
   *               - password
   *             properties:
   *               login:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Ok
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   */
  login = async (req: Request<{}, {}, LoginDto>, res: Response) => {
    const { login, password } = req.body;

    const user = await this.usersService.findByLogin(login);
    if (!user || user.status !== UserStatus.AUTHORIZED) {
      throw new HandlerException(401, 'Неверные учетные данные');
    }

    try {
      const { accessToken, refreshToken } = await authService.login(
        user.id,
        password,
        user.password,
      );

      const response: AuthResponse = {
        accessToken,
        refreshToken,
        userId: user.id,
      };

      logger.info('User logged in', { userId: user.id, login: user.login });
      res.json(response);
    } catch (error) {
      logger.warn('Login failed', { login, error: (error as Error).message });
      throw new HandlerException(401, 'Неверные учетные данные');
    }
  };

  /**
   * @openapi
   * /auth/refresh-token:
   *   post:
   *     summary: Рефреш токен
   *     description: проверятся сессия в куках
   *     tags:
   *       - Auth
   *     responses:
   *       200:
   *         description: Токен обновлен
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   */
  refreshToken = async (req: Request, res: Response) => {
    const session = getSession(req);

    if (!session) {
      throw new HandlerException(400, 'Сессия не существует');
    }

    try {
      const { accessToken, refreshToken } = await authService.refresh(
        session.userId,
        session.refreshToken,
      );

      setSession(res, {
        accessToken,
        refreshToken,
        userId: session.userId,
      });

      const response: AuthResponse = {
        accessToken,
        refreshToken,
        userId: session.userId,
      };

      logger.info('Token refreshed', { userId: session.userId });
      res.json(response);
    } catch (error) {
      logger.warn('Token refresh failed', error);
      throw new HandlerException(401, 'Неверный refresh токен');
    }
  };

  /**
   * @openapi
   * /auth/me:
   *   get:
   *     summary: Получить свой профиль
   *     tags:
   *       - Auth
   *     responses:
   *       200:
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponse'
   */
  getMe = async (req: Request, res: Response) => {
    res.json(req.user);
  };
}
