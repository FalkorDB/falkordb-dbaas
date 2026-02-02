/**
 * Base error class for cluster discovery errors
 */
export class ClusterDiscoveryError extends Error {
  constructor(
    message: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when cluster discovery fails
 */
export class DiscoveryError extends ClusterDiscoveryError {
  constructor(
    message: string,
    public readonly provider: string,
    context?: Record<string, unknown>,
  ) {
    super(message, { ...context, provider });
    this.name = 'DiscoveryError';
  }
}

/**
 * Error thrown when cluster registration fails
 */
export class RegistrationError extends ClusterDiscoveryError {
  constructor(
    message: string,
    public readonly clusterName: string,
    context?: Record<string, unknown>,
  ) {
    super(message, { ...context, clusterName });
    this.name = 'RegistrationError';
  }
}

/**
 * Error thrown when node pool creation fails
 */
export class NodePoolError extends ClusterDiscoveryError {
  constructor(
    message: string,
    public readonly clusterName: string,
    context?: Record<string, unknown>,
  ) {
    super(message, { ...context, clusterName });
    this.name = 'NodePoolError';
  }
}

/**
 * Error thrown when secret management fails
 */
export class SecretManagementError extends ClusterDiscoveryError {
  constructor(
    message: string,
    public readonly secretType: string,
    public readonly clusterName?: string,
    context?: Record<string, unknown>,
  ) {
    super(message, { ...context, secretType, clusterName });
    this.name = 'SecretManagementError';
  }
}

/**
 * Error thrown when K8s operations fail
 */
export class K8sError extends ClusterDiscoveryError {
  constructor(
    message: string,
    public readonly operation: string,
    context?: Record<string, unknown>,
  ) {
    super(message, { ...context, operation });
    this.name = 'K8sError';
  }
}

/**
 * Error thrown when credential operations fail
 */
export class CredentialError extends ClusterDiscoveryError {
  constructor(
    message: string,
    public readonly provider: string,
    context?: Record<string, unknown>,
  ) {
    super(message, { ...context, provider });
    this.name = 'CredentialError';
  }
}

/**
 * Error thrown when configuration is invalid
 */
export class ConfigurationError extends ClusterDiscoveryError {
  constructor(
    message: string,
    public readonly configKey: string,
    context?: Record<string, unknown>,
  ) {
    super(message, { ...context, configKey });
    this.name = 'ConfigurationError';
  }
}

/**
 * Error thrown when a timeout occurs
 */
export class TimeoutError extends ClusterDiscoveryError {
  constructor(
    message: string,
    public readonly timeoutMs: number,
    context?: Record<string, unknown>,
  ) {
    super(message, { ...context, timeoutMs });
    this.name = 'TimeoutError';
  }
}
