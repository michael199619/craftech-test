import { Sticker } from "./stickers.model.js";

export class StickersRepository {
  async findAll() {
    return Sticker.findAll();
  }

  async findById(id: number) {
    return Sticker.findByPk(id);
  }

  async create(data: Omit<Sticker, "id">) {
    return Sticker.create(data);
  }
}
