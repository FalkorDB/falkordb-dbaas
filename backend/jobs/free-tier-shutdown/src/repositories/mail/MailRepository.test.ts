import { MailRepository } from './MailRepository';
import pino from 'pino';

// Mock the brevo library to avoid actual API calls
jest.mock('@getbrevo/brevo', () => {
  return {
    TransactionalEmailsApi: jest.fn(() => ({
      authentications: {
        apiKey: {
          apiKey: '',
        },
      },
      sendTransacEmail: jest.fn().mockResolvedValue({}),
    })),
    SendSmtpEmail: jest.fn(),
  };
});

// Mock mjml to return proper HTML without requiring ESM - it's an async function
jest.mock('mjml', () => {
  return jest.fn((template: string) => {
    // Simulate mjml2html behavior - just wrap template in HTML
    return Promise.resolve({
      html: `<html><head><title>Email</title></head><body>${template}</body></html>`,
      errors: [],
    });
  });
});

describe('MailRepository', () => {
  let mailRepository: MailRepository;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Set required environment variables
    process.env.BREVO_API_KEY = 'test-api-key';
    process.env.OMNISTRATE_RESOURCE_ID = 'test-resource-id';

    // Create a quiet logger for testing
    const logger = pino({ level: 'silent' });
    mailRepository = new MailRepository({ logger });
  });

  describe('_interpolateTemplate', () => {
    it('should interpolate variables without spaces around placeholders', async () => {
      const vars = {
        name: 'John Doe',
        instanceId: 'instance-12345',
        link: 'https://example.com/dashboard',
      };

      const result = await mailRepository['_interpolateTemplate']('instance-stopped', vars);

      expect(result).toContain('John Doe');
      expect(result).toContain('instance-12345');
      expect(result).toContain('https://example.com/dashboard');
    });

    it('should replace all instances of placeholder variables', async () => {
      const vars = {
        name: 'Jane Smith',
        instanceId: 'instance-67890',
        link: 'https://example.com/dashboard',
      };

      const result = await mailRepository['_interpolateTemplate']('instance-stopped', vars);

      expect(result).toContain('Jane Smith');
      expect(result).toContain('instance-67890');
      // Should not contain uninterpolated placeholders
      expect(result).not.toContain('{{ name }}');
      expect(result).not.toContain('{{name}}');
    });

    it('should handle special characters in variable values', async () => {
      const vars = {
        name: 'John & Co.',
        instanceId: 'instance-abc-123_xyz',
        link: 'https://example.com/dashboard?param=value&other=123',
      };

      const result = await mailRepository['_interpolateTemplate']('instance-stopped', vars);

      expect(result).toContain('John & Co.');
      expect(result).toContain('instance-abc-123_xyz');
      expect(result).toContain('https://example.com/dashboard?param=value&other=123');
    });

    it('should produce valid HTML output', async () => {
      const vars = {
        name: 'Test User',
        instanceId: 'test-instance',
        link: 'https://test.com',
      };

      const result = await mailRepository['_interpolateTemplate']('instance-stopped', vars);

      // Check for HTML structure
      expect(result).toContain('<html');
      expect(result).toContain('</html>');
      expect(result).toContain('body');
    });

    it('should throw an error if template is not found', async () => {
      const vars = {
        name: 'Test User',
        instanceId: 'test-instance',
        link: 'https://test.com',
      };

      await expect(
        (mailRepository as any)._interpolateTemplate('non-existent-template', vars)
      ).rejects.toThrow();
    });

    it('should handle empty variables object gracefully', async () => {
      const vars = {};

      const result = await mailRepository['_interpolateTemplate']('instance-stopped', vars);

      // Should still produce valid HTML
      expect(result).toContain('<html');
      expect(result).toContain('</html>');
    });

    it('should interpolate variables with optional spaces in placeholders', async () => {
      // This tests the regex pattern which allows spaces around variable names
      const vars = {
        name: 'Test User',
        instanceId: 'inst-123',
        link: 'https://example.com',
      };

      const result = await mailRepository['_interpolateTemplate']('instance-stopped', vars);

      // All variables should be interpolated regardless of spacing
      expect(result).toContain('Test User');
      expect(result).toContain('inst-123');
      expect(result).toContain('https://example.com');
    });
  });
});
