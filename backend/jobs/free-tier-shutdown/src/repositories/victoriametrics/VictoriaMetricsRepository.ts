import { Logger } from 'pino';
import axios, { AxiosInstance } from 'axios';

export class VictoriaMetricsRepository {
  private client: AxiosInstance;

  constructor(
    private serverUrl: string,
    private _options: { logger: Logger },
  ) {
    this.client = axios.create({
      baseURL: serverUrl,
    });
  }

  /**
   * Query the number of graph.query commands executed in the last 24 hours for a specific namespace
   * @param namespace - The namespace (instance ID)
   * @returns The count of graph.query commands, 0 if none found, or null if query fails
   */
  async getGraphQueryCount(namespace: string): Promise<number | null> {
    try {
      // Validate and sanitize namespace to prevent PromQL injection
      // Only allow alphanumeric characters, hyphens, and underscores
      // Note: VictoriaMetrics/Prometheus API doesn't support parameterized queries,
      // so whitelist validation is the industry-standard approach for this API
      if (!/^[a-zA-Z0-9_-]+$/.test(namespace)) {
        this._options.logger.error({ namespace }, 'Invalid namespace format');
        return null;
      }

      // Query for the sum of graph.query commands in the last 24 hours
      // Use the container="service" to target the service container in node-f-0
      const query = `sum(increase(redis_commands_total{cmd="graph.query",namespace="${namespace}",container="service"}[24h]))`;

      this._options.logger.info({ namespace, query }, 'Querying VictoriaMetrics for graph.query count');

      const response = await this.client.get('/api/v1/query', {
        params: {
          query,
        },
      });

      if (response.data.status !== 'success') {
        this._options.logger.error({ namespace, response: response.data }, 'Failed to query VictoriaMetrics');
        return null;
      }

      const result = response.data.data?.result;
      if (!result || result.length === 0) {
        this._options.logger.info({ namespace }, 'No graph.query metrics found for namespace');
        return 0;
      }

      // Extract the value from the result
      const value = parseFloat(result[0].value[1]);
      this._options.logger.info({ namespace, value }, 'Graph query count retrieved from VictoriaMetrics');

      return isNaN(value) ? 0 : value;
    } catch (error) {
      this._options.logger.error({ namespace, error }, 'Error querying VictoriaMetrics');
      return null;
    }
  }
}
