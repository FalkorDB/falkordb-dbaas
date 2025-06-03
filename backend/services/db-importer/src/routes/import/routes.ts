import { ImportRDBConfirmUploadRequestBodySchema, ImportRDBConfirmUploadResponseBodySchema, ImportRDBRequestUploadURLRequestBodySchema, ImportRDBRequestUploadURLResponseBodySchema } from '@falkordb/schemas/services/import-export-rdb/v1/index';
import fp from 'fastify-plugin';
import { importRDBRequestUrlHandler } from './handlers/importRDBRequestUrlHandler';
import { importRDBConfirmUploadHandler } from './handlers/importRDBConfirmUploadHandler';

export default fp(
    async function handler(fastify, opts) {
        fastify.addHook('preHandler', async (request) => {
            if (request.routerPath.startsWith('/import')) {
                await fastify.authenticateOmnistrate(request);
            }
        });


        fastify.post(
            '/import/request-url',
            {
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
