import axios, { AxiosError } from 'axios';

const _client = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const caller = {
  get: async (
    path: string,
    opts?: {
      headers?: any;
      params?: any;
    },
  ) => {
    const res = await _client.get(path, opts);
    return res.data;
  },

  post: async (
    path: string,
    data: any,
    opts?: {
      headers?: any;
      params?: any;
    },
  ) => {
    const res = await _client.post(path, data, opts);
    return res.data;
  },

  put: async (
    path: string,
    data: any,
    opts?: {
      headers?: any;
      params?: any;
    },
  ) => {
    const res = await _client.put(path, data, opts);
    return res.data;
  },

  delete: async (
    path: string,
    opts?: {
      headers?: any;
      params?: any;
    },
  ) => {
    const res = await _client.delete(path, opts);
    return res.data;
  },
};
