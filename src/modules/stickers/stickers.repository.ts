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

  async create(data: CreateStickerDto) {
    const { positionX, positionY, index, ...stickerData } = data;

    const stickerMeta = await StickerMeta.create({
      positionX,
      positionY,
      index,
    });

    return Sticker.create({
      ...stickerData,
      stickerMetaId: stickerMeta.id,
    });
  }

  async update(id: string, data: UpdateStickerDto) {
    const sticker = await Sticker.findByPk(id);
    if (!sticker) {
      return null;
    }

    const { positionX, positionY, index, ...stickerData } = data;

    const stickerMeta = await StickerMeta.findByPk(sticker.stickerMetaId);
    if (stickerMeta) {
      await stickerMeta.update({
        positionX: positionX || stickerMeta.positionX,
        positionY: positionY || stickerMeta.positionY,
        index: index || stickerMeta.index,
      });

      await Sticker.update(stickerData, {
        where: { id },
      });

      return this.findById(id);
    }
  }

  async delete(id: string) {
    const sticker = await this.findById(id);
    if (!sticker) {
      return null;
    }

    await Sticker.destroy({ where: { id } });
    return sticker;
  }

  async updateStickersPositions(stickers: StickerMetaDto[]) {
    // стикеры для ws
  }
}
