import { ContainerServiceClient } from '@azure/arm-containerservice';

/**
 * Finds the resource group containing the named AKS cluster by listing all managed
 * clusters in the subscription.
 *
 * Azure resource IDs follow the format:
 *   /subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.ContainerService/managedClusters/{name}
 * so index 4 (0-based) of the `/`-split array is the resource group name.
 */
export async function findAzureBYOAResourceGroup(
  client: ContainerServiceClient,
  subscriptionId: string,
  clusterName: string,
): Promise<string> {
  for await (const aksCluster of client.managedClusters.list()) {
    if (aksCluster.name === clusterName) {
      const parts = aksCluster.id?.split('/');
      // parts[4] is the resource group in the Azure resource ID format
      if (parts && parts.length > 4) {
        return parts[4];
      }
    }
  }
  throw new Error(
    `Could not find resource group for cluster '${clusterName}' in subscription '${subscriptionId}'`,
  );
}
