import { FalkorDBInfoObjectSchemaType } from '../../schemas/FalkorDBInfoObject';

export class K8sRepository {
  async getFalkorDBInfo(clusterId: string, region: string, instanceId: string): Promise<FalkorDBInfoObjectSchemaType> {
    throw new Error('Not implemented');
  }
}
