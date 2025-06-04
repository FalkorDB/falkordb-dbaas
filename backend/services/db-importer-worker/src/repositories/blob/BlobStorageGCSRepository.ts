import assert from "assert";
import { IBlobStorageRepository } from "./IBlobStorageRepository";
import { GetSignedUrlConfig, Storage } from '@google-cloud/storage'
import { Logger } from "pino";

export class BlobStorageGCSRepository implements IBlobStorageRepository {

  _client: Storage = null;

  constructor(private _options: { logger: Logger }) {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    assert(projectId, 'Env var GOOGLE_CLOUD_PROJECT is required');
    this._client = new Storage({
      projectId,
    });
  }

  async getWriteUrl(
    bucket: string,
    file: string,
    contentType: string,
    expiresIn = 30 * 60 * 1000 // 30 minutes
  ): Promise<string> {
    const options: GetSignedUrlConfig = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + expiresIn,
      contentType,
    };

    const signedUrls = await this._client.bucket(bucket)
      .file(file)
      .getSignedUrl(options);
    return signedUrls[0];
  }

  async getReadUrl(
    bucket: string,
    file: string,
    expiresIn = 24 * 60 * 60 * 1000 // 24 hours
  ): Promise<string> {
    const options: GetSignedUrlConfig = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + expiresIn, // 30 minutes
    };

    const signedUrls = await this._client.bucket(bucket)
      .file(file)
      .getSignedUrl(options);
    return signedUrls[0];
  }

  async readFileContent(
    bucket: string,
    file: string
  ): Promise<string> {
    const fileHandle = this._client.bucket(bucket).file(file);
    const [content] = await fileHandle.download();
    return content.toString('utf-8');
  }

}