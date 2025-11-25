import { Response } from 'express';
import { asyncHandler, HandlerException } from '../../core/error-handler.js';
import { Req } from '../../core/interfaces.js';
import { logger } from '../../core/logger.js';
import {
  getPaginationParams,
  PaginationParams,
} from '../../core/pagination.dto.js';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './workspaces.dto.js';
import { WorkspacesService } from './workspaces.service.js';

/**
 * @openapi
 * /workspaces:
 *   get:
 *     summary: Получить воркспейсы
 *     tags:
 *       - Workspaces
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
 *         description: Список воркспейсов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WorkspaceResponse'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
export class WorkspacesController {
  constructor(private service: WorkspacesService) {}

  getAll = asyncHandler(
    async (req: Req<{}, {}, PaginationParams>, res: Response) => {
      const { page, limit } = getPaginationParams(
        req.query.page,
        req.query.limit,
      );

      const result = await this.service.getAll(page, limit);

      res.json(result);
    },
  );

  /**
   * @openapi
   * /workspaces/{id}:
   *   get:
   *     summary: Получить воркспейс по идентификатору
   *     tags:
   *       - Workspaces
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Данные воркспейса
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/WorkspaceResponse'
   */
  getById = asyncHandler(async (req: Req<{ id: string }>, res: Response) => {
    const { id } = req.params;

    const workspace = await this.service.getById(id);
    if (!workspace) {
      throw new HandlerException(404, 'Воркспейс не найден');
    }

    res.json(workspace);
  });

  /**
   * @openapi
   * /workspaces:
   *   post:
   *     summary: Создать воркспейс
   *     tags:
   *       - Workspaces
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
   *     responses:
   *       201:
   *         description: Воркспейс создан
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/WorkspaceResponse'
   */
  create = asyncHandler(
    async (req: Req<{}, CreateWorkspaceDto>, res: Response) => {
      const body = req.body;

      const workspace = await this.service.create({
        name: body.name,
        authorId: req.user.id,
      });

      logger.info('Workspace created', {
        workspaceId: workspace.id,
        userId: req.user.id,
      });
      res.status(200).json(workspace);
    },
  );

  /**
   * @openapi
   * /workspaces/{id}:
   *   put:
   *     summary: Редактировать воркспейс
   *     tags:
   *       - Workspaces
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
   *     responses:
   *       200:
   *         description: Воркспейс обновлен
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/WorkspaceResponse'
   */
  update = asyncHandler(
    async (req: Req<{ id: string }, UpdateWorkspaceDto>, res: Response) => {
      const { id } = req.params;

      const workspace = await this.service.update(id, req.body);
      if (!workspace) {
        throw new HandlerException(404, 'Воркспейс не найден');
      }

      logger.info('Workspace updated', { workspaceId: id });
      res.json(workspace);
    },
  );

  /**
   * @openapi
   * /workspaces/{id}:
   *   delete:
   *     summary: Удалить воркспейс
   *     tags:
   *       - Workspaces
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Воркспейс удален
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/WorkspaceResponse'
   */
  delete = asyncHandler(async (req: Req<{ id: string }>, res: Response) => {
    const { id } = req.params;

    const workspace = await this.service.delete(id);
    if (!workspace) {
      throw new HandlerException(404, 'Воркспейс не найден');
    }

    logger.info('Workspace deleted', { workspaceId: id });
    res.json(workspace);
  });
}
