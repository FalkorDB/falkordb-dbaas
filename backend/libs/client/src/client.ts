import axios, { AxiosInstance } from 'axios';
import { propagation, context } from '@opentelemetry/api';

export interface IClientOpts {
  url: string;
}

export class Client {
  private _client: AxiosInstance;

  constructor(opts?: IClientOpts) {
    this._client = axios.create({
      baseURL: opts.url,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private _stringifyQueryParams(params: object) {
    return Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join('&');
  }

  private _openTelemetryPropagation() {
    const traceHeaders = {};
    propagation.inject(context.active(), traceHeaders);
    return traceHeaders;
  }

  setHeaders(headers: object) {
    this._client.defaults.headers = {
      ...this._client.defaults.headers,
      ...headers,
    };
  }

  async get(
    path: string,
    opts?: {
      headers?: any;
      params?: any;
      query?: any;
    },
  ) {
    const headers = {
      ...this._openTelemetryPropagation(),
      ...opts?.headers,
    };
    const res = await this._client.get(`${path}?${this._stringifyQueryParams(opts?.query ?? {})}`, {
      headers,
      params: opts?.params,
    });
    return res.data;
  }

  async post(
    path: string,
    data: any,
    opts?: {
      headers?: any;
      params?: any;
      query?: any;
    },
  ) {
    const headers = {
      ...this._openTelemetryPropagation(),
      ...opts?.headers,
    };
    const res = await this._client.post(`${path}?${this._stringifyQueryParams(opts?.query ?? {})}`, data, {
      headers,
      params: opts?.params,
    });
    return res.data;
  }

  async put(
    path: string,
    data: any,
    opts?: {
      headers?: any;
      params?: any;
      query?: any;
    },
  ) {
    const headers = {
      ...this._openTelemetryPropagation(),
      ...opts?.headers,
    };
    const res = await this._client.put(`${path}?${this._stringifyQueryParams(opts?.query ?? {})}`, data, {
      headers,
      params: opts?.params,
    });
    return res.data;
  }

  async delete(
    path: string,
    opts?: {
      headers?: any;
      params?: any;
      query?: any;
    },
  ) {
    const headers = {
      ...this._openTelemetryPropagation(),
      ...opts?.headers,
    };
    const res = await this._client.delete(`${path}?${this._stringifyQueryParams(opts?.query ?? {})}`, {
      headers,
      params: opts?.params,
    });
    return res.data;
  }
}
