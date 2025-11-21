import { User } from "./users.model.js";
import { UsersRepository } from "./users.repository.js";

export class UsersService {
  constructor(private repo: UsersRepository) {}

  getAll() {
    return this.repo.findAll();
  }

  getById(id: number) {
    return this.repo.findById(id);
  }

  create(data: Omit<User, "id">) {
    return this.repo.create(data);
  }
}
