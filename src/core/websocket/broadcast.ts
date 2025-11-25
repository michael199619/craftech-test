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

export function broadcastUserOnline(
  userId: string,
  isOnline: boolean,
  boardRooms: Map<string, Set<WSClient>>,
) {
  const message: WSEventResponse = {
    event: ClientEvents.USER_ONLINE,
    payload: {
      userId,
      isOnline,
    },
  };

  const messageStr = JSON.stringify(message);

  let totalSent = 0;
  boardRooms.forEach((room, boardId) => {
    let sentCount = 0;

    room.forEach((client: WSClient) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(messageStr);
          sentCount++;
        } catch (error) {
          logger.error('Broadcast error: user closed connect', {
            error,
            boardId,
          });
        }
      }
    });

    totalSent += sentCount;
  });

  logger.debug('Broadcast user online status', {
    userId,
    isOnline,
    totalSent,
  });
}
