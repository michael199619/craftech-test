import { Router } from "express";
import { UsersController } from "./users.controller.js";
import { UsersRepository } from "./users.repository.js";
import { UsersService } from "./users.service.js";

const repo = new UsersRepository();
const service = new UsersService(repo);
const controller = new UsersController(service);

const router = Router();

router.get("/", controller.getUsers);
router.post("/", controller.createUser);

export default router;
