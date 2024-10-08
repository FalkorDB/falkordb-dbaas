import fp from 'fastify-plugin';
import type { FastifyRequest } from 'fastify/types/request';
import { ApiError } from '@falkordb/errors';
import { TObject } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

export default fp(
  async function pubsubDecodePlugin(fastify, opts) {
    fastify.decorate('pubsubDecode', function pubsubDecode(request: FastifyRequest, schema?: TObject) {
      const pubsubMessage =
        typeof request.body === 'object' && 'message' in request.body ? (request.body.message as object) : null;
      if (!pubsubMessage) {
        throw ApiError.badRequest('Invalid pubsub message', 'INVALID_PUBSUB_MESSAGE');
      }
      const base64: string | null =
        typeof pubsubMessage === 'object' && 'data' in pubsubMessage ? (pubsubMessage.data as string) : null;

      if (!base64) {
        throw ApiError.badRequest('Invalid pubsub message: missing data attribute', 'INVALID_PUBSUB_MESSAGE');
      }
      const data = Buffer.from(base64, 'base64').toString('utf-8');
      try {
        pubsubMessage['data'] = JSON.parse(data);
      } catch (error) {
        throw ApiError.badRequest('Invalid pubsub message: data is not a valid json', 'INVALID_PUBSUB_MESSAGE');
      }

      if (schema && !Value.Check(schema, pubsubMessage["data"])) {
        console.log(Array.from(Value.Errors(schema, pubsubMessage["data"])));
        throw ApiError.badRequest('Invalid pubsub message: data does not match schema', 'INVALID_PUBSUB_MESSAGE');
      }
      return pubsubMessage;
    });
  },
  {
    name: 'pubsub-decode-plugin',
  },
);
