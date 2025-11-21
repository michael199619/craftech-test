import { Board } from './boards.model.js';
import { BoardsRepository } from './boards.repository.js';

export class BoardsService {
  constructor(private repo: BoardsRepository) {}

  getAll() {
    return this.repo.findAll();
  }

  getById(id: number) {
    return this.repo.findById(id);
  }

  create(data: Omit<Board, 'id'>) {
    return this.repo.create(data);
  }
}
