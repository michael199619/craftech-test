import { Express } from "express";
import WebSocket,{ WebSocketServer } from "ws";

interface WSClient extends WebSocket {
  boardId?: string;
}

let wss: WebSocketServer;

export function initWebSocket(server: Express) {

}

export function broadcastToBoard(boardId: string,event: string,payload: any) {

}
