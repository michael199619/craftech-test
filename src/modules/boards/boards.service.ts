import {
  BoardResponse,
  BoardWithStickersResponse,
  CreateBoardDto,
  CreateHistoryDto,
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

    if (!board) {
      return null;
    }

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
    userId?: string,
  ): Promise<BoardResponse | null> {
    const board = await this.repo.update(id, data, userId);
    return board ? this.mapToResponse(board) : null;
  }

  async delete(id: string, userId?: string): Promise<BoardResponse | null> {
    const board = await this.repo.delete(id, userId);
    return board ? this.mapToResponse(board) : null;
  }

  async getHistory(boardId: string, page: number = 1, limit: number = 20) {
    return this.repo.getHistory(boardId, page, limit);
  }

  async createHistory(data: CreateHistoryDto[]) {
    await this.repo.createHistory(data);
  }

  private mapToResponse(board: Board): BoardResponse {
    return board.toJSON() as BoardResponse;
  }
}
