import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { UsersRepository } from './users.repository.js';
import { UsersService } from './users.service.js';

const repo = new UsersRepository();
const usersService = new UsersService(repo);
const controller = new UsersController(usersService);

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;

export { usersService };
