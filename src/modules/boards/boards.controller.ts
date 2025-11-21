import { BoardsService } from './boards.service.js';

/**
 * @openapi
 * /boards:
 *   get:
 *     summary: Get all boards
 *     tags:
 *       - Boards
 *     responses:
 *       200:
 *         description: list of boards
 */
export class BoardsController {
  constructor(private service: BoardsService) {}
}
