import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { errorHandler } from './middleware/error';

// ── Routes ────────────────────────────────────────────────────────────────
import authRoutes         from './routes/auth';
import itemRoutes         from './routes/items';
import claimRoutes        from './routes/claims';
import userRoutes         from './routes/users';
import dashboardRoutes    from './routes/dashboard';
import notificationRoutes from './routes/notifications';
import chatRoutes         from './routes/chat';
import adminRoutes        from './routes/admin';
import aiRoutes           from './routes/ai';
import reportRoutes       from './routes/reports';

const app = express();

// Trust Render/proxy X-Forwarded-For headers (required for express-rate-limit)
app.set('trust proxy', 1);

// ── Security & Middleware ─────────────────────────────────────────────────
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(compression() as any);
app.use(cookieParser());

// CORS
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods:     ['GET','POST','PUT','DELETE','OPTIONS','PATCH'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max:      100,
  message:  { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { success: false, message: 'Too many auth attempts. Please wait 15 minutes.' },
});

app.use('/api', limiter);
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);

// ── API Routes ────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/items',         itemRoutes);
app.use('/api/claims',        claimRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/dashboard',     dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/conversations', chatRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/ai',            aiRoutes);
app.use('/api/reports',       reportRoutes);

// ── Health check ──────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'FindIt API is running 🚀', timestamp: new Date().toISOString() });
});

// ── Serve static uploads (if using local storage) ─────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Error handler ─────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
