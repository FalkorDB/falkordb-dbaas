import { GcpServiceAccountValidator } from '../../src/services/GcpServiceAccountValidator';
import pino from 'pino';
import { OAuth2Client } from 'google-auth-library';

// Mock the google-auth-library
jest.mock('google-auth-library');

describe('GcpServiceAccountValidator', () => {
  let validator: GcpServiceAccountValidator;
  let logger: pino.Logger;
  let mockOAuth2Client: jest.Mocked<OAuth2Client>;

  beforeEach(() => {
    logger = pino({ level: 'silent' });

    // Create mock OAuth2Client
    mockOAuth2Client = {
      verifyIdToken: jest.fn(),
    } as unknown as jest.Mocked<OAuth2Client>;

    // Mock the OAuth2Client constructor
    (OAuth2Client as jest.MockedClass<typeof OAuth2Client>).mockImplementation(() => mockOAuth2Client);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when GCP admin service account email is configured', () => {
    const adminEmail = 'admin@project.iam.gserviceaccount.com';

    beforeEach(() => {
      validator = new GcpServiceAccountValidator({
        logger,
        adminServiceAccountEmail: adminEmail,
      });
    });

    it('should return true for valid service account token', async () => {
      const mockTicket = {
        getPayload: jest.fn().mockReturnValue({
          email: adminEmail,
          email_verified: true,
        }),
      };

      mockOAuth2Client.verifyIdToken.mockResolvedValue(mockTicket as any);

      const result = await validator.validateServiceAccountToken('valid-token');

      expect(result).toBe(true);
      expect(mockOAuth2Client.verifyIdToken).toHaveBeenCalledWith({
        idToken: 'valid-token',
        audience: undefined,
      });
    });

    it('should return false for token with wrong email', async () => {
      const mockTicket = {
        getPayload: jest.fn().mockReturnValue({
          email: 'wrong@project.iam.gserviceaccount.com',
          email_verified: true,
        }),
      };

      mockOAuth2Client.verifyIdToken.mockResolvedValue(mockTicket as any);

      const result = await validator.validateServiceAccountToken('token-with-wrong-email');

      expect(result).toBe(false);
    });

    it('should return false for token with unverified email', async () => {
      const mockTicket = {
        getPayload: jest.fn().mockReturnValue({
          email: adminEmail,
          email_verified: false,
        }),
      };

      mockOAuth2Client.verifyIdToken.mockResolvedValue(mockTicket as any);

      const result = await validator.validateServiceAccountToken('token-with-unverified-email');

      expect(result).toBe(false);
    });

    it('should return false when token has no payload', async () => {
      const mockTicket = {
        getPayload: jest.fn().mockReturnValue(null),
      };

      mockOAuth2Client.verifyIdToken.mockResolvedValue(mockTicket as any);

      const result = await validator.validateServiceAccountToken('token-without-payload');

      expect(result).toBe(false);
    });

    it('should return false when token verification fails', async () => {
      mockOAuth2Client.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      const result = await validator.validateServiceAccountToken('invalid-token');

      expect(result).toBe(false);
    });

    it('should return admin service account email', () => {
      expect(validator.getAdminServiceAccountEmail()).toBe(adminEmail);
    });
  });

  describe('when GCP admin service account email is not configured', () => {
    beforeEach(() => {
      validator = new GcpServiceAccountValidator({
        logger,
        adminServiceAccountEmail: undefined,
      });
    });

    it('should return false for any token', async () => {
      const result = await validator.validateServiceAccountToken('any-token');

      expect(result).toBe(false);
      expect(mockOAuth2Client.verifyIdToken).not.toHaveBeenCalled();
    });

    it('should return undefined for admin service account email', () => {
      expect(validator.getAdminServiceAccountEmail()).toBeUndefined();
    });
  });
});
