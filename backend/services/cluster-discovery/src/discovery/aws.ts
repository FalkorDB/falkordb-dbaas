// import { EKSClient, ListClustersCommand, DescribeClusterCommand } from '@aws-sdk/client-eks';
// import { EC2Client, DescribeRegionsCommand } from '@aws-sdk/client-ec2';
// import { STSClient, AssumeRoleWithWebIdentityCommand } from '@aws-sdk/client-sts';
// import { ClusterSchema, Cluster } from '../types';
// import logger from '../logger';
// import { exec } from 'child_process';
// import { promisify } from 'util';
// import axios from 'axios';

// const execAsync = promisify(exec);

// export async function discoverAWSClusters(): Promise<Cluster[]> {
//   logger.info('Discovering AWS clusters from all regions...');

//   // Get all AWS regions
//   const regions = await getAllAWSRegions();
//   logger.info({ regionCount: regions.length }, `Checking ${regions.length} AWS regions for clusters`);

//   const allClusters: Cluster[] = [];

//   // Discover clusters in each region
//   for (const region of regions) {
//     try {
//       logger.debug({ region }, `Discovering clusters in region: ${region}`);
//       const regionClusters = await discoverClustersInRegion(region);
//       allClusters.push(...regionClusters);
//     } catch (error) {
//       logger.error({ error, region }, `Failed to discover clusters in region: ${region}`);
//     }
//   }

//   logger.info({ clusterCount: allClusters.length }, `Found ${allClusters.length} total AWS clusters across all regions`);

//   return allClusters;
// }

// async function getAllAWSRegions(): Promise<string[]> {
//   try {
//     // Use credentials to get regions - we'll use us-east-1 as default for this call
//     const credentials = await getEKSCredentials('temp', 'us-east-1');
//     const ec2Client = new EC2Client({
//       credentials: {
//         accessKeyId: credentials.accessKeyId,
//         secretAccessKey: credentials.secretAccessKey,
//         sessionToken: credentials.sessionToken,
//       },
//       region: 'us-east-1',
//     });

//     const { Regions } = await ec2Client.send(new DescribeRegionsCommand({}));
//     return Regions?.map(region => region.RegionName).filter(Boolean) || [];
//   } catch (error) {
//     logger.error({ error }, 'Failed to get AWS regions, using default regions');
//     // Fallback to common regions if API call fails
//     return [
//       'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
//       'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1',
//       'ap-northeast-1', 'ap-northeast-2', 'ap-southeast-1', 'ap-southeast-2',
//       'ap-south-1', 'ca-central-1', 'sa-east-1'
//     ];
//   }
// }

// async function discoverClustersInRegion(region: string): Promise<Cluster[]> {
//   try {
//     const credentials = await getEKSCredentials('temp', region);
//     const eksClient = new EKSClient({
//       credentials: {
//         accessKeyId: credentials.accessKeyId,
//         secretAccessKey: credentials.secretAccessKey,
//         sessionToken: credentials.sessionToken,
//       },
//       region,
//     });

//     const clusters = await eksClient.send(new ListClustersCommand({}));

//     if (!clusters.clusters || clusters.clusters.length === 0) {
//       return [];
//     }

//     const clusterDetails = await Promise.all(
//       clusters.clusters.map(async (name) => {
//         try {
//           const clusterInfo = await eksClient.send(new DescribeClusterCommand({ name }));

//           if (!clusterInfo.cluster) {
//             return null;
//           }

//           const cluster = {
//             name: clusterInfo.cluster.name,
//             endpoint: clusterInfo.cluster.endpoint,
//             labels: clusterInfo.cluster.tags,
//             cloud: 'aws',
//             region: region,
//           } as Cluster;

//           await addClusterToKubectlContext(cluster);

//           return cluster;
//         } catch (error) {
//           logger.error({ error, clusterName: name, region }, 'Failed to get cluster details');
//           return null;
//         }
//       })
//     );

//     const validClusters = clusterDetails.filter((c): c is Cluster => c !== null);

//     if (validClusters.length > 0) {
//       logger.info({ region, clusterCount: validClusters.length }, `Found ${validClusters.length} clusters in region ${region}`);
//     }

//     // Validate clusters
//     return validClusters.map((cluster) => ClusterSchema.validateSync(cluster));
//   } catch (error) {
//     logger.error({ error, region }, `Failed to discover clusters in region: ${region}`);
//     return [];
//   }
// }

// async function getEKSCredentials(clusterId: string, region: string) {
//   // get ID token from default GCP SA
//   const targetAudience = process.env.AWS_TARGET_AUDIENCE;

//   const res = await axios.get(
//     'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=' +
//     targetAudience,
//     {
//       headers: {
//         'Metadata-Flavor': 'Google',
//       },
//     },
//   );

//   const idToken = res.data;

//   const sts = new STSClient({ region });

//   const { Credentials } = await sts.send(
//     new AssumeRoleWithWebIdentityCommand({
//       RoleArn: process.env.AWS_ROLE_ARN,
//       RoleSessionName: 'cluster-discovery-service',
//       WebIdentityToken: idToken,
//     }),
//   );

//   if (!Credentials?.AccessKeyId || !Credentials?.SecretAccessKey) {
//     throw new Error('Failed to get valid AWS credentials from STS');
//   }

//   // For cluster-specific operations, get EKS token
//   if (clusterId !== 'temp') {
//     const eks = new EKSClient({
//       credentials: {
//         accessKeyId: Credentials.AccessKeyId,
//         secretAccessKey: Credentials.SecretAccessKey,
//         sessionToken: Credentials.SessionToken,
//       },
//       region,
//     });

//     const { cluster } = await eks.send(new DescribeClusterCommand({ name: clusterId }));

//     // eslint-disable-next-line @typescript-eslint/no-var-requires
//     const EKSToken = require('aws-eks-token');
//     EKSToken.config = {
//       accessKeyId: Credentials.AccessKeyId,
//       secretAccessKey: Credentials.SecretAccessKey,
//       sessionToken: Credentials.SessionToken,
//       region,
//     };

//     const token = await EKSToken.renew(clusterId);

//     return {
//       accessKeyId: Credentials.AccessKeyId,
//       secretAccessKey: Credentials.SecretAccessKey,
//       sessionToken: Credentials.SessionToken,
//       endpoint: cluster?.endpoint,
//       certificateAuthority: cluster?.certificateAuthority?.data,
//       accessToken: token,
//     };
//   }

//   // For non-cluster specific operations (like listing regions)
//   return {
//     accessKeyId: Credentials.AccessKeyId,
//     secretAccessKey: Credentials.SecretAccessKey,
//     sessionToken: Credentials.SessionToken,
//   };
// }

// async function addClusterToKubectlContext(cluster: Cluster): Promise<void> {
//   if (!cluster.name || !cluster.region) {
//     throw new Error('Cluster name and region are required');
//   }

//   const command = `aws eks update-kubeconfig --region ${cluster.region} --name ${cluster.name}`;

//   try {
//     const { stdout, stderr } = await execAsync(command);
//     if (stderr) {
//       logger.warn({ stderr, clusterName: cluster.name }, 'Warning during kubectl context update');
//     }
//     logger.debug({ stdout, clusterName: cluster.name }, 'kubectl context update output');
//   } catch (error) {
//     logger.error({ error, clusterName: cluster.name, region: cluster.region }, 'Failed to execute aws eks update-kubeconfig');
//     throw error;
//   }
// }