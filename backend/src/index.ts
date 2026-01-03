import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import apiRoutes from './routes/api';
import { initializeDatabase } from './config/init';
import { initializeWhatsApp } from './services/whatsapp';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for production deployment
app.set('trust proxy', true);

// Initialize database on startup
initializeDatabase();

// Initialize WhatsApp connection
initializeWhatsApp();

// Add preflight handler
app.options('*', cors());
app.use(cors({
  origin: true, // Allow all origins for mobile apps
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'User-Agent']
}));

// Rate limiting - disabled in development
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    skip: (req) => req.method === 'OPTIONS',
    message: {
      success: false,
      message: 'Too many requests',
      responseCode: 'RC_429',
      error: 'Rate limit exceeded',
      timestamp: new Date().toISOString()
    }
  });
  app.use('/api/', limiter);
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);  // Auth routes: /api/auth/*
app.use('/api', apiRoutes);        // Other routes: /api/*

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Not found',
    responseCode: 'RC_404',
    error: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: 'Internal server error',
    responseCode: 'RC_500',
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
});

export default app;