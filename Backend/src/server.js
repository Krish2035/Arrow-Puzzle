import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cluster from 'node:cluster';
import { checkDatabaseConnection, getIsPgConnected, getIsReplicaConnected } from './config/db.js';
import { isRedisConnected } from './config/redis.js';
import { setupSwagger } from './config/swagger.js';
import { generalLimiter } from './middlewares/rateLimiter.js';
import { buildSearchIndex } from './services/searchService.js';
import levelRoutes from './routes/levelRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for load balancers (e.g., Nginx, ALB, Cloudflare)
app.set('trust proxy', 1);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Apply global rate limiting
app.use(generalLimiter);

// Request logger with cluster worker ID info
app.use((req, res, next) => {
  const workerInfo = cluster.isWorker ? `[Worker ${cluster.worker.id}]` : '[Standalone]';
  console.log(`${workerInfo} [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Setup Swagger UI Documentation at /api/docs and /docs
setupSwagger(app);

// Enhanced Health check endpoint with cluster, DB, replica, and cache info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    service: 'Arrow Puzzle Backend API',
    cluster: {
      isWorker: cluster.isWorker,
      workerId: cluster.isWorker ? cluster.worker.id : 1,
      pid: process.pid
    },
    database: {
      primary: getIsPgConnected() ? 'connected' : 'in-memory-fallback',
      readReplica: getIsReplicaConnected() ? 'connected' : 'primary-fallback'
    },
    cache: {
      redis: isRedisConnected() ? 'connected' : 'resilient-in-memory-fallback'
    },
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
  });
});

// Mount routes
app.use('/api/levels', levelRoutes);
app.use('/api/user', userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

export async function startServer() {
  const server = app.listen(PORT, () => {
    const workerLabel = cluster.isWorker ? `Worker #${cluster.worker.id}` : 'Master Node';
    console.log(`🚀 Arrow Puzzle Server (${workerLabel}, PID ${process.pid}) running on http://localhost:${PORT}`);
    console.log(`📚 Interactive Swagger API Docs: http://localhost:${PORT}/api/docs`);
  });

  // Warm up search index and verify database
  checkDatabaseConnection().catch(() => {});
  buildSearchIndex().catch(() => {});

  return server;
}

// Auto-start when executed directly
if (!cluster.isPrimary || !process.env.CLUSTER_ENABLED) {
  startServer();
}

export default app;
