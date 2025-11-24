import { Router } from 'express';
import { WorkspacesController } from './workspaces.controller.js';
import { WorkspacesRepository } from './workspaces.repository.js';
import { WorkspacesService } from './workspaces.service.js';

const repo = new WorkspacesRepository();
const workspaceService = new WorkspacesService(repo);
const controller = new WorkspacesController(workspaceService);

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
export { workspaceService };
