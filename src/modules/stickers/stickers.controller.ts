import { Response } from 'express';
import { HandlerException, asyncHandler } from '../../core/error-handler.js';
import { Req } from '../../core/interfaces.js';
import { logger } from '../../core/logger.js';
import {
  CreateStickerDto,
  GetByIdDto,
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
 *         description: Список стикеров
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/StickerResponse'
 */
export class StickersController {
  constructor(private service: StickersService) {}

  getAll = asyncHandler(async (req: Req<{}, {}, GetByIdDto>, res: Response) => {
    const { width, height, boardId } = req.query;

    const widthNum = Number(width);
    const heightNum = Number(height);

    const result = await this.service.getAll({
      width: widthNum,
      height: heightNum,
      boardId,
    });
    res.json(result);
  });

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
  create = asyncHandler(
    async (req: Req<{}, CreateStickerDto>, res: Response) => {
      const sticker = await this.service.create(req.body, req.user.id);

      logger.info('Sticker created', { stickerId: sticker.id });
      res.status(200).json(sticker);
    },
  );

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
  update = asyncHandler(
    async (req: Req<{ id: string }, UpdateStickerDto>, res: Response) => {
      const { id } = req.params;

      const sticker = await this.service.update(id, req.body, req.user.id);
      if (!sticker) {
        throw new HandlerException(404, 'Стикер не найден');
      }

      logger.info('Sticker updated', { stickerId: id });
      res.json(sticker);
    },
  );

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
  delete = asyncHandler(async (req: Req<{ id: string }>, res: Response) => {
    const { id } = req.params;

    const sticker = await this.service.delete(id, req.user.id);
    if (!sticker) {
      throw new HandlerException(404, 'Стикер не найден');
    }

    logger.info('Sticker deleted', { stickerId: id });
    res.status(200).send();
  });
}
