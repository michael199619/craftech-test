import {
  CreateStickerDto,
  GetByIdDto,
  StickerMetaDto,
  StickerResponse,
  UpdateStickerDto,
} from './stickers.dto.js';
import { Sticker } from './stickers.model.js';
import { StickersRepository } from './stickers.repository.js';

export class StickersService {
  constructor(private repo: StickersRepository) {}

  async getAll(dto: GetByIdDto) {
    return await this.repo.findAll(dto);
  }

  async getById(id: string): Promise<StickerResponse | null> {
    const sticker = await this.repo.findById(id);
    return sticker ? this.mapToResponse(sticker) : null;
  }

  async create(
    data: CreateStickerDto,
    userId?: string,
  ): Promise<StickerResponse> {
    const sticker = await this.repo.create(data, userId);
    return this.mapToResponse(sticker);
  }

  async update(
    id: string,
    data: UpdateStickerDto,
    userId?: string,
  ): Promise<StickerResponse | null> {
    const sticker = await this.repo.update(id, data, userId);
    return sticker ? this.mapToResponse(sticker) : null;
  }

  async delete(id: string, userId?: string): Promise<StickerResponse | null> {
    const sticker = await this.repo.delete(id, userId);
    return sticker ? this.mapToResponse(sticker) : null;
  }

  async updateStickersPositions(stickers: StickerMetaDto[], userId?: string) {
    return this.repo.updateStickersPositions(stickers);
  }

  private mapToResponse(sticker: Sticker): StickerResponse {
    return sticker.toJSON() as StickerResponse;
  }
}
