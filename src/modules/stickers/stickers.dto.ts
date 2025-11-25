export interface CreateStickerDto {
  name: string;
  description: string;
  boardId: string;
  positionX?: number;
  positionY?: number;
  index?: number;
}

export interface UpdateStickerDto {
  name?: string;
  description?: string;
  positionX?: number;
  positionY?: number;
  index?: number;
  width?: string;
  height?: string;
}

export interface StickerResponse {
  id: string;
  name: string;
  description: string;
  boardId: string;
  createdAt?: Date;
  meta?: StickerMetaResponse;
}

export interface StickerMetaResponse {
  positionX: number;
  positionY: number;
  index: number;
  width?: number;
  height?: number;
}

export interface GetByIdDto {
  width: number;
  height: number;
  boardId: string;
}

export interface StickerMetaDto {
  id: string;
  positionX: number;
  positionY: number;
  index: number;
}
