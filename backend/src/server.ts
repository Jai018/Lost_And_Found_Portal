import 'dotenv/config';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import app from './app';
import { connectDB } from './config/database';
import { setupSocket } from './services/socket.service';

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

// ── Socket.IO ─────────────────────────────────────────────────────────────
const io = new SocketIO(httpServer, {
  cors: {
    origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

setupSocket(io);

// ── Startup ───────────────────────────────────────────────────────────────
const start = async () => {
  try {
    await connectDB();

    httpServer.listen(PORT, () => {
      console.log('\n🚀 FindIt Server started!');
      console.log(`   API:    http://localhost:${PORT}/api`);
      console.log(`   Health: http://localhost:${PORT}/api/health`);
      console.log(`   Mode:   ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

start();

export { io };
