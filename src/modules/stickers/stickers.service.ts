import { Sticker } from "./stickers.model.js";
import { StickersRepository } from "./stickers.repository.js";

export class StickersService {
  constructor(private repo: StickersRepository) {}

  getAll() {
    return this.repo.findAll();
  }

  getById(id: number) {
    return this.repo.findById(id);
  }

  create(data: Omit<Sticker, "id">) {
    return this.repo.create(data);
  }
}
