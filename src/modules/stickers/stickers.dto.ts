import { paths } from '../../core/types/api-types.js';

export type CreateStickerDto =
  paths['/stickers']['post']['requestBody']['content']['application/json'] & {};

export type UpdateStickerDto =
  paths['/stickers/{id}']['put']['requestBody']['content']['application/json'] & {};

export type StickerResponse =
  paths['/stickers/{id}']['put']['responses']['200']['content']['application/json'] & {};

export type GetAllResponse =
  paths['/stickers']['get']['responses']['200']['content']['application/json'] & {};

export type DeleteDto =
  paths['/stickers']['delete']['requestBody']['content']['application/json'] & {};

export type GetAllDto = paths['/stickers']['get']['parameters']['query'] & {};
export interface StickerMetaDto {
  stickerId: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  index: number;
}
