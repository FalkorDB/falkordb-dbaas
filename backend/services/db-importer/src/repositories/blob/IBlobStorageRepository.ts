
export abstract class IBlobStorageRepository {

  abstract getWriteUrl(
    bucket: string,
    file: string,
    contentType: string,
    expiresIn?: number
  ): Promise<string>;

}