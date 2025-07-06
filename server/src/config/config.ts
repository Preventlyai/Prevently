import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Define the schema for environment variables
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5001'),
  MONGO_URI: z.string().min(1, 'MongoDB URI is required'),
  JWT_SECRET: z.string().min(10, 'JWT Secret must be at least 10 characters'),
  JWT_EXPIRE: z.string().default('30d'),
  JWT_COOKIE_EXPIRE: z.string().transform(Number).default('30'),
  CLIENT_URL: z.string().url().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW: z.string().transform(Number).default('15'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  MAX_FILE_UPLOAD: z.string().transform(Number).default('1000000'),
  FILE_UPLOAD_PATH: z.string().default('./public/uploads'),
  EMAIL_FROM: z.string().email().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  HEALTH_API_KEY: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

// Validate environment variables
const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('❌ Invalid environment variables:');
  env.error.issues.forEach((issue) => {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

export const config = {
  nodeEnv: env.data.NODE_ENV,
  port: env.data.PORT,
  mongoURI: env.data.MONGO_URI,
  jwtSecret: env.data.JWT_SECRET,
  jwtExpire: env.data.JWT_EXPIRE,
  jwtCookieExpire: env.data.JWT_COOKIE_EXPIRE,
  clientURL: env.data.CLIENT_URL,
  rateLimitWindow: env.data.RATE_LIMIT_WINDOW,
  rateLimitMaxRequests: env.data.RATE_LIMIT_MAX_REQUESTS,
  maxFileUpload: env.data.MAX_FILE_UPLOAD,
  fileUploadPath: env.data.FILE_UPLOAD_PATH,
  email: {
    from: env.data.EMAIL_FROM,
    smtp: {
      host: env.data.SMTP_HOST,
      port: env.data.SMTP_PORT,
      user: env.data.SMTP_USER,
      pass: env.data.SMTP_PASS,
    },
  },
  openaiApiKey: env.data.OPENAI_API_KEY,
  healthApiKey: env.data.HEALTH_API_KEY,
  cloudinary: {
    cloudName: env.data.CLOUDINARY_CLOUD_NAME,
    apiKey: env.data.CLOUDINARY_API_KEY,
    apiSecret: env.data.CLOUDINARY_API_SECRET,
  },
};

export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';
export const isTest = config.nodeEnv === 'test';