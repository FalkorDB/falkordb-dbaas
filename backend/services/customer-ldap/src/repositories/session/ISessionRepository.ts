export interface ISessionRepository {
  createSession(data: SessionData): string;
  validateSession(cookie: string): boolean;
  decodeSession(cookie: string): SessionData | null;
}

export interface SessionData {
  userId: string;
  subscriptionId: string;
  instanceId: string;
  cloudProvider: 'gcp' | 'aws' | 'azure';
  region: string;
  k8sClusterName: string;
  role: 'root' | 'writer' | 'reader';
}

export const ISessionRepository = {
  repositoryName: 'ISessionRepository',
};
