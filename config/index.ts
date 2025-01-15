export const config = {
  app: {
    name: 'Digital Scouts Program',
    version: '1.0.0',
    description: 'A digital platform for learning tech skills and earning badges',
    environment: process.env.NODE_ENV || 'development',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiresIn: '24h',
    refreshTokenExpiresIn: '7d',
  },
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    version: 'v1',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  services: {
    stripe: {
      publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
      secretKey: process.env.STRIPE_SECRET_KEY,
    },
    firebase: {
      apiKey: process.env.FIREBASE_API_KEY,
      projectId: process.env.FIREBASE_PROJECT_ID,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    },
    analytics: {
      googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
    },
  },
  security: {
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    rateLimiting: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },
} as const;
