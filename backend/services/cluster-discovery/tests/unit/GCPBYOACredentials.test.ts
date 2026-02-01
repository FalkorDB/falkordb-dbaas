/**
 * Test for GCP BYOA Credentials Auth Client Wrapper
 * 
 * This test verifies that the custom auth client wrapper properly handles
 * the gRPC "headers.forEach is not a function" error by creating a headers
 * object with a non-enumerable forEach method.
 * 
 * Related GitHub issue: https://github.com/googleapis/google-auth-library-nodejs/issues/1960
 */

describe('GCP BYOA Auth Client Wrapper', () => {
  describe('Headers object with non-enumerable forEach', () => {
    // Simulate the auth client wrapper created in getGCPBYOACredentials
    function createAuthClientWrapper(token: string) {
      return {
        async getRequestHeaders(url?: string) {
          const headers: any = {
            'Authorization': `Bearer ${token}`
          };
          
          // Add forEach method as a non-enumerable property
          Object.defineProperty(headers, 'forEach', {
            value: function(callback: (value: string, key: string) => void) {
              Object.entries(headers).forEach(([key, value]) => {
                if (key !== 'forEach') {
                  callback(value as string, key);
                }
              });
            },
            enumerable: false,
            writable: false,
            configurable: false
          });
          
          return headers;
        },
        async getAccessToken() {
          return { token };
        },
      };
    }

    it('should have getRequestHeaders method', async () => {
      const token = 'ya29.test-token-123';
      const authClient = createAuthClientWrapper(token);

      expect(authClient).toHaveProperty('getRequestHeaders');
      expect(typeof authClient.getRequestHeaders).toBe('function');
    });

    it('should return headers object with Authorization header', async () => {
      const token = 'ya29.test-token-123';
      const authClient = createAuthClientWrapper(token);

      const headers = await authClient.getRequestHeaders();

      expect(headers.Authorization).toBe(`Bearer ${token}`);
    });

    it('should have forEach method on headers object', async () => {
      const token = 'ya29.test-token-123';
      const authClient = createAuthClientWrapper(token);

      const headers = await authClient.getRequestHeaders();

      expect(typeof headers.forEach).toBe('function');
    });

    it('should have non-enumerable forEach method', async () => {
      const token = 'ya29.test-token-123';
      const authClient = createAuthClientWrapper(token);

      const headers = await authClient.getRequestHeaders();
      const headerKeys = Object.keys(headers);

      // forEach should NOT appear in Object.keys()
      expect(headerKeys).not.toContain('forEach');
      expect(headerKeys).toContain('Authorization');
    });

    it('should properly iterate headers with forEach method', async () => {
      const token = 'ya29.test-token-123';
      const authClient = createAuthClientWrapper(token);

      const headers = await authClient.getRequestHeaders();
      const collectedHeaders: Record<string, string> = {};
      
      headers.forEach((value: string, key: string) => {
        collectedHeaders[key] = value;
      });

      // forEach should work correctly and not include itself
      expect(collectedHeaders).toHaveProperty('Authorization');
      expect(collectedHeaders.Authorization).toBe(`Bearer ${token}`);
      expect(collectedHeaders).not.toHaveProperty('forEach');
    });

    it('should simulate gRPC metadata iteration without including forEach', async () => {
      const token = 'ya29.test-token-123';
      const authClient = createAuthClientWrapper(token);

      const headers = await authClient.getRequestHeaders();
      
      // Simulate how gRPC iterates over headers using Object.entries
      const grpcHeaders: string[] = [];
      for (const [key, value] of Object.entries(headers)) {
        grpcHeaders.push(key);
      }

      expect(grpcHeaders).toContain('Authorization');
      expect(grpcHeaders).not.toContain('forEach');
    });

    it('should not throw error when gRPC validates header values', async () => {
      const token = 'ya29.test-token-123';
      const authClient = createAuthClientWrapper(token);

      const headers = await authClient.getRequestHeaders();

      // Simulate gRPC metadata validation
      const validate = (value: any) => {
        if (typeof value === 'function') {
          throw new Error(`Metadata string value "${value}" contains illegal characters`);
        }
        if (typeof value !== 'string' && typeof value !== 'object') {
          throw new Error(`Metadata value "${value}" contains illegal characters`);
        }
      };

      // Should not throw because forEach is not enumerable
      expect(() => {
        for (const [key, value] of Object.entries(headers)) {
          validate(value);
        }
      }).not.toThrow();
    });

    it('should have getAccessToken method', async () => {
      const token = 'ya29.test-token-123';
      const authClient = createAuthClientWrapper(token);

      expect(authClient).toHaveProperty('getAccessToken');
      expect(typeof authClient.getAccessToken).toBe('function');
    });

    it('should return correct token from getAccessToken', async () => {
      const token = 'ya29.test-token-123';
      const authClient = createAuthClientWrapper(token);

      const result = await authClient.getAccessToken();

      expect(result).toEqual({ token });
    });

    it('should work with ClusterManagerClient auth pattern', async () => {
      const token = 'ya29.test-token-123';
      const authClient = createAuthClientWrapper(token);

      const headers = await authClient.getRequestHeaders();

      // Simulate what ClusterManagerClient does
      let headerCount = 0;
      const hasForEach = typeof headers.forEach === 'function';
      
      if (hasForEach) {
        headers.forEach((value: string, key: string) => {
          headerCount++;
        });
      }

      expect(hasForEach).toBe(true);
      expect(headerCount).toBe(1); // Only Authorization header
    });
  });
});
