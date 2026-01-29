import { configDotenv } from 'dotenv';
configDotenv();

import { init } from '@falkordb/configs';
init(process.env.SERVICE_NAME || 'cluster-discovery', process.env.NODE_ENV);

import { type FastifyInstance, type FastifyPluginOptions } from 'fastify';
import Sensible from '@fastify/sensible';
import Env from '@fastify/env';
import openTelemetryPlugin from '@autotelic/fastify-opentelemetry';
import { EnvSchema } from './schemas/env.schema';
import { runDiscovery } from './scanner';

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions): Promise<void> {
  // Register environment variables validation
  await fastify.register(Env, {
    schema: EnvSchema,
    dotenv: true,
    data: opts.configData,
  });

  await fastify.register(Sensible);

  // Register OpenTelemetry if enabled
  if (fastify.config.OTEL_ENABLED) {
    await fastify.register(openTelemetryPlugin, {
      wrapRoutes: true,
    } as any);
  }

  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'ok',
      service: fastify.config.SERVICE_NAME,
      timestamp: new Date().toISOString(),
    };
  });

  // Readiness check endpoint
  fastify.get('/ready', async (request, reply) => {
    return {
      status: 'ready',
      service: fastify.config.SERVICE_NAME,
      timestamp: new Date().toISOString(),
    };
  });

  // Metrics endpoint (basic info)
  fastify.get('/metrics', async (request, reply) => {
    return {
      service: fastify.config.SERVICE_NAME,
      scanInterval: fastify.config.SCAN_INTERVAL_MS,
      environment: fastify.config.NODE_ENV,
    };
  });

  // Omnistrate webhook endpoint for cell deletion
  fastify.post('/omnistrate/cell-delete-started', async (request, reply) => {
    // Authenticate using bearer token
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    if (token !== fastify.config.OMNISTRATE_WEBHOOK_TOKEN) {
      return reply.code(403).send({ error: 'Invalid token' });
    }

    // Validate request body
    const body = request.body as { payload?: { deploymentCellId?: string } };
    if (!body?.payload?.deploymentCellId) {
      return reply.code(400).send({ error: 'Missing deploymentCellId in payload' });
    }

    const { deploymentCellId } = body.payload;
    fastify.log.info({ deploymentCellId }, 'Received cell-delete-started webhook');

    try {
      const { handleCellDeletion } = await import('./services/CellDeletionService.js');
      await handleCellDeletion(deploymentCellId);
      
      return reply.code(200).send({ 
        success: true, 
        message: 'Cell deletion processed successfully',
        deploymentCellId 
      });
    } catch (error) {
      fastify.log.error({ error, deploymentCellId }, 'Failed to handle cell deletion');
      return reply.code(500).send({ 
        error: 'Failed to process cell deletion',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Start the recurring scanner after server initialization
  fastify.addHook('onReady', async () => {
    startRecurringScanner(fastify);
  });
}

function startRecurringScanner(fastify: FastifyInstance) {
  let isRunning = false;
  const intervalMs = fastify.config.SCAN_INTERVAL_MS;

  fastify.log.info({ intervalMs }, 'Starting recurring cluster discovery scanner');

  const runScan = async () => {
    if (isRunning) {
      fastify.log.debug('Previous scan still running, skipping this iteration');
      return;
    }

    isRunning = true;
    const startTime = Date.now();

    try {
      fastify.log.info('Starting cluster discovery scan');
      await runDiscovery(fastify.config);
      const duration = Date.now() - startTime;
      fastify.log.info({ durationMs: duration }, 'Cluster discovery scan completed successfully');
    } catch (error) {
      const duration = Date.now() - startTime;
      fastify.log.error({ error, durationMs: duration }, 'Error during cluster discovery scan');
    } finally {
      isRunning = false;
    }
  };

  // Run initial scan immediately
  runScan();

  // Schedule recurring scans
  setInterval(runScan, intervalMs);
}
