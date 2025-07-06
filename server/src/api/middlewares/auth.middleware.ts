import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user.model';
import { config } from '../../config/config';

// Extend Request interface to include user
export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

// Protect routes - verify JWT token
export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

      // Find user by ID from token
      const user = await User.findById(decoded.id);

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'No user found with this token'
        });
        return;
      }

      if (!user.isActive) {
        res.status(401).json({
          success: false,
          error: 'User account is deactivated'
        });
        return;
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
      return;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error in authentication'
    });
  }
};

// Grant access to specific roles
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
      return;
    }

    // For now, we'll check subscription status
    // You can extend this to check specific roles/permissions
    if (roles.includes('premium') && req.user.subscriptionStatus === 'free') {
      res.status(403).json({
        success: false,
        error: 'Premium subscription required for this feature'
      });
      return;
    }

    next();
  };
};

// Optional auth - doesn't fail if no token
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        // Verify token
        const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

        // Find user by ID from token
        const user = await User.findById(decoded.id);

        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token invalid, but we don't fail the request
        console.log('Invalid token in optional auth:', error);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue even if there's an error
  }
};

// Rate limiting for authentication endpoints
export const authRateLimit = (maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    // Clean up expired entries
    for (const [key, value] of attempts.entries()) {
      if (now > value.resetTime) {
        attempts.delete(key);
      }
    }

    const current = attempts.get(ip);

    if (!current) {
      attempts.set(ip, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    if (current.count >= maxAttempts) {
      const timeLeft = Math.ceil((current.resetTime - now) / 1000 / 60);
      res.status(429).json({
        success: false,
        error: `Too many authentication attempts. Try again in ${timeLeft} minutes.`
      });
      return;
    }

    current.count++;
    next();
  };
};

// CORS middleware for API
export const corsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const allowedOrigins = [
    config.clientURL,
    'http://localhost:3000',
    'http://localhost:3001',
    'https://prevently.vercel.app',
    'https://prevently-ai.netlify.app'
  ];

  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const { method, url, ip } = req;
  const userAgent = req.headers['user-agent'] || 'unknown';

  // Log request
  console.log(`📝 ${method} ${url} - ${ip} - ${userAgent}`);

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusEmoji = statusCode >= 400 ? '❌' : statusCode >= 300 ? '⚠️' : '✅';
    
    console.log(`${statusEmoji} ${method} ${url} - ${statusCode} - ${duration}ms`);
    
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Error handling middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('API Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val: any) => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

// Health check middleware
export const healthCheck = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    environment: config.nodeEnv
  });
};