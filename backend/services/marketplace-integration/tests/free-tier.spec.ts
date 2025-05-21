// Run a e2e test to check the free tier functionality
import { start } from '../src/index';
import axios, { AxiosError } from 'axios';
import { } from 'jest';

const url = `http://localhost:${process.env.PORT ?? 3000}`;
axios.defaults.baseURL = url;
describe('e2e test free tier', () => {

  beforeAll(async () => {
    start();
    while (await axios.get(`/health`).catch((err: AxiosError) => err.response?.status === 404) === false) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }, 60000);

  const userEmail = `dudi+test-` + Date.now() + '@falkordb.com';
  const marketplaceAccountId = 'test-account-id';
  const entitlementId = 'test-entitlement-id';

  it('should create the service account', async () => {

    // Mock the request to create a free tier instance
    const request = {
      message: {
        data: Buffer.from(JSON.stringify({
          marketplaceAccountId,
          userEmail,
          name: 'test',
          companyName: 'test',
        })).toString('base64')
      },
    };

    const createAccountResponse = await axios.post('/topics/create-account', request);

    expect(createAccountResponse.status).toBe(200);

  }, 60000);


  it('should create the free tier entitlement', async () => {

    const request = {
      message: {
        data: Buffer.from(JSON.stringify({
          marketplaceAccountId,
          entitlementId,
          productTierId: 'free',
          userEmail,
        })).toString('base64')
      }
    };

    const createEntitlementResponse = await axios.post('/topics/create-entitlement', request);

    expect(createEntitlementResponse.status).toBe(200);


  }, 60000);

});
