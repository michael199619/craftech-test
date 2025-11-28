import { Request, Response } from 'express';
import { HandlerException } from '../../core/error-handler.js';
import { logger } from '../../core/logger.js';
import { paths } from '../../core/types/api-types.js';
import { BoardsService } from '../boards/boards.service.js';
import {
  CreateStickerDto,
  GetAllResponse,
  StickerResponse,
  UpdateStickerDto,
} from './stickers.dto.js';
import { StickersService } from './stickers.service.js';

/**
 * @openapi
 * /stickers:
 *   get:
 *     summary: Получить все стикеры
 *     tags:
 *       - Stickers
 *     parameters:
 *       - in: query
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: фильтр по доске
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
 *       - in: query
 *         name: exludes
 *         summary: Исключить те идентификаторы, которые были отрисованы
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *     responses:
 *       200:
 *         description: Список стикеров
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: ['data']
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/StickerResponse'
 */
export class StickersController {
  constructor(
    private service: StickersService,
    private boardsService: BoardsService,
  ) {}

  getAll = async (
    req: Request<
      {},
      {},
      {},
      Required<paths['/stickers']['get']['parameters']['query']>
    >,
    res: Response<GetAllResponse>,
  ) => {
    const { width, height, boardId, exludes } = req.query!;
    let ids: string[] = [];

    // bug of swagger
    if (exludes) {
      ids = Array.isArray(exludes) ? exludes : [exludes];
    }

    const result = await this.service.getAll({
      width: +width,
      height: +height,
      boardId: boardId,
      exludes: ids,
    });

    res.json(result);
  };

  /**
   * @openapi
   * /stickers:
   *   post:
   *     summary: Создать стикер
   *     tags:
   *       - Stickers
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - description
   *               - boardId
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               boardId:
   *                 type: string
   *                 format: uuid
   *               positionX:
   *                 type: number
   *                 default: 0
   *               positionY:
   *                 type: number
   *                 default: 0
   *               width:
   *                 type: number
   *                 default: 200
   *               height:
   *                 type: number
   *                 default: 200
   *               index:
   *                 type: number
   *                 default: 0
   *     responses:
   *       201:
   *         description: Стикер создан
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StickerResponse'
   */
  create = async (
    req: Request<{}, {}, CreateStickerDto>,
    res: Response<StickerResponse>,
  ) => {
    if (!req.user) {
      throw new HandlerException(403, 'Отказано в доступе');
    }

    const body = req.body;

    if (
      !(await this.boardsService.getById(body.boardId, {
        width: 0,
        height: 0,
      }))
    ) {
      throw new HandlerException(404, 'Не найдена доска');
    }

    const sticker = await this.service.create(body, req.user.id);

    logger.info('Sticker created', { stickerId: sticker.id });
    res.status(200).json(sticker);
  };

  /**
   * @openapi
   * /stickers/{id}:
   *   put:
   *     summary: Редактировать стикер
   *     tags:
   *       - Stickers
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
   *               description:
   *                 type: string
   *               positionX:
   *                 type: number
   *               positionY:
   *                 type: number
   *               index:
   *                 type: number
   *     responses:
   *       200:
   *         description: Стикер обновлен
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StickerResponse'
   */
  update = async (
    req: Request<
      paths['/stickers/{id}']['put']['parameters']['path'],
      {},
      UpdateStickerDto
    >,
    res: Response<StickerResponse>,
  ) => {
    const { id } = req.params;
    const body = req.body;

    if (!req.user) {
      throw new HandlerException(403, 'Отказано в доступе');
    }

    if (!(await this.service.getById(id))) {
      throw new HandlerException(404, 'Стикер не найден');
    }

    const sticker = (await this.service.update(id, body, req.user.id))!;

    logger.info('Sticker updated', { stickerId: id });
    res.json(sticker);
  };

  /**
   * @openapi
   * /stickers/{id}:
   *   delete:
   *     summary: Удалить стикер
   *     tags:
   *       - Stickers
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   */
  delete = async (
    req: Request<paths['/stickers/{id}']['delete']['parameters']['path']>,
    res: Response<void>,
  ) => {
    const { id } = req.params;

    if (!req.user) {
      throw new HandlerException(403, 'Отказано в доступе');
    }

    const sticker = await this.service.getById(id);
    if (!sticker) {
      throw new HandlerException(404, 'Стикер не найден');
    }

    await this.service.delete(id, req.user.id);

    logger.info('Sticker deleted', { stickerId: id });
    res.status(200).send();
  };
}
