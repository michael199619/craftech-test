import { Router } from 'express';
import { StickersController } from './stickers.controller.js';
import { StickersRepository } from './stickers.repository.js';
import { StickersService } from './stickers.service.js';

const repo = new StickersRepository();
const stickerService = new StickersService(repo);
const controller = new StickersController(stickerService);

const router = Router();

router.post('/', controller.create);
router.get('/', controller.getAll);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;

export { stickerService };
