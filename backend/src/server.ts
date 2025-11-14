import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import 'express-async-errors';
import { config } from './config';
import { logger, log } from './common/logger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { connectDatabase } from './database/prisma';
import { resolveTenant } from './middleware/tenant.middleware';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import tenantRoutes from './modules/tenant/tenant.routes';
import employeeRoutes from './modules/employee/employee.routes';
import departmentRoutes from './modules/department/department.routes';
import positionRoutes from './modules/position/position.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import leaveRoutes from './modules/leave/leave.routes';
import userRoutes from './modules/user/user.routes';
import notificationRoutes from './modules/notification/notification.routes';

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger);

// Apply tenant resolver globally
app.use(resolveTenant);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'oPersonel API is running',
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

// API routes
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to oPersonel API',
    version: '1.0.0',
    tenant: req.tenant ? { id: req.tenant.id, name: req.tenant.name } : null,
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Connect to database and start server
const PORT = config.port;

connectDatabase().then(() => {
  app.listen(PORT, () => {
    log.info('🚀 oPersonel Backend Server');
    log.info(`📍 Port: ${PORT}`);
    log.info(`🌍 Environment: ${config.env}`);
    log.info(`📝 API Documentation: http://localhost:${PORT}/api`);
    log.info(`🏥 Health Check: http://localhost:${PORT}/health`);
  });
});

export default app;
