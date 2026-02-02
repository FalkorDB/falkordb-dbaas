// Job data types
export interface InstanceCreatedJobData {
  instanceId: string;
  subscriptionId: string;
  timestamp: number;
}

export interface InstanceDeletedJobData {
  instanceId: string;
  subscriptionId: string;
  timestamp: number;
}
