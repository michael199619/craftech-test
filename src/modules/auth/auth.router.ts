import { Router } from 'express';
import { authGuard } from '../../core/auth/auth.guard.js';
import { UsersRepository } from '../users/users.repository.js';
import { UsersService } from '../users/users.service.js';
import { AuthController } from './auth.controller.js';

const usersRepo = new UsersRepository();
const usersService = new UsersService(usersRepo);
const authController = new AuthController(usersService);

const router = Router();

router.post('/signup', authController.signup);
router.post('/signout', authController.signout);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', authGuard, authController.getMe);

export default router;
