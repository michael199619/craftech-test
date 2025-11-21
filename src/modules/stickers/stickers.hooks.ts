import { broadcastToBoard } from '../../core/websocket.js';
import { Sticker } from './stickers.model.js';

Sticker.afterCreate(() => broadcastToBoard());

Sticker.afterUpdate(() => broadcastToBoard());

Sticker.afterDestroy(() => broadcastToBoard());
