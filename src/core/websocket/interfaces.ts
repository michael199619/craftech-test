import { WebSocket } from 'ws';
import {
  StickerMetaDto,
  StickerResponse,
} from '../../modules/stickers/stickers.dto.js';
import { ClientEvents } from './contants.js';

export interface WSClient extends WebSocket {
  userId?: string;
  boardId?: string;
  isAlive?: boolean;
}

export interface UserBoard {
  userId: string;
  boardId?: string;
}

export interface WSMessage {
  event: ClientEvents;
  data?: any;
}

export interface JoinBoardPayload {
  boardId: string;
}

export interface LeaveBoardPayload {
  boardId: string;
}

export interface DragStartPayload {
  stickers: StickerMetaDto[];
}

export interface DragEndPayload {
  stickers: StickerMetaDto[];
}

export interface UserOnlinePayload {
  isOnline: boolean;
}

export interface ObjectDelete {
  id: string;
}

export interface WSEventResponse<E extends ClientEvents> {
  event: ClientEvents;
  payload: Payload[E];
  error?: string;
}

export interface Payload {
  [ClientEvents.STICKER_CREATE]: StickerResponse;
  [ClientEvents.STICKERS_DRAG_END]: DragEndPayload;
  [ClientEvents.STICKERS_DRAG_START]: DragStartPayload;
  [ClientEvents.STICKER_DELETE]: ObjectDelete;
  [ClientEvents.STICKER_UPDATE]: StickerResponse;
  [ClientEvents.USER_JOIN]: JoinBoardPayload;
  [ClientEvents.USER_LEFT]: LeaveBoardPayload;
  [ClientEvents.USER_ONLINE]: UserOnlinePayload;
  [ClientEvents.ERROR]: WSEventResponse<ClientEvents>;
  [ClientEvents.BOARD_DELETE]: ObjectDelete;
}
