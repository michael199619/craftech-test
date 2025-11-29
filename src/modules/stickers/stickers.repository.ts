import {
  CreateStickerDto,
  GetAllDto,
  StickerMetaDto,
  UpdateStickerDto,
} from './stickers.dto.js';
import { Sticker, StickerMeta } from './stickers.model.js';

import { Op } from 'sequelize';

export class StickersRepository {
  findAll({ width, height, boardId, exludes }: GetAllDto): Promise<Sticker[]> {
    return Sticker.findAll({
      attributes: ['id', 'name', 'description'],
      where: {
        boardId,
        id: {
          [Op.notIn]: exludes || [],
        },
      },
      include: [
        {
          association: 'meta',
          attributes: ['positionX', 'positionY', 'width', 'height', 'index'],
          required: true,
          where: {
            positionX: { [Op.lte]: width },
            positionY: { [Op.lte]: height },
          },
        },
      ],
    });
  }

  async findById(id: string) {
    return Sticker.findByPk(id, {
      include: [
        {
          association: 'meta',
          attributes: ['positionX', 'positionY', 'width', 'height', 'index'],
        },
      ],
    });
  }

  async create(data: CreateStickerDto, userId?: string) {
    const { positionX, positionY, width, height, index, ...stickerData } = data;

    const sticker = await Sticker.create({
      ...stickerData,
      individualHooks: false,
    });

    await StickerMeta.create(
      {
        positionX,
        positionY,
        width,
        height,
        index,
        stickerId: sticker.id,
      },
      { userId },
    );

    return (await this.findById(sticker.id))!;
  }

  async update(id: string, data: UpdateStickerDto, userId?: string) {
    const { positionX, positionY, index, ...stickerData } = data;

    await Sticker.update(stickerData, {
      where: { id },
      userId,
      individualHooks: true,
    });

    await StickerMeta.update(
      {
        positionX: positionX,
        positionY: positionY,
        index: index,
        userId,
      },
      { where: { stickerId: id }, userId, individualHooks: true },
    );

    return this.findById(id);
  }

  async delete(ids: string[], userId?: string) {
    await Sticker.destroy({
      where: { id: { [Op.in]: ids } },
      individualHooks: true,
      userId,
    });
  }

  async updateStickersPositions(stickers: StickerMetaDto[], userId?: string) {
    await Promise.all(
      stickers.map((stickerData) =>
        StickerMeta.update(stickerData, {
          where: { stickerId: stickerData.stickerId },
          userId,
          individualHooks: true,
        }),
      ),
    );
  }
}
