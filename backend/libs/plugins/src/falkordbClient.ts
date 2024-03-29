import fp from 'fastify-plugin';
import { FalkorDBClient, IFalkorDBOpts } from '@falkordb/rest-client';

export default fp(
  async function client(fastify, opts: IFalkorDBOpts) {
    const falkordb = FalkorDBClient(opts);
    fastify.decorate('falkordbClient', falkordb);

    if (opts.injectContext) {
      fastify.addHook('onRequest', async (request) => {
        falkordb.setHeaders({
          'x-falkordb-userId': request.headers['x-falkordb-userId'],
          'x-falkordb-organizationId': request.headers['x-falkordb-userId'],
          'request-id': request.id,
        });
      });
    }
  },
  {
    name: 'falkordb-client',
  },
);
