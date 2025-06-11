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

  const random = Math.random().toString(36).substring(2, 15);
  const userEmail = `dudi+test-` + random + '@falkordb.com';
  const marketplaceAccountId = 'test-account-id-pro-' + random;
  const entitlementId = 'test-entitlement-id-pro';

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


  it('should create the pro tier entitlement', async () => {

    const request = {
      message: {
        data: Buffer.from(JSON.stringify({
          marketplaceAccountId,
          entitlementId,
          productTierId: 'pro',
          userEmail,
        })).toString('base64')
      }
    };

    const createEntitlementResponse = await axios.post('/topics/create-entitlement', request);

    expect(createEntitlementResponse.status).toBe(200);


  }, 60000);

});
