import { stickerService } from '../../modules/stickers/stickers.router.js';
import { logger } from '../logger.js';
import { broadcastToBoard } from './broadcast.js';
import { ClientEvents } from './contants.js';
import {
  DragEndPayload,
  JoinBoardPayload,
  WSClient,
  WSMessage,
} from './interfaces.js';
import { joinBoardRoom, leaveBoardRoom } from './rooms.js';

export async function handleJoinBoard(
  ws: WSClient,
  data: JoinBoardPayload,
): Promise<void> {
  if (!data?.boardId) {
    ws.send(
      JSON.stringify({
        event: ClientEvents.ERROR,
        error: 'boardId is required',
      }),
    );
    return;
  }

  if (ws.boardId) {
    leaveBoardRoom(ws, ws.boardId);
  }

  ws.boardId = data.boardId;
  joinBoardRoom(ws, data.boardId);

  ws.send(
    JSON.stringify({
      event: ClientEvents.USER_JOIN,
      payload: { boardId: data.boardId },
    }),
  );

  logger.debug('User joined board', {
    userId: ws.userId,
    boardId: data.boardId,
  });
}

export async function handleLeaveBoard(ws: WSClient): Promise<void> {
  if (!ws.boardId) {
    return;
  }

  const boardId = ws.boardId;

  leaveBoardRoom(ws, boardId);

  ws.boardId = undefined;

  ws.send(
    JSON.stringify({
      event: ClientEvents.USER_LEFT,
      payload: { boardId },
    }),
  );

  logger.debug('User left board', {
    userId: ws.userId,
    boardId,
  });
}

export async function handleDragStart(
  ws: WSClient,
  data: DragEndPayload,
): Promise<void> {
  if (!ws.boardId || !data?.stickers.length) {
    return;
  }

  broadcastToBoard(ws.boardId, ClientEvents.STICKERS_DRAG_START, {
    userId: ws.userId,
    stickers: data.stickers,
  });
}

export async function handleDragEnd(
  ws: WSClient,
  data: DragEndPayload,
): Promise<void> {
  if (!ws.boardId || !data?.stickers.length) {
    return;
  }

  broadcastToBoard(ws.boardId, ClientEvents.STICKERS_DRAG_END, {
    userId: ws.userId,
    stickers: data.stickers,
  });

  try {
    await stickerService.updateStickersPositions(data.stickers);

    logger.debug('Stickers positions saved', {
      userId: ws.userId,
      boardId: ws.boardId,
      count: data.stickers.length,
    });
  } catch (error) {
    logger.error('Error saving stickers positions', {
      error,
      userId: ws.userId,
      boardId: ws.boardId,
    });
  }
}

export async function handleMessage(ws: WSClient, message: WSMessage) {
  const { event, data } = message;

  try {
    switch (event) {
      case ClientEvents.USER_JOIN:
        await handleJoinBoard(ws, data as JoinBoardPayload);
        break;

      case ClientEvents.USER_LEFT:
        await handleLeaveBoard(ws);
        break;

      case ClientEvents.STICKERS_DRAG_START:
        await handleDragStart(ws, data as DragEndPayload);
        break;

      case ClientEvents.STICKERS_DRAG_END:
        await handleDragEnd(ws, data as DragEndPayload);
        break;

      default:
        ws.send(
          JSON.stringify({
            event: ClientEvents.ERROR,
            error: `Unknown event: ${event}`,
          }),
        );

        logger.warn('Unknown WebSocket event', { event, userId: ws.userId });
    }
  } catch (error) {
    logger.error('Error handling WebSocket message', {
      error,
      event,
      userId: ws.userId,
    });

    ws.send(
      JSON.stringify({
        event: ClientEvents.ERROR,
        error: 'Failed message',
      }),
    );
  }
}
