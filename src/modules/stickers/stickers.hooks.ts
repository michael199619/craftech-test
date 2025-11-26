import { broadcastToBoard } from '../../core/websocket/broadcast.js';
import { ClientEvents } from '../../core/websocket/contants.js';
import { CreateHistoryDto } from '../boards/boards.dto.js';
import { HistoryEntity, HistoryOperation } from '../boards/boards.model.js';
import { boardService } from '../boards/boards.router.js';
import { Sticker, StickerMeta } from './stickers.model.js';

const ignoreFields: string[] = ['updatedAt', 'createdAt'];

Sticker.afterCreate(async (sticker: Sticker, options) => {
  const stickerMeta = (await StickerMeta.findByPk(sticker.stickerMetaId))!;

  broadcastToBoard(sticker.boardId, ClientEvents.STICKER_CREATE, {
    id: sticker.id,
    name: sticker.name,
    description: sticker.description,
    boardId: sticker.boardId,
    createdAt: sticker.createdAt,
    meta: {
      positionX: stickerMeta.positionX,
      positionY: stickerMeta.positionY,
      index: stickerMeta.index,
      width: stickerMeta.width,
      height: stickerMeta.height,
    },
  });

  await boardService.createHistory([
    {
      boardId: sticker.boardId,
      authorId: options.userId,
      operation: HistoryOperation.CREATE,
      entityName: HistoryEntity.STICKER,
      entityId: sticker.id,
      key: sticker.name,
      newValue: sticker.name,
    },
  ]);
});

Sticker.afterUpdate(async (sticker: Sticker, options) => {
  const changedFields = sticker.changed();

  if (!changedFields) {
    return;
  }

  const fields = changedFields.filter(
    (field) => ignoreFields.indexOf(field) === -1,
  );
  if (!fields.length) {
    return;
  }

  const stickerMeta = (await StickerMeta.findByPk(sticker.stickerMetaId))!;

  broadcastToBoard(sticker.boardId, ClientEvents.STICKER_UPDATE, {
    id: sticker.id,
    name: sticker.name,
    description: sticker.description,
    boardId: sticker.boardId,
    meta: {
      positionX: stickerMeta.positionX,
      positionY: stickerMeta.positionY,
      index: stickerMeta.index,
      width: stickerMeta.width,
      height: stickerMeta.height,
    },
  });

  const data: CreateHistoryDto[] = [];
  for (const field of fields) {
    const oldValue = sticker.previous(field);
    const newValue = sticker.getDataValue(field);

    data.push({
      boardId: sticker.boardId,
      authorId: options.userId,
      operation: HistoryOperation.UPDATE,
      entityName: HistoryEntity.STICKER,
      entityId: sticker.id,
      key: field,
      newValue,
      oldValue,
    });
  }

  await boardService.createHistory(data);
});

Sticker.afterDestroy(async (sticker: Sticker, options) => {
  broadcastToBoard(sticker.boardId, ClientEvents.STICKER_DELETE, {
    id: sticker.id,
    userId: options.userId,
  });

  await boardService.createHistory([
    {
      boardId: sticker.boardId,
      authorId: options.userId,
      operation: HistoryOperation.DELETE,
      entityName: HistoryEntity.STICKER,
      entityId: sticker.id,
      key: sticker.name,
      newValue: sticker.name,
    },
  ]);
});

StickerMeta.afterUpdate(async (stickerMeta: StickerMeta, options) => {
  const changedFields = stickerMeta.changed();

  if (!changedFields) {
    return;
  }

  const fields = changedFields.filter(
    (field) => ignoreFields.indexOf(field) === -1,
  );
  if (!fields.length) {
    return;
  }

  const sticker = (await Sticker.findOne({
    where: { stickerMetaId: stickerMeta.id },
  }))!;

  broadcastToBoard(sticker.boardId, ClientEvents.STICKER_UPDATE, {
    id: sticker.id,
    name: sticker.name,
    description: sticker.description,
    boardId: sticker.boardId,
    meta: {
      positionX: stickerMeta.positionX,
      positionY: stickerMeta.positionY,
      index: stickerMeta.index,
      width: stickerMeta.width,
      height: stickerMeta.height,
    },
  });

  const data: CreateHistoryDto[] = [];
  for (const field of fields) {
    const oldValue = stickerMeta.previous(field);
    const newValue = stickerMeta.getDataValue(field);

    data.push({
      boardId: sticker.boardId,
      authorId: options.userId,
      operation: HistoryOperation.UPDATE,
      entityId: stickerMeta.id,
      entityName: HistoryEntity.STICKER_META,
      key: field,
      newValue,
      oldValue,
    });
  }

  await boardService.createHistory(data);
});
