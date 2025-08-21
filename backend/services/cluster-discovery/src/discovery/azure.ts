// import { ContainerServiceClient } from '@azure/arm-containerservice';
// import { ResourceManagementClient } from '@azure/arm-resources';
// import { DefaultAzureCredential } from '@azure/identity';
// import { ClusterSchema, Cluster } from '../types';
// import logger from '../logger';
// import { exec } from 'child_process';
// import { promisify } from 'util';

// const execAsync = promisify(exec);

// const credential = new DefaultAzureCredential();
// const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID || 'YOUR_SUBSCRIPTION_ID';

// const resourceGroupsClient = new ResourceManagementClient(credential, subscriptionId);
// const clustersClient = new ContainerServiceClient(credential, subscriptionId);

// export async function discoverAzureClusters(): Promise<Cluster[]> {
//   logger.info('Discovering Azure clusters...');

//   const resourceGroups = resourceGroupsClient.resourceGroups.list();
//   const allClusters: Cluster[] = [];

//   for await (const rg of resourceGroups) {
//     logger.info(`Discovering clusters in resource group: ${rg.name}`);
//     const clustersInRg = await discoverClustersForResourceGroup(rg.name);
//     allClusters.push(...clustersInRg);
//   }

//   logger.info(`Found ${allClusters.length} total Azure clusters.`);
//   return allClusters;
// }

// async function discoverClustersForResourceGroup(resourceGroupName: string): Promise<Cluster[]> {
//   const clusters: Cluster[] = [];

//   // Use listByResourceGroup to get clusters for a specific resource group
//   for await (const cluster of clustersClient.managedClusters.listByResourceGroup(resourceGroupName)) {
//     // Retrieve credentials for each cluster to get the CA data
//     clusters.push({
//       name: cluster.name,
//       endpoint: cluster.fqdn,
//       labels: cluster.tags,
//       cloud: 'azure',
//       region: cluster.location,
//       resourceGroup: resourceGroupName,
//     });

//     await addClusterToKubectlContext(cluster, resourceGroupName);
//   }


//   // Validate and return the clusters
//   return clusters.map((c) => ClusterSchema.validateSync(c));
// }

// async function addClusterToKubectlContext(cluster: Cluster, resourceGroupName: string): Promise<void> {
//   const command = `az aks get-credentials --resource-group ${resourceGroupName} --name ${cluster.name}`;

//   try {
//     const { stdout, stderr } = await execAsync(command);
//     if (stderr) {
//       logger.warn({ stderr, clusterName: cluster.name }, 'Warning during kubectl context update');
//     }
//     logger.debug({ stdout, clusterName: cluster.name }, 'kubectl context update output');
//   } catch (error) {
//     logger.error({ error, clusterName: cluster.name, resourceGroupName }, 'Failed to execute az aks get-credentials');
//     throw error;
//   }
// }
