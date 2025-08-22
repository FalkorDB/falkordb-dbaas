import { discoverAWSClusters } from '../src/discovery/aws';
import { discoverGCPClusters } from '../src/discovery/gcp';
describe('Cluster Discovery', () => {
    describe('GCP Cluster Discovery', () => {
        it('should return an array of valid clusters', async () => {
            const { clusters } = await discoverGCPClusters();
            expect(clusters).toBeInstanceOf(Array);
            console.log(clusters)
            clusters.forEach(cluster => {
                expect(cluster).toHaveProperty('endpoint');
                expect(cluster).toHaveProperty('caData');
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
                expect(cluster).toHaveProperty('caData');
                expect(cluster).toHaveProperty('name');
                expect(cluster).toHaveProperty('region');
            });
        });
    });
});
