import {
  CreateStickerDto,
  GetAllDto,
  StickerMetaDto,
  StickerResponse,
  UpdateStickerDto,
} from './stickers.dto.js';
import { Sticker } from './stickers.model.js';
import { StickersRepository } from './stickers.repository.js';

export class StickersService {
  constructor(private repo: StickersRepository) {}

  async getAll(dto: GetAllDto): Promise<{ data: StickerResponse[] }> {
    const stickers = await this.repo.findAll(dto);
    return {
      data: stickers.map(this.mapToResponse),
    };
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

  async delete(id: string, userId?: string) {
    await this.repo.delete(id, userId);
  }

  async updateStickersPositions(
    stickers: StickerMetaDto[],
    userId?: string,
  ): Promise<StickerResponse[]> {
    const updated = await this.repo.updateStickersPositions(stickers);
    return updated.map(this.mapToResponse);
  }

  private mapToResponse(sticker: Sticker): StickerResponse {
    return sticker.toJSON() as StickerResponse;
  }
}
