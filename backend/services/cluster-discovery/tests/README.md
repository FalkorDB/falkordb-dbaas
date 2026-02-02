# Cluster Discovery Service Tests

Comprehensive test suite for the cluster-discovery service with proper mocking of external providers.

## Test Statistics

✅ **All Tests Passing**: 41 tests in 6 test suites  
📦 **Test Files**: 6 unit tests, 3 mock helpers, 1 setup file  
⚡ **Test Speed**: ~8 seconds (with coverage)

## Test Structure

```
tests/
├── __mocks__/                     # Mock implementations
│   ├── @google-cloud/
│   │   └── container.ts          # Mock GCP Container API
│   ├── @aws-sdk/
│   │   ├── client-eks.ts         # Mock AWS EKS API
│   │   └── client-sts.ts         # Mock AWS STS API
│   ├── @kubernetes/
│   │   └── client-node.ts        # Mock Kubernetes client
│   ├── stream.ts                  # Mock PassThrough stream
│   └── fixtures.ts                # Test data fixtures
├── unit/                          # Unit tests
│   ├── DiscoveryService.test.ts   # ✅ 6 tests passing
│   ├── RegistrationService.test.ts # ✅ 4 tests passing
│   ├── NodePoolService.test.ts    # ✅ 11 tests passing
│   ├── SecretManagementService.test.ts # ✅ 4 tests passing
│   ├── ClusterUtils.test.ts       # ✅ 9 tests passing
│   └── CellDeletionService.test.ts # ✅ 12 tests passing
└── setup.ts                       # Jest setup file
```

## Running Tests

### Run all tests
```bash
pnpm test
```

### Run specific test file
```bash
pnpm test DiscoveryService
```

### Run tests in watch mode
```bash
pnpm test -- --watch
```

### Run tests with coverage
```bash
pnpm test -- --coverage
```

## Test Categories

### Unit Tests

#### Service Layer Tests
- **DiscoveryService**: Tests multi-provider cluster discovery with parallel execution and error handling
- **RegistrationService**: Tests ArgoCD cluster registration, deregistration, and cleanup
- **NodePoolService**: Tests node pool creation for managed and BYOA clusters
- **SecretManagementService**: Tests PagerDuty and VMUser secret management

#### Provider Tests
- **GCPDiscovery**: Tests GKE cluster discovery with proper label filtering
- **AWSDiscovery**: Tests EKS cluster discovery with tag validation
- **BYOACredentials**: Tests credential exchange for AWS STS and GCP Workload Identity

#### Utility Tests
- **ClusterUtils**: Tests cluster helper functions (isManagedCluster, isGCPCluster, etc.)

### Integration Tests
- **ClusterDiscoveryWorkflow**: Tests the complete discovery workflow from discovery to registration

## Mocking Strategy

### External Providers Mocked

1. **@google-cloud/container** - GCP Container API
   - ClusterManagerClient
   - listClusters
   - createNodePool
   - listNodePools

2. **@aws-sdk/client-eks** - AWS EKS API
   - EKSClient
   - ListClustersCommand
   - DescribeClusterCommand
   - CreateNodegroupCommand

3. **@aws-sdk/client-sts** - AWS STS API
   - STSClient
   - AssumeRoleWithWebIdentityCommand

4. **@kubernetes/client-node** - Kubernetes Client
   - KubeConfig
   - CoreV1Api
   - BatchV1Api
   - Exec

5. **google-auth-library** - Google Auth
   - OAuth2Client
   - Impersonated
   - GoogleAuth

### Mock Implementation

Mocks are organized in `tests/__mocks__/` directory mirroring the package structure. Jest automatically uses these mocks when the packages are imported in tests.

Example:
```typescript
// tests/__mocks__/@google-cloud/container.ts
export class ClusterManagerClient {
  listClusters = jest.fn();
  createNodePool = jest.fn();
}
```

## Test Fixtures

Reusable test data is defined in `tests/__mocks__/fixtures.ts`:

- **mockGCPCluster**: Sample GCP GKE cluster
- **mockAWSCluster**: Sample AWS EKS cluster
- **mockBYOACluster**: Sample BYOA cluster
- **mockAzureCluster**: Sample Azure AKS cluster
- **mockBastionCluster**: Sample bastion cluster

## Writing New Tests

### 1. Unit Test Template

```typescript
import { YourService } from '../../src/services/YourService';
import { dependency } from '../../src/some/dependency';

jest.mock('../../src/some/dependency');

describe('YourService', () => {
  let service: YourService;

  beforeEach(() => {
    service = new YourService();
    jest.clearAllMocks();
  });

  describe('methodName', () => {
    it('should do something', async () => {
      // Arrange
      const mockDependency = jest.mocked(dependency);
      mockDependency.someFunction.mockResolvedValue('result');

      // Act
      const result = await service.methodName();

      // Assert
      expect(result).toBe('expected');
      expect(mockDependency.someFunction).toHaveBeenCalledWith('args');
    });
  });
});
```

### 2. Integration Test Template

```typescript
import { ServiceA } from '../../src/services/ServiceA';
import { ServiceB } from '../../src/services/ServiceB';

jest.mock('../../src/services/ServiceB');

describe('Service Integration', () => {
  it('should integrate services correctly', async () => {
    // Arrange
    const mockServiceB = new ServiceB() as jest.Mocked<ServiceB>;
    mockServiceB.method.mockResolvedValue('result');

    const serviceA = new ServiceA();

    // Act
    await serviceA.workflow();

    // Assert
    expect(mockServiceB.method).toHaveBeenCalled();
  });
});
```

## Best Practices

1. **Mock External Dependencies**: Always mock external APIs and services
2. **Use Fixtures**: Reuse test data from fixtures.ts
3. **Test Error Handling**: Verify services handle errors gracefully
4. **Test Edge Cases**: Empty arrays, null values, missing properties
5. **Clear Mocks**: Use `jest.clearAllMocks()` in beforeEach
6. **Descriptive Names**: Use clear test descriptions ("should X when Y")
7. **Arrange-Act-Assert**: Structure tests clearly
8. **Async Handling**: Always await async operations in tests

## Coverage Goals

- **Unit Tests**: >80% coverage for all services
- **Integration Tests**: Cover main workflows
- **Error Cases**: Test error handling paths
- **Edge Cases**: Test boundary conditions

## CI/CD Integration

Tests run automatically on:
- Pull request creation
- Push to main/dev branches
- Before deployment

Failed tests block deployment.

## Troubleshooting

### Mock Not Working
```bash
# Clear jest cache
pnpm test -- --clearCache
```

### Async Timeout
```bash
# Increase timeout in test
it('test name', async () => {
  // test code
}, 30000); // 30 second timeout
```

### Import Errors
Check that mocks match the actual package structure in `node_modules/`.
