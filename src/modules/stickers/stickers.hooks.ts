import { broadcastToBoard } from "../../core/websocket.js";
import { Sticker } from "./stickers.model.js";

Sticker.afterCreate((sticker: Sticker) =>
  broadcastToBoard(sticker.boardId, "sticker:create", sticker),
);

Sticker.afterUpdate((sticker: Sticker) =>
  broadcastToBoard(sticker.boardId, "sticker:update", sticker),
);

Sticker.afterDestroy((sticker: Sticker) =>
  broadcastToBoard(sticker.boardId, "sticker:delete", sticker),
);
