import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import connectDB from './config/database';
import { config, isDevelopment } from './config/config';

// Import middlewares
import {
  corsMiddleware,
  requestLogger,
  errorHandler,
  healthCheck
} from './api/middlewares/auth.middleware';

// Import routes
import authRoutes from './api/routes/auth.routes';
import symptomRoutes from './api/routes/symptom.routes';

// Create Express app
const app = express();

// Connect to database
connectDB();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:", "wss:"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(corsMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindow * 60 * 1000, // Convert minutes to milliseconds
  max: config.rateLimitMaxRequests,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and static files
    return req.path === '/health' || req.path.startsWith('/static');
  }
});

app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Compression
app.use(compression());

// Logging
if (isDevelopment) {
  app.use(morgan('dev'));
  app.use(requestLogger);
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', healthCheck);
app.get('/api/health', healthCheck);

// API Info endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Prevently AI API',
    version: '1.0.0',
    environment: config.nodeEnv,
    endpoints: {
      auth: '/api/auth',
      symptoms: '/api/symptoms',
      health: '/api/health'
    },
    documentation: 'https://docs.prevently.ai',
    support: 'support@prevently.ai'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/symptoms', symptomRoutes);

// Handle 404
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`📨 Received ${signal}. Starting graceful shutdown...`);
  
  // Stop accepting new requests
  server.close((err) => {
    if (err) {
      console.error('❌ Error during server shutdown:', err);
      process.exit(1);
    }
    
    console.log('🛑 HTTP server closed');
    
    // Close database connection
    import('mongoose').then(mongoose => {
      mongoose.connection.close(() => {
        console.log('🗄️ MongoDB connection closed');
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      });
    });
  });
  
  // Force close server after 30 seconds
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Start server
const PORT = config.port || 5001;
const server = app.listen(PORT, () => {
  console.log(`
🚀 Prevently AI Server Started Successfully!

📊 Environment: ${config.nodeEnv}
🌐 Port: ${PORT}
🗄️ Database: MongoDB
🔒 Security: Helmet + CORS + Rate Limiting
📝 Logging: ${isDevelopment ? 'Development' : 'Production'} mode

📚 API Documentation: http://localhost:${PORT}/api
💚 Health Check: http://localhost:${PORT}/health

🔧 Available Routes:
   POST /api/auth/register
   POST /api/auth/login
   GET  /api/auth/me
   POST /api/symptoms
   GET  /api/symptoms
   GET  /api/symptoms/analytics

Ready to serve! 🎉
`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('💥 Unhandled Promise Rejection:', err.message);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('💥 Uncaught Exception:', err.message);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle SIGTERM
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;