import { isManagedCluster, isGCPCluster, isAWSCluster, formatClusterName } from '../../src/utils/cluster.utils';
import { mockGCPCluster, mockAWSCluster, mockBYOACluster, mockAzureCluster } from '../__mocks__/fixtures';

describe('Cluster Utils', () => {
  describe('isManagedCluster', () => {
    it('should return true for managed clusters', () => {
      expect(isManagedCluster(mockGCPCluster)).toBe(true);
      expect(isManagedCluster(mockAWSCluster)).toBe(true);
      expect(isManagedCluster(mockAzureCluster)).toBe(true);
    });

    it('should return false for BYOA clusters', () => {
      expect(isManagedCluster(mockBYOACluster)).toBe(false);
    });
  });

  describe('isGCPCluster', () => {
    it('should return true for GCP clusters', () => {
      expect(isGCPCluster(mockGCPCluster)).toBe(true);
    });

    it('should return false for non-GCP clusters', () => {
      expect(isGCPCluster(mockAWSCluster)).toBe(false);
      expect(isGCPCluster(mockAzureCluster)).toBe(false);
    });
  });

  describe('isAWSCluster', () => {
    it('should return true for AWS clusters', () => {
      expect(isAWSCluster(mockAWSCluster)).toBe(true);
    });

    it('should return false for non-AWS clusters', () => {
      expect(isAWSCluster(mockGCPCluster)).toBe(false);
      expect(isAWSCluster(mockAzureCluster)).toBe(false);
    });
  });

  describe('formatClusterName', () => {
    it('should format cluster name correctly', () => {
      const result = formatClusterName(mockGCPCluster);
      expect(result).toContain(mockGCPCluster.name);
      expect(result).toContain('gcp');
      expect(result).toContain('managed');
    });

    it('should format BYOA cluster correctly', () => {
      const result = formatClusterName(mockBYOACluster);
      expect(result).toContain(mockBYOACluster.name);
      expect(result).toContain('gcp');
      expect(result).toContain('byoa');
    });

    it('should format AWS cluster correctly', () => {
      const result = formatClusterName(mockAWSCluster);
      expect(result).toContain(mockAWSCluster.name);
      expect(result).toContain('aws');
    });
  });
});
