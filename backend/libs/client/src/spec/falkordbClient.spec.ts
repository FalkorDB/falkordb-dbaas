import { FalkorDBClient } from '../index';

// Test the FalkorDBClient
describe('FalkorDBClient', () => {
  it('should create a new instance of FalkorDBClient', () => {
    const falkordb = FalkorDBClient({ url: 'http://localhost:3000' });
    expect(falkordb).toBeDefined();
  });

  it('should list cloud provision configs', async () => {
    const falkordb = FalkorDBClient({ url: 'http://localhost:3000' });
    const res = await falkordb.v1.provisioner.cloudProvisionConfig.list({});
    expect(res).toBeDefined();
  });
});
