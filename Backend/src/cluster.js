import cluster from 'node:cluster';
import os from 'node:os';
import dotenv from 'dotenv';
import { startServer } from './server.js';

dotenv.config();

const numCPUs = os.cpus().length;
const WORKERS = parseInt(process.env.WORKERS, 10) || Math.min(numCPUs, 4);

if (cluster.isPrimary) {
  console.log(`\n======================================================`);
  console.log(`⚡ ARROW PUZZLE HORIZONTAL CLUSTERING LOAD BALANCER`);
  console.log(`======================================================`);
  console.log(`[Master PID ${process.pid}] Spawning ${WORKERS} worker instances across ${numCPUs} CPU cores...`);

  // Spawn workers
  for (let i = 0; i < WORKERS; i++) {
    cluster.fork();
  }

  cluster.on('online', (worker) => {
    console.log(`✅ [Worker ${worker.id}] (PID ${worker.process.pid}) is active and serving traffic`);
  });

  cluster.on('exit', (worker, code, signal) => {
    console.warn(`⚠️ [Worker ${worker.id}] (PID ${worker.process.pid}) exited (signal: ${signal || code}). Auto-healing: spawning replacement worker...`);
    cluster.fork();
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('Master received SIGTERM, shutting down all workers gracefully...');
    for (const id in cluster.workers) {
      cluster.workers[id].kill('SIGTERM');
    }
    process.exit(0);
  });

} else {
  // Worker process
  startServer();
}
