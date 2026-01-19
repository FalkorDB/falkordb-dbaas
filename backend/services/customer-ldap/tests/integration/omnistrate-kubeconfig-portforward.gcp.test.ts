import pino from 'pino';
import { OmnistrateClient } from '../../src/repositories/omnistrate/OmnistrateClient';
import { K8sCredentialsOmnistrateRepository } from '../../src/repositories/k8s-credentials/K8sCredentialsOmnistrateRepository';
import { K8sRepository } from '../../src/repositories/k8s/K8sRepository';
import { LdapRepository } from '../../src/repositories/ldap/LdapRepository';
import {
  ALLOWED_ACL,
  LDAP_NAMESPACE,
  LDAP_POD_PREFIX,
  LDAP_SECRET_NAME,
  LDAP_SECRET_TOKEN_KEY,
  LDAP_SERVICE_PORT,
} from '../../src/constants';

const enabled = process.env.RUN_K8S_INTEGRATION_TESTS === '1';
const describeIntegration = enabled ? describe : describe.skip;

describeIntegration('Integration: Omnistrate kubeconfig + port-forward (GCP)', () => {
  jest.setTimeout(120_000);

  it('retrieves kubeconfig and establishes port-forward to LDAP (c-hcjx5tis6bc, us-central1)', async () => {
    const omnistrateEmail = process.env.OMNISTRATE_EMAIL;
    const omnistratePassword = process.env.OMNISTRATE_PASSWORD;

    if (!omnistrateEmail || !omnistratePassword) {
      throw new Error('Missing OMNISTRATE_EMAIL/OMNISTRATE_PASSWORD env vars for integration test');
    }

    const logger = pino({ level: 'info' });

    const omnistrateClient = new OmnistrateClient(omnistrateEmail, omnistratePassword, { logger });
    const k8sCredentialsRepo = new K8sCredentialsOmnistrateRepository(omnistrateClient, { logger });
    const k8sRepo = new K8sRepository({ logger });
    const ldapRepo = new LdapRepository({ logger });

    const kubeConfig = await k8sCredentialsRepo.getKubeConfig('gcp', 'c-hcjx5tis6bc', 'us-central1');
    logger.info(
      {
        currentCluster: kubeConfig.getCurrentCluster()?.name,
        currentUser: kubeConfig.getCurrentUser()?.name,
        server: kubeConfig.getCurrentCluster()?.server,
      },
      'Retrieved kubeconfig from Omnistrate',
    );
    const bearerToken = await k8sRepo.getSecretValueUtf8(
      kubeConfig,
      LDAP_NAMESPACE,
      LDAP_SECRET_NAME,
      LDAP_SECRET_TOKEN_KEY,
    );
    const podName = await k8sRepo.getPodNameByPrefix(kubeConfig, LDAP_NAMESPACE, LDAP_POD_PREFIX).catch((err) => {
      logger.error({ err }, 'Failed to get LDAP pod name');
      throw err;
    });

    const portForward = await k8sRepo.createPortForward(kubeConfig, LDAP_NAMESPACE, podName, LDAP_SERVICE_PORT);

    try {
      const caCertificate = await ldapRepo.getCaCertificate(portForward.localPort, bearerToken);
      logger.info({ caCertificate }, 'Retrieved CA certificate from LDAP service');
      const health = await ldapRepo.checkHealth(portForward.localPort);
      logger.info({ health }, 'LDAP server health check result');
      expect(health.status).toBe('healthy');

      await ldapRepo.createUser(
        portForward.localPort,
        process.env.TEST_LDAP_ORG ?? 'test-org',
        bearerToken,
        caCertificate,
        {
          username: 'test-user-' + Date.now(),
          password: 'TestPassword123!',
          acl: ALLOWED_ACL,
        },
      );
    } finally {
      portForward.close();
    }
  });
});
