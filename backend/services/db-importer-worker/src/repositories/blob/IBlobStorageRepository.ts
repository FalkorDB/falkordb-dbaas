
export abstract class IBlobStorageRepository {

  abstract getWriteUrl(
    bucket: string,
    file: string,
    contentType: string,
    expiresIn?: number
  ): Promise<string>;

  abstract getReadUrl(
    bucket: string,
    file: string,
    expiresIn?: number
  ): Promise<string>;

}