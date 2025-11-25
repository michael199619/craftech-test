import { WebSocket } from 'ws';
import { logger } from '../logger.js';
import { ClientEvents } from './contants.js';
import { Payload, WSClient, WSEventResponse } from './interfaces.js';
import { getBoardRoom } from './rooms.js';

export function broadcastToBoard<E extends ClientEvents>(
  boardId: string,
  event: E,
  payload: Payload[E],
) {
  const room = getBoardRoom(boardId);

  if (!room) {
    logger.debug('Board room not found', { boardId, event });
    return;
  }

  const message: WSEventResponse = { event, payload };
  const messageStr = JSON.stringify(message);

  let sentCount = 0;
  room.forEach((client: WSClient) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(messageStr);
        sentCount++;
      } catch (error) {
        logger.error('Error sending WebSocket message', { error, boardId });
      }
    }
  });

  logger.debug('Broadcast to board', {
    boardId,
    event,
    clients: room.size,
    sent: sentCount,
  });
}
