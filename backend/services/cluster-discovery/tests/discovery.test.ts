import { discoverAWSClusters } from '../src/providers/aws/discovery';
import { discoverGCPClusters } from '../src/providers/gcp/discovery';
import { discoverBYOAClusters } from '../src/providers/omnistrate/client';

describe('Cluster Discovery', () => {
    describe('GCP Cluster Discovery', () => {
        it('should return an array of valid clusters', async () => {
            const { clusters } = await discoverGCPClusters();
            expect(clusters).toBeInstanceOf(Array);
            clusters.forEach(cluster => {
                expect(cluster).toHaveProperty('endpoint');
                expect(cluster).toHaveProperty('secretConfig');
                expect(cluster).toHaveProperty('name');
                expect(cluster).toHaveProperty('region');
            });
        });
    });

    describe('AWS Cluster Discovery', () => {
        it('should return an array of valid clusters', async () => {
            const { clusters } = await discoverAWSClusters();
            expect(clusters).toBeInstanceOf(Array);
            clusters.forEach(cluster => {
                expect(cluster).toHaveProperty('endpoint');
                expect(cluster).toHaveProperty('secretConfig');
                expect(cluster).toHaveProperty('name');
                expect(cluster).toHaveProperty('region');
            });
        });
    });

    describe('BYOA Cluster Discovery', () => {
        it('should return an array of valid clusters', async () => {
            const { clusters } = await discoverBYOAClusters();
            expect(clusters).toBeInstanceOf(Array);
            clusters.forEach(cluster => {
                expect(cluster).toHaveProperty('endpoint');
                expect(cluster).toHaveProperty('secretConfig');
                expect(cluster).toHaveProperty('name');
                expect(cluster).toHaveProperty('region');
            });
        }, 10000);
    });
});
