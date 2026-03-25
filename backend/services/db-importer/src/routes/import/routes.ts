import { ImportRDBConfirmUploadRequestBodySchema, ImportRDBConfirmUploadResponseBodySchema, ImportRDBRequestUploadURLRequestBodySchema, ImportRDBRequestUploadURLResponseBodySchema } from '@falkordb/schemas/services/import-export-rdb/v1/index';
import fp from 'fastify-plugin';
import { importRDBRequestUrlHandler } from './handlers/importRDBRequestUrlHandler';
import { importRDBConfirmUploadHandler } from './handlers/importRDBConfirmUploadHandler';

export default fp(
    async function handler(fastify, opts) {
        fastify.post(
            '/import/request-url',
            {
                preHandler: async (request) => {
                    await fastify.authenticateOmnistrate(request);
                },
                schema: {
                    tags: ['import'],
                    body: ImportRDBRequestUploadURLRequestBodySchema,
                    response: {
                        200: ImportRDBRequestUploadURLResponseBodySchema,
                    },
                    security: [
                        {
                            "bearerAuth": []
                        }
                    ]
                },
            },
            importRDBRequestUrlHandler,
        );


        fastify.post(
            '/import/confirm-upload',
            {
                preHandler: async (request) => {
                    await fastify.authenticateOmnistrate(request);
                },
                schema: {
                    tags: ['import'],
                    body: ImportRDBConfirmUploadRequestBodySchema,
                    response: {
                        202: ImportRDBConfirmUploadResponseBodySchema,
                    },
                    security: [
                        {
                            "bearerAuth": []
                        }
                    ]
                },
            },
            importRDBConfirmUploadHandler,
        );
    },
    {
        name: 'import-routes',
    },
);
