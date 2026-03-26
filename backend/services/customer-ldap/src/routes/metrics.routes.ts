import fp from 'fastify-plugin';
import { Registry, Gauge } from 'prom-client';

// Module-level singleton registry and gauges to avoid re-registration on hot reload
const register = new Registry();

const queueWaiting = new Gauge({
  name: 'bullmq_queue_jobs_waiting',
  help: 'Number of jobs waiting in the queue',
  labelNames: ['queue'],
  registers: [register],
});

const queueActive = new Gauge({
  name: 'bullmq_queue_jobs_active',
  help: 'Number of jobs currently being processed',
  labelNames: ['queue'],
  registers: [register],
});

const queueCompleted = new Gauge({
  name: 'bullmq_queue_jobs_completed',
  help: 'Number of completed jobs retained in the queue',
  labelNames: ['queue'],
  registers: [register],
});

const queueFailed = new Gauge({
  name: 'bullmq_queue_jobs_failed',
  help: 'Number of failed jobs retained in the queue',
  labelNames: ['queue'],
  registers: [register],
});

const queueDelayed = new Gauge({
  name: 'bullmq_queue_jobs_delayed',
  help: 'Number of delayed jobs in the queue',
  labelNames: ['queue'],
  registers: [register],
});

// Cache to reduce Redis load; refreshed at most every 10 seconds
const CACHE_TTL_MS = 10_000;
let cachedMetrics: string | null = null;
let cacheTimestamp = 0;

export default fp(
  async function metricsRoutes(fastify) {
    fastify.get(
      '/metrics',
      {
        logLevel: 'silent',
        schema: {
          hide: true,
        },
      },
      async (_, reply) => {
        const now = Date.now();

        if (!cachedMetrics || now - cacheTimestamp > CACHE_TTL_MS) {
          const counts = await fastify.queueManager.getJobCounts();

          for (const queue of counts) {
            queueWaiting.set({ queue: queue.name }, queue.waiting);
            queueActive.set({ queue: queue.name }, queue.active);
            queueCompleted.set({ queue: queue.name }, queue.completed);
            queueFailed.set({ queue: queue.name }, queue.failed);
            queueDelayed.set({ queue: queue.name }, queue.delayed);
          }

          cachedMetrics = await register.metrics();
          cacheTimestamp = now;
        }

        reply.header('Content-Type', register.contentType);
        return reply.send(cachedMetrics);
      },
    );
  },
  {
    name: 'v1-metrics-routes',
  },
);
