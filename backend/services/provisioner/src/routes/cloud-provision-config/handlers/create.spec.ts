import Fastify, { FastifyInstance } from 'fastify';
import App from '../../../app';
import { Value } from '@sinclair/typebox/value';
import { CloudProvisionConfigCreateResponseSuccessSchema } from '../schemas/create';

let fastify: FastifyInstance;
beforeAll(async () => {
  fastify = Fastify({
    logger: true,
  });

  await fastify.register(App);

  const PORT = fastify.config?.PORT || parseInt(process.env.PORT, 10) || 3000;
  await fastify.listen({
    port: PORT,
  });
});

afterAll(async () => {
  await fastify?.close();
});

describe('create/delete', () => {
  it('should create and delete a cloud provision config', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/cloud-provision-config',
      body: {
        deploymentConfigVersion: 1,
        cloudProvider: 'gcp',
        cloudProviderConfig: {
          deploymentProjectId: 'project-id',
          deploymentProvisionServiceAccount: 'service-account-email',
          runnerProjectId: 'runner-project-id',
          runnerServiceAccount: 'runner-service-account-email',
          stateBucket: 'state-bucket',
          timeout: 60,
        },
        source: {
          dir: 'dir',
          revision: 'revision',
          url: 'url',
        },
        tenantGroupConfig: {
          clusterDeletionProtection: true,
          dnsDomain: 'dns-domain',
          forceDestroyBackupBucket: true,
        },
      },
    });

    expect(response.statusCode).toBe(200);
    expect(Value.Check(CloudProvisionConfigCreateResponseSuccessSchema, response.json())).toBe(true);

    // Delete the created cloud provision config
    const createdConfigId = response.json().id;

    const deleteResponse = await fastify.inject({
      method: 'DELETE',
      url: `/cloud-provision-config/${createdConfigId}`,
    });

    expect(deleteResponse.statusCode).toBe(200);
  });
});
