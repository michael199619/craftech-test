import { WSClient } from './interfaces.js';

const boardRooms = new Map<string, Set<WSClient>>();
const userConnections = new Map<string, Set<WSClient>>();

export function joinBoardRoom(ws: WSClient, boardId: string) {
  if (!boardRooms.has(boardId)) {
    boardRooms.set(boardId, new Set());
  }

  boardRooms.get(boardId)!.add(ws);
}

export function leaveBoardRoom(ws: WSClient, boardId: string) {
  const room = boardRooms.get(boardId);

  if (room) {
    room.delete(ws);

    if (!room.size) {
      boardRooms.delete(boardId);
    }
  }
}

export function getBoardRoom(boardId: string): Set<WSClient> | undefined {
  return boardRooms.get(boardId);
}

export function addUserConnection(userId: string, ws: WSClient) {
  if (!userConnections.has(userId)) {
    userConnections.set(userId, new Set());
  }

  userConnections.get(userId)!.add(ws);
}

export function removeUserConnection(userId: string, ws: WSClient) {
  const connections = userConnections.get(userId);

  if (connections) {
    connections.delete(ws);

    if (!connections.size) {
      userConnections.delete(userId);
      return true;
    }
  }
  return false;
}

export function getUserConnections(userId: string): Set<WSClient> | undefined {
  return userConnections.get(userId);
}
