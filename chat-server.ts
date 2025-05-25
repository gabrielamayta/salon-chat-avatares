import type { ServerWebSocket } from "bun"; 

const connections = new Set<ServerWebSocket>();

Bun.serve({
  port: 8080,
  hostname: "0.0.0.0",

  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/ws") {
      const success = server.upgrade(req);
      if (success) {
        return new Response("WebSocket connection upgraded", { status: 101 });
      }
      return new Response("WebSocket upgrade failed", { status: 400 });
    }
    return new Response("Bienvenido al servidor Bun. Conéctate a /ws para el chat.");
  },

  websocket: {
    open(ws: ServerWebSocket) {
      console.log(`[${new Date().toLocaleTimeString()}] Cliente conectado desde ${ws.remoteAddress}`);
      connections.add(ws);
      ws.send(JSON.stringify({
        id: 'server_welcome',
        userId: 'Servidor',
        text: `¡Bienvenido al chat! Actualmente hay ${connections.size} usuario(s) conectado(s).`,
        timestamp: Date.now(),
        avatar: { color: 'violeta' }
      }));
    },

    async message(ws: ServerWebSocket, message: string | Buffer) {
      console.log(`[${new Date().toLocaleTimeString()}] Mensaje recibido de ${ws.remoteAddress}: ${message}`);
      
      try {
        const parsedMessage = JSON.parse(message.toString());
        if (!parsedMessage.timestamp) {
            parsedMessage.timestamp = Date.now();
        }

        for (const client of connections) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(parsedMessage));
          }
        }
      } catch (error) {
        console.error('Error al parsear o reenviar mensaje:', error);
      }
    },

    close(ws: ServerWebSocket, code: number, reason: string) {
      console.log(`[${new Date().toLocaleTimeString()}] Cliente desconectado (${code} - ${reason || 'Sin razón'}): ${ws.remoteAddress}`);
      connections.delete(ws);
      for (const client of connections) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              id: 'server_disconnect',
              userId: 'Servidor',
              text: `Un usuario se ha desconectado. Quedan ${connections.size} usuario(s).`,
              timestamp: Date.now(),
              avatar: { color: 'violeta' }
            }));
          }
        }
    },

    
  },
});

console.log(`Servidor Bun WebSocket escuchando en http://localhost:8080/ws`);
console.log(`Presiona Ctrl+C para detener el servidor.`);