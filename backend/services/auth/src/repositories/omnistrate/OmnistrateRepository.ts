import assert from 'assert';
import { IOmnistrateRepository } from './IOmnistrateRepository';
import axios, { AxiosInstance } from 'axios';

export class OmnistrateRepository implements IOmnistrateRepository {
  private static _client: AxiosInstance;
  private static _baseUrl: string = process.env.OMNISTRATE_BASE_URL || 'https://api.omnistrate.cloud';

  constructor(
    private _omnistrateUser: string,
    private _omnistratePassword: string,
  ) {
    assert(_omnistrateUser, 'OmnistrateRepository: Omnistrate user is required');
    assert(_omnistratePassword, 'OmnistrateRepository: Omnistrate password is required');

    if (!OmnistrateRepository._client) {
      OmnistrateRepository._client = axios.create({
        headers: {
          'Content-Type': 'application/json',
        },
        baseURL: OmnistrateRepository._baseUrl,
      });
    }
  }

  async getToken(): Promise<string> {
    const response = await OmnistrateRepository._client.post(`/2022-09-01-00/signin`, {
      email: this._omnistrateUser,
      password: this._omnistratePassword,
    });
    return response.data.jwtToken;
  }
}
