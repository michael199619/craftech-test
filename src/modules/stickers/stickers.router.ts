import { Router } from "express";
import { StickersController } from "./stickers.controller.js";
import { StickersRepository } from "./stickers.repository.js";
import { StickersService } from "./stickers.service.js";

const repo = new StickersRepository();
const service = new StickersService(repo);
const controller = new StickersController(service);

const router = Router();

export default router;
