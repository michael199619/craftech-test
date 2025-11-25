import { Router } from 'express';
import { workspaceService } from '../workspaces/workspaces.router.js';
import { BoardsController } from './boards.controller.js';
import { BoardsRepository } from './boards.repository.js';
import { BoardsService } from './boards.service.js';

const repo = new BoardsRepository();
const boardService = new BoardsService(repo);
const controller = new BoardsController(boardService, workspaceService);

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.get('/:id/history', controller.getHistory);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;

export { boardService };
