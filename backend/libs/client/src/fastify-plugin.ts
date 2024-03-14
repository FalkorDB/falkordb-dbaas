import fp from 'fastify-plugin';
import { FalkorDBClient, IFalkorDBOpts } from './index';

export default fp(
  async function provision(fastify, opts: IFalkorDBOpts) {
    const falkordb = FalkorDBClient(opts);
    fastify.decorate('falkordbClient', falkordb);

    if (opts.injectContext) {
      fastify.addHook('onRequest', async (request) => {
        falkordb.setHeaders({
          'x-falkordb-userId': request.headers['x-falkordb-userId'],
          'x-falkordb-organizationId': request.headers['x-falkordb-userId'],
          'x-request-id': request.id,
        });
      });
    }
  },
  {
    name: 'falkordb-client',
    encapsulate: true,
  },
);
