import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import http from 'http';

interface ExtWebSocket extends WebSocket {
  userId?: string;
  isAlive: boolean;
}

const clients = new Map<string, Set<ExtWebSocket>>();

export const setupWsServer = (server: http.Server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: ExtWebSocket, req: http.IncomingMessage) => {
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });

    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(1008, 'Token required');
      return;
    }

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.error('CRITICAL: JWT_SECRET not set');
        ws.close(1011, 'Server configuration error');
        return;
      }
      const decoded: any = jwt.verify(token, secret);
      ws.userId = decoded.id;

      if (!clients.has(decoded.id)) {
        clients.set(decoded.id, new Set());
      }
      clients.get(decoded.id)!.add(ws);

      ws.on('close', () => {
        if (ws.userId && clients.has(ws.userId)) {
          clients.get(ws.userId)!.delete(ws);
          if (clients.get(ws.userId)!.size === 0) {
            clients.delete(ws.userId);
          }
        }
      });
    } catch (err) {
      ws.close(1008, 'Invalid token');
    }
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws: any) => {
      const extWs = ws as ExtWebSocket;
      if (!extWs.isAlive) return extWs.terminate();
      extWs.isAlive = false;
      extWs.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  return wss;
};

export const broadcastToUser = (userId: string, data: any) => {
  const userClients = clients.get(userId);
  if (userClients) {
    const payload = JSON.stringify(data);
    userClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }
};

export const broadcastToAll = (data: any) => {
  const payload = JSON.stringify(data);
  clients.forEach(userClients => {
    userClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  });
};
