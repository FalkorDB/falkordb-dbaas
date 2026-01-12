import { OmnistrateRepository } from '../../src/repositories/omnistrate/OmnistrateRepository';
import pino from 'pino';

describe('OmnistrateRepository', () => {
  let repository: OmnistrateRepository;
  let logger: pino.Logger;

  beforeEach(() => {
    logger = pino({ level: 'silent' });
    repository = new OmnistrateRepository(
      process.env.OMNISTRATE_EMAIL || 'test@example.com',
      process.env.OMNISTRATE_PASSWORD || 'password',
      process.env.OMNISTRATE_SERVICE_ID || 'service-id',
      process.env.OMNISTRATE_ENVIRONMENT_ID || 'environment-id',
      { logger },
    );
  });

  describe('validate', () => {
    it('should throw error when token is not provided', async () => {
      await expect(repository.validate('')).rejects.toThrow();
    });

    it('should return false for invalid token', async () => {
      const result = await repository.validate('invalid-token');
      expect(result).toBe(false);
    });

    // Add more tests with real tokens in integration tests
  });

  describe('getInstance', () => {
    it('should throw error when instanceId is not provided', async () => {
      await expect(repository.getInstance('')).rejects.toThrow();
    });

    // Add more tests with real instance IDs in integration tests
  });

  describe('getSubscriptionUsers', () => {
    it('should throw error when subscriptionId is not provided', async () => {
      await expect(repository.getSubscriptionUsers('')).rejects.toThrow();
    });

    // Add more tests with real subscription IDs in integration tests
  });

  describe('checkIfUserHasAccessToInstance', () => {
    it('should throw error when required parameters are missing', async () => {
      await expect(repository.checkIfUserHasAccessToInstance('', 'instance-id')).rejects.toThrow();
      await expect(repository.checkIfUserHasAccessToInstance('user-id', '')).rejects.toThrow();
    });

    // Add more tests with real data in integration tests
  });
});
