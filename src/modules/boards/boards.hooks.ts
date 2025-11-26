import { broadcastToBoard } from '../../core/websocket/broadcast.js';
import { ClientEvents } from '../../core/websocket/contants.js';
import { CreateHistoryDto } from './boards.dto.js';
import { Board, HistoryEntity, HistoryOperation } from './boards.model.js';
import { boardService } from './boards.router.js';

const ignoreFields: string[] = ['updatedAt', 'createdAt'];

Board.afterCreate(async (board: Board) => {
  await boardService.createHistory([
    {
      boardId: board.id,
      authorId: board.authorId,
      operation: HistoryOperation.CREATE,
      entityId: board.id,
      key: 'name',
      newValue: board.name,
      entityName: HistoryEntity.BOARD,
    },
  ]);
});

Board.afterUpdate(async (board: Board, options) => {
  const changedFields = board.changed();

  if (!changedFields) {
    return;
  }

  const fields = changedFields.filter(
    (field) => ignoreFields.indexOf(field) === -1,
  );
  if (!fields.length) {
    return;
  }

  const data: CreateHistoryDto[] = [];
  for (const field of fields) {
    const oldValue = board.previous(field);
    const newValue = board.getDataValue(field);

    data.push({
      boardId: board.id,
      authorId: options.userId,
      operation: HistoryOperation.UPDATE,
      entityId: board.id,
      key: field,
      oldValue: oldValue,
      entityName: HistoryEntity.BOARD,
      newValue: newValue,
    });
  }

  await boardService.createHistory(data);
});

Board.afterDestroy(async (board: Board, options) => {
  await boardService.createHistory([
    {
      boardId: board.id,
      authorId: options.userId,
      operation: HistoryOperation.DELETE,
      entityId: board.id,
      entityName: HistoryEntity.BOARD,
    },
  ]);

  broadcastToBoard(board.id, ClientEvents.BOARD_DELETE, {
    id: board.id,
    userId: options.userId,
  });
});
