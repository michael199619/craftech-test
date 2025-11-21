import { Board } from './boards.model.js';

export class BoardsRepository {
  async findAll() {
    return Board.findAll();
  }

  async findById(id: number) {
    return Board.findByPk(id);
  }

  async create(data: Omit<Board, 'id'>) {
    return Board.create(data);
  }
}
