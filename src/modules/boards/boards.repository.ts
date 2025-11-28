import {
  CreateBoardDto,
  CreateHistoryDto,
  GetByIdDto,
  UpdateBoardDto,
} from './boards.dto.js';
import { Board, BoardHistory } from './boards.model.js';

import { Op, Sequelize } from 'sequelize';

export class BoardsRepository {
  // поиск по доскам (исключает воркспэйсы)
  async findAll(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const userInBoardsSubquery = Sequelize.literal(
      `EXISTS (
        SELECT 1
        FROM "UsersBoards"
        WHERE "UsersBoards"."boardId" = "Board"."id"
          AND "UsersBoards"."userId" = '${userId}'
      )`,
    );

    const workspaceExcludedSubquery = Sequelize.literal(
      `NOT EXISTS (
        SELECT 1
        FROM "Workspace" w
        LEFT JOIN "UsersWorkspaces" uw ON w."id" = uw."workspaceId"
        WHERE w."id" = "Board"."workspaceId"
          AND (w."authorId" = '${userId}' OR uw."userId" = '${userId}')
      )`,
    );

    const { count, rows } = await Board.findAndCountAll({
      attributes: ['id', 'name', 'authorId', 'private', 'workspaceId'],

      where: {
        [Op.and]: [
          {
            [Op.or]: [{ authorId: userId }, userInBoardsSubquery],
          },
          {
            [Op.or]: [{ workspaceId: null }, workspaceExcludedSubquery],
          },
        ],
      },

      distinct: true,
      limit,
      offset,
      //order: [['createdAt', 'DESC']], todo: добавить
    });

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  // todo: здесь нужно добавить проверку на пользователя
  async findById(id: string, { width, height }: GetByIdDto) {
    return await Board.findByPk(id, {
      include: [
        {
          attributes: ['id', 'name', 'description'],
          association: 'stickers',
          required: false,
          include: [
            {
              association: 'meta',
              attributes: [
                'positionX',
                'positionY',
                'width',
                'height',
                'index',
              ],
              required: true,
              where: {
                positionX: { [Op.lte]: width },
                positionY: { [Op.lte]: height },
              },
            },
          ],
        },
      ],
      attributes: {
        include: [
          [
            Sequelize.literal(`(
              SELECT COALESCE(MAX(m."positionX" +m.width), 0)
              FROM "Sticker" s
              LEFT JOIN "StickerMeta" m on m.id = s."stickerMetaId"
              WHERE s."boardId" = "Board"."id"
            )`),
            'maxWidth',
          ],
          [
            Sequelize.literal(`(
              SELECT COALESCE(MAX(m."positionY" + m.height), 0)
              FROM "Sticker" s
              INNER JOIN "StickerMeta" m on m.id = s."stickerMetaId"
              WHERE s."boardId" = "Board"."id"
            )`),
            'maxHeight',
          ],
        ],
      },
    });
  }

  async create(data: CreateBoardDto) {
    return Board.create({ ...data });
  }

  async update(id: string, data: UpdateBoardDto, userId?: string) {
    await Board.update(data, {
      where: { id },
      individualHooks: true,
      userId,
    });

    return Board.findByPk(id);
  }

  async delete(id: string, userId?: string) {
    const board = Board.findByPk(id);
    if (!board) {
      return null;
    }

    await Board.destroy({ where: { id }, individualHooks: true, userId });
    return board;
  }

  async getHistory(boardId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { count, rows } = await BoardHistory.findAndCountAll({
      where: { boardId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  createHistory(data: CreateHistoryDto[]) {
    return BoardHistory.bulkCreate(data.map((e) => ({ ...e })));
  }
}
