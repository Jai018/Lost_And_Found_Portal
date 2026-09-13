import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const connectedUsers = new Map<string, string>(); // userId → socketId

export const setupSocket = (io: Server) => {
  // Auth middleware for sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'findit-secret-key') as { id: string };
      (socket as any).userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId as string;
    connectedUsers.set(userId, socket.id);

    console.log(`[Socket] User ${userId} connected (${socket.id})`);

    socket.on('join_room', (conversationId: string) => {
      socket.join(conversationId);
    });

    socket.on('leave_room', (conversationId: string) => {
      socket.leave(conversationId);
    });

    socket.on('send_message', ({ conversationId, message }: { conversationId: string; message: any }) => {
      socket.to(conversationId).emit('receive_message', message);
    });

    socket.on('typing', (conversationId: string) => {
      socket.to(conversationId).emit('user_typing', userId);
    });

    socket.on('stop_typing', (conversationId: string) => {
      socket.to(conversationId).emit('stop_typing', userId);
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      console.log(`[Socket] User ${userId} disconnected`);
    });
  });
};

export const emitToUser = (io: Server, userId: string, event: string, data: any) => {
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};

export const isOnline = (userId: string): boolean => connectedUsers.has(userId);
