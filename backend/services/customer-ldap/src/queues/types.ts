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

export interface InstanceUpdatedJobData {
  instanceId: string;
  subscriptionId: string;
  timestamp: number;
}

export interface InstanceRestoredJobData {
  instanceId: string;
  subscriptionId: string;
  sourceInstanceId?: string;
  timestamp: number;
}
