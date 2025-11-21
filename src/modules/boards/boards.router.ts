import { Router } from "express";
import { BoardsController } from "./boards.controller.js";
import { BoardsRepository } from "./boards.repository.js";
import { BoardsService } from "./boards.service.js";

const repo = new BoardsRepository();
const service = new BoardsService(repo);
const controller = new BoardsController(service);

const router = Router();

export default router;
