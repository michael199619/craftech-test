import { Request, Response } from 'express';
import { HandlerException } from '../../core/error-handler.js';
import { logger } from '../../core/logger.js';
import {
  getPaginationParams,
  PaginationParams,
} from '../../core/pagination.dto.js';
import { UpsertUserDto } from './users.dto.js';
import { UsersService } from './users.service.js';

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Получить всех пользователей
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserResponse'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
export class UsersController {
  constructor(private service: UsersService) {}

  getAll = async (
    req: Request<{}, {}, {}, PaginationParams>,
    res: Response,
  ) => {
    const { page, limit } = getPaginationParams(
      req.query.page,
      req.query.limit,
    );

    const result = await this.service.getAll(page, limit);

    res.json(result);
  };

  /**
   * @openapi
   * /users/{id}:
   *   get:
   *     summary: Получить пользователя по идентификатору
   *     tags:
   *       - Users
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Данные пользователя
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponse'
   */
  getById = async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    const user = await this.service.getById(id, false);

    if (!user) {
      throw new HandlerException(404, 'Пользователь не найден');
    }

    res.json(user);
  };

  /**
   * @openapi
   * /users/{id}:
   *   put:
   *     summary: Редактировать пользователя
   *     tags:
   *       - Users
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               login:
   *                 type: string
   *               password:
   *                 type: string
   *               status:
   *                 type: string
   *     responses:
   *       200:
   *         description: Пользователь обновлен
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponse'
   */
  update = async (
    req: Request<{ id: string }, {}, UpsertUserDto>,
    res: Response,
  ) => {
    const { id } = req.params;
    const body = req.body;

    const user = await this.service.getById(id, false);

    if (!user) {
      throw new HandlerException(404, 'Пользователь не найден');
    }

    if (body.login && (await this.service.findByLogin(body.login, id))) {
      throw new HandlerException(400, 'Логин должен быть уникальным');
    }

    await this.service.upsert({ ...body, id });

    logger.info('User updated', { userId: id });
    res.json(user);
  };

  /**
   * @openapi
   * /users/{id}:
   *   delete:
   *     summary: Удалить пользователя
   *     tags:
   *       - Users
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   */
  delete = async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    const user = await this.service.getById(id, false);

    if (!user) {
      throw new HandlerException(404, 'Пользователь не найден');
    }

    await this.service.delete(id);

    logger.info('User deleted', { userId: id });
    res.status(200).json({ message: 'Пользователь удален' });
  };
}
