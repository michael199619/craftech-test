import { Request, Response } from 'express';
import { UsersService } from './users.service.js';

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: list of users
 */
export class UsersController {
  constructor(private service: UsersService) {}

  getUsers = async (req: Request, res: Response) => {
    const users = await this.service.getAll();
    res.json(users);
  };

  /**
   * @openapi
   * /users:
   *   post:
   *     summary: Create user
   *     tags:
   *       - Users
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *     responses:
   *       201:
   *         description: created
   */
  createUser = async (req: Request, res: Response) => {
    const user = await this.service.create(req.body);
    res.status(201).json(user);
  };
}
