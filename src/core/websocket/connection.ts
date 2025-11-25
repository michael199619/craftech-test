import { UserResponse } from '../../modules/users/users.dto.js';
import { getUserBySession } from '../auth/auth.guard.js';
import { getSession } from '../cookies.js';
import { Req } from '../interfaces.js';
import { logger } from '../logger.js';
import { UserBoard, WSClient } from './interfaces.js';

export async function authenticateConnection(
  ws: WSClient,
  req: Req,
): Promise<UserBoard | null> {
  try {
    const url = new URL(`${req.headers.host}${req.url}`);

    const session = getSession(req);
    let user: UserResponse | null = null;

    if (session) {
      user = await getUserBySession(session);
    }

    if (!user) {
      throw 'User not found';
    }

    const boardId = url.searchParams.get('boardId') || undefined;

    logger.info('WebSocket connection authenticated', {
      userId: user?.id,
      boardId,
    });

    return {
      userId: user.id,
      boardId,
    };
  } catch (error) {
    logger.error('WebSocket authentication error', { error });
    ws.close(1008, 'Unauthorized: Authentication error');
    return null;
  }
}
