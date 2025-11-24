import {
  BoardResponse,
  BoardWithStickersResponse,
  CreateBoardDto,
  GetByIdDto,
  UpdateBoardDto,
} from './boards.dto.js';
import { Board } from './boards.model.js';
import { BoardsRepository } from './boards.repository.js';

export class BoardsService {
  constructor(private repo: BoardsRepository) {}

  async getAll(userId: string, page: number = 1, limit: number = 20) {
    const result = await this.repo.findAll(userId, page, limit);

    return {
      data: result.data.map(this.mapToResponse),
      pagination: result.pagination,
    };
  }

  async getById(
    id: string,
    dto: GetByIdDto,
  ): Promise<BoardWithStickersResponse | null> {
    const board = await this.repo.findById(id, dto);
    if (!board) return null;
    return board.toJSON() as BoardWithStickersResponse;
  }

  async create(
    data: CreateBoardDto & { authorId?: string },
  ): Promise<BoardResponse> {
    const board = await this.repo.create({
      ...data,
      private: !!data.private,
    });
    return this.mapToResponse(board);
  }

  async update(
    id: string,
    data: UpdateBoardDto,
  ): Promise<BoardResponse | null> {
    const board = await this.repo.update(id, data);
    return board ? this.mapToResponse(board) : null;
  }

  async delete(id: string): Promise<BoardResponse | null> {
    const board = await this.repo.delete(id);
    return board ? this.mapToResponse(board) : null;
  }

  async getHistory(boardId: string, page: number = 1, limit: number = 20) {
    return this.repo.getHistory(boardId, page, limit);
  }

  private mapToResponse(board: Board): BoardResponse {
    return board.toJSON() as BoardResponse;
  }
}
