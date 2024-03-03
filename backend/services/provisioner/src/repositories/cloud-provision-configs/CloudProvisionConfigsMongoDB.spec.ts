import { MongoClient } from 'mongodb';
import { CloudProvisionConfigsMongoDB } from './CloudProvisionConfigsMongoDB';
import { FastifyBaseLogger } from 'fastify';
import { CloudProvisionConfigSchema, CreateCloudProvisionConfigParamsSchemaType } from '../../schemas/cloudProvision';
import { Value } from '@sinclair/typebox/value';

let client: MongoClient;
const logger = {
  error: console.error,
} as FastifyBaseLogger;
let repository: CloudProvisionConfigsMongoDB;

beforeAll(async () => {
  client = new MongoClient(process.env.MONGODB_URI ?? '');
  await client.connect();
  console.log('Connected to MongoDB:', client.db().databaseName);
  repository = new CloudProvisionConfigsMongoDB({ logger }, client);
});

afterAll(async () => {
  await client.db().dropDatabase();
  await client.close();
});

describe('CloudProvisionConfigsMongoDB', () => {
  describe('create', () => {
    it('should create a new cloud provision config', async () => {
      const params: CreateCloudProvisionConfigParamsSchemaType = {
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
      };
      const result = await repository.create(params);
      expect(Value.Check(CloudProvisionConfigSchema, result)).toBe(true);

      // Add other assertions if needed
    });
  });

  describe('query', () => {
    it('should return an array of cloud provision configs', async () => {
      const params = {
        cloudProvider: 'gcp',
        deploymentConfigVersion: 1,
      };
      const result = await repository.query(params);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });
});
