import { Server } from 'socket.io';

let io = null;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('join-user-room', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });
  });

  return io;
}

export function getSocket() {
  return io;
}
