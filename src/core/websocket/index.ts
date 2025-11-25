import { Server } from 'http';
import { WebSocketServer } from 'ws';
import { Req } from '../interfaces.js';
import { logger } from '../logger.js';
import { broadcastToBoard } from './broadcast.js';
import { authenticateConnection } from './connection.js';
import { ClientEvents, ServerEvents } from './contants.js';
import { handleMessage } from './handlers.js';
import { WSClient } from './interfaces.js';
import {
  addUserConnection,
  joinBoardRoom,
  leaveBoardRoom,
  removeUserConnection,
} from './rooms.js';

let wss: WebSocketServer;

export function initWebSocket(server: Server) {
  wss = new WebSocketServer({ server });

  wss.on(ServerEvents.CONNECTION, async (ws: WSClient, req: Req) => {
    ws.isAlive = true;

    const userBoard = await authenticateConnection(ws, req);
    console.log(9);

    if (!userBoard) {
      return;
    }

    ws.userId = userBoard.userId;

    if (userBoard.boardId) {
      ws.boardId = userBoard.boardId;
      joinBoardRoom(ws, userBoard.boardId);
    }

    addUserConnection(userBoard.userId, ws);

    broadcastToBoard(userBoard.userId, ClientEvents.USER_ONLINE, {
      userId: userBoard.userId,
      isOnline: true,
    });

    ws.on(ServerEvents.MESSAGE, async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        await handleMessage(ws, message);
      } catch (error) {
        logger.error('Error parsing WebSocket message', { error });

        ws.send(
          JSON.stringify({
            event: ClientEvents.ERROR,
            error: 'Invalid message format',
          }),
        );
      }
    });

    ws.on(ServerEvents.CLOSE, () => {
      if (ws.boardId) {
        leaveBoardRoom(ws, ws.boardId);
      }

      if (ws.userId) {
        const isOffline = removeUserConnection(ws.userId, ws);

        if (isOffline) {
          broadcastToBoard(ws.boardId!, ClientEvents.USER_ONLINE, {
            userId: ws.userId,
            isOnline: false,
          });
        }
      }

      logger.debug('WebSocket connection closed', {
        userId: ws.userId,
        boardId: ws.boardId,
      });
    });

    ws.on(ServerEvents.ERROR, (error: Error) => {
      logger.error('WebSocket error', {
        error,
        userId: ws.userId,
        boardId: ws.boardId,
      });
    });
  });

  wss.on(ServerEvents.ERROR, () => {
    logger.info('WebSocket server closed');
  });

  logger.info('WebSocket server initialized');
}
