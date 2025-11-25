export enum ClientEvents {
  STICKER_CREATE = 'sticker:create',
  STICKER_UPDATE = 'sticker:update',
  STICKER_DELETE = 'sticker:delete',
  STICKERS_DRAG_START = 'stickers:drag:start', // событие нужно для отображения перемещения стикеров (не записывает в бд)
  STICKERS_DRAG_END = 'stickers:drag:end', // событие нужно для записи стикеров после перемещения

  BOARD_DELETE = 'board:delete',

  USER_ONLINE = 'user:online',
  USER_JOIN = 'user:join',
  USER_LEFT = 'user:left',

  ERROR = 'error',
}

export enum ServerEvents {
  CONNECTION = 'connection',
  ERROR = 'error',
  CLOSE = 'close',
  MESSAGE = 'message',
}
