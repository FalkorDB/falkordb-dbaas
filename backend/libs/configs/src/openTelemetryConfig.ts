import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
// set logger
// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

import { BatchSpanProcessor, RandomIdGenerator } from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_DEPLOYMENT_ENVIRONMENT } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTTracePropagator } from '@opentelemetry/propagator-ot-trace';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

class CustomIDGenerator implements RandomIdGenerator {
  private _generator = new RandomIdGenerator();
  private PADDING = '0'.repeat(16);

  generateTraceId(): string {
    return `${this.PADDING}${this._generator.generateTraceId().substring(0, 16)}`;
  }
  generateSpanId(): string {
    return this._generator.generateSpanId();
  }
}

const hostName = process.env.OTEL_TRACE_HOST || 'localhost';

export const init = (serviceName: string, environment: string) => {
  if (process.env.SKIP_TRACING === 'true') return;

  const exporter = new OTLPTraceExporter({
    url: `http://${hostName}:4318/v1/traces`,
  });

  const provider = new NodeSDK({
    idGenerator: new CustomIDGenerator(),
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: serviceName,
      [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: environment,
    }),
    traceExporter: exporter,
    spanProcessors: [new BatchSpanProcessor(exporter)],
    textMapPropagator: new OTTracePropagator(),
    contextManager: new AsyncHooksContextManager().enable(),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  provider.start();

  console.log('tracing initialized');
};
