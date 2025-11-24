export interface CreateBoardDto {
  name: string;
  workspaceId: string;
  private?: boolean;
  authorId: string;
}

export interface UpdateBoardDto {
  name?: string;
  private?: boolean;
  workspaceId?: string;
}

export interface BoardResponse {
  id: string;
  name: string;
  authorId?: string;
  workspaceId: string;
  private: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BoardWithStickersResponse extends BoardResponse {
  maxWidth: number;
  maxHeight: number;
  stickers: {
    id: string;
    name: string;
    description: string;
    meta: {
      positionX: number;
      positionY: number;
      width: number;
      height: number;
    };
  }[];
}

export interface GetByIdDto {
  width: number;
  height: number;
}
