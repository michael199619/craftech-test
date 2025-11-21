import { User } from "./users.model.js";

export class UsersRepository {
  async findAll() {
    return User.findAll();
  }

  async findById(id: number) {
    return User.findByPk(id);
  }

  async create(data: Omit<User, "id">) {
    return User.create(data);
  }
}
