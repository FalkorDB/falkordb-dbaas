import { createOrUpdateTargetClusterVMUserSecretJob } from '../../src/secrets/vmuser';
import { mockGCPCluster } from '../__mocks__/fixtures';
import { getK8sConfig } from '../../src/utils/k8s';
import { VMUSER_SECRET_NAMESPACE, VMUSER_TARGET_SECRET_NAME } from '../../src/constants';

const targetApi = {
  readNamespacedSecret: jest.fn(),
  createNamespacedSecret: jest.fn(),
  replaceNamespacedSecret: jest.fn(),
  deleteNamespacedSecret: jest.fn(),
};

jest.mock('@kubernetes/client-node', () => {
  const sourceApi = {
    readNamespacedSecret: jest.fn(),
  };
  const makeApiClientMock = jest.fn().mockReturnValue(sourceApi);

  return {
    __esModule: true,
    KubeConfig: jest.fn().mockImplementation(() => ({
      loadFromDefault: jest.fn(),
      makeApiClient: makeApiClientMock,
    })),
    CoreV1Api: jest.fn(),
    __mocked: {
      sourceApi,
      makeApiClientMock,
    },
  };
});

jest.mock('../../src/utils/k8s');

const mockedGetK8sConfig = jest.mocked(getK8sConfig);

const { __mocked } = jest.requireMock('@kubernetes/client-node') as {
  __mocked: {
    sourceApi: { readNamespacedSecret: jest.Mock };
    makeApiClientMock: jest.Mock;
  };
  KubeConfig: jest.Mock;
};

const sourceApi = __mocked.sourceApi;
const makeApiClientMock = __mocked.makeApiClientMock;
const kubeConfigMock = (jest.requireMock('@kubernetes/client-node') as { KubeConfig: jest.Mock }).KubeConfig;

describe('vmuser secret management', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    kubeConfigMock.mockImplementation(() => ({
      loadFromDefault: jest.fn(),
      makeApiClient: makeApiClientMock,
    }));

    makeApiClientMock.mockReturnValue(sourceApi);

    mockedGetK8sConfig.mockResolvedValue({
      makeApiClient: jest.fn().mockReturnValue(targetApi),
    } as any);
  });

  it('prunes the target secret when the source secret is missing', async () => {
    sourceApi.readNamespacedSecret.mockRejectedValue({ statusCode: 404 });
    targetApi.deleteNamespacedSecret.mockResolvedValue({} as any);

    await createOrUpdateTargetClusterVMUserSecretJob(mockGCPCluster);

    expect(targetApi.deleteNamespacedSecret).toHaveBeenCalledWith(
      VMUSER_TARGET_SECRET_NAME,
      VMUSER_SECRET_NAMESPACE,
    );
    expect(targetApi.createNamespacedSecret).not.toHaveBeenCalled();
    expect(targetApi.replaceNamespacedSecret).not.toHaveBeenCalled();
  });

  it('leaves an existing target secret unchanged even if the source secret data differs', async () => {
    sourceApi.readNamespacedSecret.mockResolvedValue({
      body: { data: { password: 'cGFzc3dvcmQ=' } },
    });
    targetApi.readNamespacedSecret.mockResolvedValue({
      body: { data: { password: 'b3RoZXI=' } },
    });

    await createOrUpdateTargetClusterVMUserSecretJob(mockGCPCluster);

    expect(targetApi.createNamespacedSecret).not.toHaveBeenCalled();
    expect(targetApi.replaceNamespacedSecret).not.toHaveBeenCalled();
    expect(targetApi.deleteNamespacedSecret).not.toHaveBeenCalled();
  });
});
