import { Response } from 'express';
import { asyncHandler, HandlerException } from '../../core/error-handler.js';
import { Req } from '../../core/interfaces.js';
import { logger } from '../../core/logger.js';
import {
  getPaginationParams,
  PaginationParams,
} from '../../core/pagination.dto.js';
import { WorkspacesService } from '../workspaces/workspaces.service.js';
import { CreateBoardDto, GetByIdDto, UpdateBoardDto } from './boards.dto.js';
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

  getAll = asyncHandler(
    async (req: Req<{}, {}, PaginationParams>, res: Response) => {
      const { page, limit } = getPaginationParams(
        req.query.page,
        req.query.limit,
      );

      const result = await this.service.getAll(req.user.id, page, limit);
      res.json(result);
    },
  );

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
  getById = asyncHandler(
    async (req: Req<{ id: string }, {}, GetByIdDto>, res: Response) => {
      const { id } = req.params;
      const width = Number(req.query.width);
      const height = Number(req.query.height);

      const board = await this.service.getById(id, { width, height });

      if (!board) {
        throw new HandlerException(404, 'Доска не найдена');
      }

      res.json(board);
    },
  );

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
   *       201:
   *         description: Доска создана
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/BoardResponse'
   */
  create = asyncHandler(async (req: Req<{}, CreateBoardDto>, res: Response) => {
    const body = req.body;

    if (
      body.workspaceId &&
      !(await this.workspaceService.getById(body.workspaceId))
    ) {
      throw new HandlerException(404, 'Workspace не найден');
    }

    const board = await this.service.create({
      name: body.name,
      workspaceId: body.workspaceId,
      private: body.private,
      authorId: req.user.id,
    });

    logger.info('Board created', { boardId: board.id, userId: req.user.id });
    res.status(200).json(board);
  });

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
  update = asyncHandler(
    async (req: Req<{ id: string }, UpdateBoardDto>, res: Response) => {
      const { id } = req.params;
      const body = req.body;

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
    },
  );

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
  delete = asyncHandler(async (req: Req<{ id: string }>, res: Response) => {
    const { id } = req.params;

    const board = await this.service.delete(id, req.user.id);
    if (!board) {
      throw new HandlerException(404, 'Доска не найдена');
    }

    logger.info('Board deleted', { boardId: id });
    res.status(200).json();
  });

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
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/History'
   *                 pagination:
   *                   $ref: '#/components/schemas/Pagination'
   */
  getHistory = asyncHandler(
    async (req: Req<{ id: string }, {}, PaginationParams>, res: Response) => {
      const { id } = req.params;

      const { page, limit } = getPaginationParams(
        req.query.page,
        req.query.limit,
      );

      const history = await this.service.getHistory(id, page, limit);

      res.json(history);
    },
  );
}
