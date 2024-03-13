import axios, { AxiosInstance } from 'axios';

export class Client {
  private _client: AxiosInstance;

  constructor(opts?: { url: string }) {
    this._client = axios.create({
      baseURL: opts?.url ?? 'http://localhost:3000',
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
    const res = await this._client.get(`${path}?${this._stringifyQueryParams(opts?.query ?? {})}`, {
      headers: opts?.headers,
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
    const res = await this._client.post(`${path}?${this._stringifyQueryParams(opts?.query ?? {})}`, data, {
      headers: opts?.headers,
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
    const res = await this._client.put(`${path}?${this._stringifyQueryParams(opts?.query ?? {})}`, data, {
      headers: opts?.headers,
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
    const res = await this._client.delete(`${path}?${this._stringifyQueryParams(opts?.query ?? {})}`, {
      headers: opts?.headers,
      params: opts?.params,
    });
    return res.data;
  }
}
