import { Request, Response } from 'express';
import { HandlerException } from '../../core/error-handler.js';
import { logger } from '../../core/logger.js';
import { paths } from '../../core/types/api-types.js';
import { WorkspacesService } from '../workspaces/workspaces.service.js';
import {
  BoardResponse,
  BoardWithStickersResponse,
  CreateBoardDto,
  GetAllResponse,
  GetByIdDto,
  GetHistoryResponse,
  UpdateBoardDto,
} from './boards.dto.js';
import { BoardsService } from './boards.service.js';

/**
 * @openapi
 * /boards:
 *   get:
 *     summary: Получить все доски
 *     description: Исключает все воркспейсы
 *     tags:
 *       - Boards
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
 *         description: Список досок
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: ['data', 'pagination']
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BoardResponse'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
export class BoardsController {
  constructor(
    private service: BoardsService,
    private workspaceService: WorkspacesService,
  ) {}

  getAll = async (
    req: Request<
      {},
      {},
      {},
      Required<paths['/boards']['get']['parameters']['query']>
    >,
    res: Response<GetAllResponse>,
  ) => {
    if (!req.user) {
      throw new HandlerException(403, 'Отказано в доступе');
    }

    const { page, limit } = req.query!;

    if (!req.user?.id) {
      throw new HandlerException(403, 'Отказано в доступе');
    }

    const result = await this.service.getAll(req.user.id, +page, +limit);
    res.json(result);
  };

  /**
   * @openapi
   * /boards/{id}:
   *   get:
   *     summary: Получить доску по идентификатору
   *     tags:
   *       - Boards
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: width
   *         summary: ширина вьюпорта
   *         schema:
   *           type: integer
   *           default: 1280
   *       - in: query
   *         summary: высота вьюпорта
   *         name: height
   *         schema:
   *           type: integer
   *           default: 740
   *     responses:
   *       200:
   *         description: Доска со стикерами, входящими во вьюпорт
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/BoardWithStickersResponse'
   */
  getById = async (
    req: Request<
      paths['/boards/{id}']['get']['parameters']['path'],
      {},
      {},
      GetByIdDto
    >,
    res: Response<BoardWithStickersResponse>,
  ) => {
    const { id } = req.params;
    const { width = 1280, height = 740 } = req.query!;

    const board = await this.service.getById(id, {
      width: +width,
      height: +height,
    });

    if (!board) {
      throw new HandlerException(404, 'Доска не найдена');
    }

    res.json(board);
  };

  /**
   * @openapi
   * /boards:
   *   post:
   *     summary: Создать доску
   *     tags:
   *       - Boards
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *               private:
   *                 type: boolean
   *               workspaceId:
   *                 type: string
   *                 format: uuid
   *     responses:
   *       200:
   *         description: Доска создана
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/BoardResponse'
   */
  create = async (
    req: Request<{}, {}, CreateBoardDto>,
    res: Response<BoardResponse>,
  ) => {
    const body = req.body;

    if (!req.user) {
      throw new HandlerException(403, 'Отказано в доступе');
    }

    if (
      body.workspaceId &&
      !(await this.workspaceService.getById(body.workspaceId))
    ) {
      throw new HandlerException(404, 'Workspace не найден');
    }

    if (!req.user?.id) {
      throw new HandlerException(403, 'Отказано в доступе');
    }

    const board = await this.service.create({
      name: body.name,
      workspaceId: body.workspaceId,
      private: body.private,
      authorId: req.user.id,
    });

    logger.info('Board created', { boardId: board.id, userId: req.user.id });
    res.status(200).json(board);
  };

  /**
   * @openapi
   * /boards/{id}:
   *   put:
   *     summary: Редактировать доску
   *     tags:
   *       - Boards
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
   *               private:
   *                 type: boolean
   *               workspaceId:
   *                 type: string
   *                 format: uuid
   *     responses:
   *       200:
   *         description: Доска обновлена
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/BoardResponse'
   */
  update = async (
    req: Request<
      paths['/boards/{id}']['put']['parameters']['path'],
      {},
      UpdateBoardDto
    >,
    res: Response<BoardResponse>,
  ) => {
    const { id } = req.params;
    const body = req.body;

    if (!req.user) {
      throw new HandlerException(403, 'Отказано в доступе');
    }

    if (
      body?.workspaceId &&
      !(await this.workspaceService.getById(body.workspaceId))
    ) {
      throw new HandlerException(404, 'Workspace не найден');
    }

    const board = await this.service.update(id, body, req.user.id);
    if (!board) {
      throw new HandlerException(404, 'Доска не найдена');
    }

    logger.info('Board updated', { boardId: id });
    res.json(board);
  };

  /**
   * @openapi
   * /boards/{id}:
   *   delete:
   *     summary: Удалить доску
   *     tags:
   *       - Boards
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   */
  delete = async (
    req: Request<paths['/boards/{id}']['delete']['parameters']['path']>,
    res: Response<void>,
  ) => {
    const { id } = req.params;

    if (!req.user) {
      throw new HandlerException(403, 'Отказано в доступе');
    }

    if (!(await this.service.getById(id, { height: 0, width: 0 }))) {
      throw new HandlerException(404, 'Доска не найдена');
    }

    await this.service.delete(id, req.user.id);

    logger.info('Board deleted', { boardId: id });
    res.status(200).json();
  };

  /**
   * @openapi
   * /boards/{id}/history:
   *   get:
   *     summary: Получить действия по доске
   *     tags:
   *       - Boards
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
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
   *         description: Список действий по доске
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               required: ['data', 'pagination']
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/History'
   *                 pagination:
   *                   $ref: '#/components/schemas/Pagination'
   */
  getHistory = async (
    req: Request<
      paths['/boards/{id}/history']['get']['parameters']['path'],
      {},
      {},
      Required<paths['/boards/{id}/history']['get']['parameters']['query']>
    >,
    res: Response<GetHistoryResponse>,
  ) => {
    const { id } = req.params;
    const { page, limit } = req.query!;

    const history = await this.service.getHistory(id, +page, +limit);

    res.status(200).json(history);
  };
}
