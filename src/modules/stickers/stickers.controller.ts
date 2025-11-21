import { StickersService } from './stickers.service.js';

/**
 * @openapi
 * /stickers:
 *   get:
 *     summary: Get all stickers
 *     tags:
 *       - Stickers
 *     responses:
 *       200:
 *         description: list of stickers
 */
export class StickersController {
  constructor(private service: StickersService) {}
}
