import { Cluster } from '../types';

/**
 * Determines if a cluster is managed (GCP/AWS) or BYOA
 */
export function isManagedCluster(cluster: Cluster): boolean {
  return cluster.hostMode !== 'byoa';
}

/**
 * Determines if a cluster is BYOA
 */
export function isBYOACluster(cluster: Cluster): boolean {
  return cluster.hostMode === 'byoa';
}

/**
 * Determines if a cluster is GCP
 */
export function isGCPCluster(cluster: Cluster): boolean {
  return cluster.cloud === 'gcp';
}

/**
 * Determines if a cluster is AWS
 */
export function isAWSCluster(cluster: Cluster): boolean {
  return cluster.cloud === 'aws';
}

/**
 * Determines if a cluster is Azure
 */
export function isAzureCluster(cluster: Cluster): boolean {
  return cluster.cloud === 'azure';
}

/**
 * Formats cluster name for logging
 */
export function formatClusterName(cluster: Cluster): string {
  return `${cluster.name} (${cluster.cloud}/${cluster.hostMode || 'managed'})`;
}

/**
 * Creates a safe cluster identifier
 */
export function createClusterIdentifier(cluster: Cluster): string {
  return `${cluster.cloud}-${cluster.name}`;
}
