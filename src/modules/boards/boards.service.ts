import {
  BoardResponse,
  BoardWithStickersResponse,
  CreateBoardDto,
  CreateHistoryDto,
  GetAllResponse,
  GetByIdDto,
  UpdateBoardDto,
} from './boards.dto.js';
import { Board, BoardHistory } from './boards.model.js';
import { BoardsRepository } from './boards.repository.js';

export class BoardsService {
  constructor(private repo: BoardsRepository) {}

  async getAll(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<GetAllResponse> {
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

    return board.toJSON();
  }

  async create(data: CreateBoardDto): Promise<BoardResponse> {
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

  async delete(id: string, userId?: string) {
    await this.repo.delete(id, userId);
  }

  async getHistory(boardId: string, page: number = 1, limit: number = 20) {
    const result = await this.repo.getHistory(boardId, page, limit);

    return {
      data: result.data.map(this.mapToResponse),
      pagination: result.pagination,
    };
  }

  async createHistory(data: CreateHistoryDto[]) {
    await this.repo.createHistory(data);
  }

  private mapToResponse<T extends Board | BoardHistory>(board: T): T {
    return board.toJSON();
  }
}
