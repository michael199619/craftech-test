import {
  CreateStickerDto,
  StickerMetaDto,
  UpdateStickerDto,
} from './stickers.dto.js';
import { Sticker, StickerMeta } from './stickers.model.js';

import { Op } from 'sequelize';
import { GetByIdDto } from '../boards/boards.dto.js';

export class StickersRepository {
  findAll({ width, height }: GetByIdDto): Promise<Sticker[]> {
    return Sticker.findAll({
      attributes: ['id', 'name', 'description'],
      include: [
        {
          association: 'meta',
          attributes: ['positionX', 'positionY', 'width', 'height'],
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
      include: ['StickerMeta'],
    });
  }

  async create(data: CreateStickerDto, userId?: string) {
    const { positionX, positionY, index, ...stickerData } = data;

    const stickerMeta = await StickerMeta.create(
      {
        positionX,
        positionY,
        index,
      },
      { userId, individualHooks: true },
    );

    return Sticker.create(
      {
        ...stickerData,
        stickerMetaId: stickerMeta.id,
      },
      { individualHooks: true, userId },
    );
  }

  async update(id: string, data: UpdateStickerDto, userId?: string) {
    const sticker = await Sticker.findByPk(id);
    if (!sticker) {
      return null;
    }

    const { positionX, positionY, index, ...stickerData } = data;

    const stickerMeta = await StickerMeta.findByPk(sticker.stickerMetaId);
    if (stickerMeta) {
      await stickerMeta.update(stickerMeta.id, {
        positionX: positionX || stickerMeta.positionX,
        positionY: positionY || stickerMeta.positionY,
        index: index || stickerMeta.index,
        userId,
        individualHooks: true,
      });

      await Sticker.update(stickerData, {
        where: { id },
        individualHooks: true,
        userId,
      });

      return this.findById(id);
    }
  }

  async delete(id: string, userId?: string) {
    const sticker = await this.findById(id);
    if (!sticker) {
      return null;
    }

    await Sticker.destroy({ where: { id }, individualHooks: true, userId });
    return sticker;
  }

  async updateStickersPositions(stickers: StickerMetaDto[]) {
    // стикеры для ws
  }
}
