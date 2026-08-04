import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { config } from './config/env';
import { seedAdmin } from './modules/auth/controller';
import authRoutes from './modules/auth/routes';
import studentRoutes from './modules/student/routes';
import businessRoutes from './modules/business/routes';
import adminRoutes from './modules/admin/routes';
import communityRoutes from './modules/community/routes';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/community', communityRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'business-orbit-api' });
});

// Root route
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Business Orbit API' });
});

// Start server
const startServer = async () => {
  try {
    await connectDatabase();
    await seedAdmin();
    
    const port = config.port;
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
