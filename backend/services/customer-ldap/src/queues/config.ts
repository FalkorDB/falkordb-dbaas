import { type JobsOptions } from 'bullmq';

// Queue names
export const QUEUE_NAMES = {
  INSTANCE_CREATED: 'customer-ldap_omnistrate_instance-created',
  INSTANCE_DELETED: 'customer-ldap_omnistrate_instance-deleted',
} as const;

// Job options with retry logic
// Retry for 24 hours with exponential backoff
export const JOB_OPTIONS: JobsOptions = {
  attempts: 100, // Max attempts
  backoff: {
    type: 'exponential',
    delay: 5000, // Start with 5 seconds
  },
  removeOnComplete: {
    age: 86400, // Keep completed jobs for 24 hours
    count: 100, // Keep last 100 completed jobs
  },
  removeOnFail: {
    age: 604800, // Keep failed jobs for 7 days
  },
};

// Worker options
export const WORKER_OPTIONS = {
  connection: undefined as any, // Will be set at runtime
  concurrency: 5, // Process up to 5 jobs concurrently
  limiter: {
    max: 10, // Max 10 jobs
    duration: 1000, // Per second
  },
};

// Job timeout: 24 hours in milliseconds
export const JOB_TIMEOUT_MS = 24 * 60 * 60 * 1000;
