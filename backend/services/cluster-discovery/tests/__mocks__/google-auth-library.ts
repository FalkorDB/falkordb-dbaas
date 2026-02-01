/**
 * Mock for google-auth-library
 */
export class OAuth2Client {
  setCredentials = jest.fn();
  getAccessToken = jest.fn();
}

export class Impersonated {
  constructor(config: any) {}
  getAccessToken = jest.fn();
}

export class GoogleAuth {
  getClient = jest.fn();
}
