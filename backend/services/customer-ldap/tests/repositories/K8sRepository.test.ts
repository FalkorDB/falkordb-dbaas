import { K8sRepository } from '../../src/repositories/k8s/K8sRepository';
import pino from 'pino';

describe('K8sRepository', () => {
  let repository: K8sRepository;
  let logger: pino.Logger;

  beforeEach(() => {
    logger = pino({ level: 'silent' });
    repository = new K8sRepository({ logger });
  });

  it('constructs', () => {
    expect(repository).toBeInstanceOf(K8sRepository);
  });

  describe('createPortForward', () => {
    // Note: createPortForward doesn't validate parameters - it relies on k8s client
    // to throw errors for invalid input. Add integration tests with real k8s clusters
    // to test error handling.
  });
});
